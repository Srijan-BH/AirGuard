import os
import requests
import datetime
from flask import current_app

class OpenWeatherService:
    def __init__(self):
        # Fallback for dev purposes if not set in config
        self.api_key = current_app.config.get('OPENWEATHER_API_KEY') or os.getenv("OPENWEATHER_API_KEY", "dummy_api_key")
        self.geo_url = "http://api.openweathermap.org/geo/1.0/direct"
        self.air_url = "http://api.openweathermap.org/data/2.5/air_pollution"
        self.weather_url = "https://api.openweathermap.org/data/2.5/weather"

    def get_coordinates(self, city_name):
        try:
            params = {'q': city_name, 'limit': 1, 'appid': self.api_key}
            response = requests.get(self.geo_url, params=params)
            response.raise_for_status()
            data = response.json()
            if not data:
                return None, "City not found"
            return {"lat": data[0]['lat'], "lon": data[0]['lon'], "name": data[0]['name']}, None
        except requests.exceptions.RequestException as e:
            return None, f"Geocoding error: {str(e)}"

    def get_air_pollution(self, lat, lon):
        try:
            params = {'lat': lat, 'lon': lon, 'appid': self.api_key}
            response = requests.get(self.air_url, params=params)
            response.raise_for_status()
            return response.json(), None
        except requests.exceptions.RequestException as e:
            return None, f"Air pollution API error: {str(e)}"

    def get_weather(self, lat, lon):
        try:
            params = {'lat': lat, 'lon': lon, 'appid': self.api_key, 'units': 'metric'}
            response = requests.get(self.weather_url, params=params)
            response.raise_for_status()
            return response.json(), None
        except requests.exceptions.RequestException as e:
            return None, f"Weather API error: {str(e)}"

    def fetch_all_city_data(self, city_name):
        coords, err = self.get_coordinates(city_name)
        if err: return None, err

        lat, lon = coords['lat'], coords['lon']
        actual_city_name = coords['name']

        pollution_data, err = self.get_air_pollution(lat, lon)
        if err: return None, err

        weather_data, err = self.get_weather(lat, lon)
        if err: return None, err

        # Extract required values
        try:
            aqi = pollution_data['list'][0]['main']['aqi']
            components = pollution_data['list'][0]['components']
            temp = weather_data['main']['temp']
            humidity = weather_data['main']['humidity']
            wind_speed = weather_data['wind']['speed']

            result = {
                "city": actual_city_name,
                "lat": lat,
                "lon": lon,
                "AQI": aqi,
                "PM25": components.get("pm2_5", 0),
                "PM10": components.get("pm10", 0),
                "NO2": components.get("no2", 0),
                "SO2": components.get("so2", 0),
                "CO": components.get("co", 0),
                "Temperature": temp,
                "Humidity": humidity,
                "Wind_Speed": wind_speed,
                "timestamp": datetime.datetime.utcnow()
            }
            return result, None
        except (KeyError, IndexError) as e:
            return None, f"Data parsing error: {str(e)}"
