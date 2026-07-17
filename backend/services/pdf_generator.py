import os
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generate_aqi_report(user_details, aqi_data, output_dir="reports"):
    # Ensure reports directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    safe_name = user_details['name'].replace(' ', '_')
    filename = f"AQI_Report_{safe_name}_{datetime.datetime.now().strftime('%Y%m%d%H%M')}.pdf"
    filepath = os.path.join(output_dir, filename)
    
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, "AirGuard AI - Comprehensive Air Quality Report")
    
    # User & Location Details
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 90, f"Prepared For: {user_details['name']} ({user_details['email']})")
    c.drawString(50, height - 110, f"Location: {aqi_data['city']}")
    c.drawString(50, height - 130, f"Date generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # AQI Data
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 170, "Air Quality Metrics (OpenWeather API)")
    c.setFont("Helvetica", 12)
    
    metrics = [
        f"AQI: {aqi_data.get('AQI', 'N/A')}",
        f"PM2.5: {aqi_data.get('PM25', 'N/A')} µg/m³",
        f"PM10: {aqi_data.get('PM10', 'N/A')} µg/m³",
        f"NO2: {aqi_data.get('NO2', 'N/A')} µg/m³",
        f"SO2: {aqi_data.get('SO2', 'N/A')} µg/m³",
        f"CO: {aqi_data.get('CO', 'N/A')} µg/m³",
        f"O3: {aqi_data.get('O3', 'N/A')} µg/m³"
    ]
    
    y = height - 200
    for metric in metrics:
        c.drawString(70, y, metric)
        y -= 20
        
    # Weather Data
    c.setFont("Helvetica-Bold", 14)
    y -= 20
    c.drawString(50, y, "Meteorological Conditions")
    c.setFont("Helvetica", 12)
    y -= 30
    c.drawString(70, y, f"Temperature: {aqi_data.get('Temperature', 'N/A')} °C")
    y -= 20
    c.drawString(70, y, f"Humidity: {aqi_data.get('Humidity', 'N/A')} %")
    y -= 20
    c.drawString(70, y, f"Wind Speed: {aqi_data.get('Wind_Speed', 'N/A')} m/s")
    
    # Placeholder for PDF Charts Note
    y -= 40
    c.setFont("Helvetica-Oblique", 10)
    c.drawString(50, y, "[Interactive charts are available exclusively via the online dashboard interface]")
    
    # Health Recommendations
    y -= 50
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Health Suggestions & Recommendations")
    c.setFont("Helvetica", 12)
    y -= 30
    
    aqi_val = int(aqi_data.get('AQI', 0))
    if aqi_val >= 4: # OpenWeather scale uses 1-5 where 4/5 is poor/very poor
        c.setFillColor(colors.red)
        c.drawString(50, y, "WARNING: HAZARDOUS AIR QUALITY DETECTED.")
        y -= 20
        c.setFillColor(colors.black)
        c.drawString(50, y, "- Avoid all prolonged or heavy outdoor exertion.")
        y -= 20
        c.drawString(50, y, "- Wear an N95 mask if you must go outside.")
        y -= 20
        c.drawString(50, y, "- Keep indoor air clean using purifiers.")
    elif aqi_val == 3:
        c.setFillColor(colors.orange)
        c.drawString(50, y, "CAUTION: Unhealthy for Sensitive Groups.")
        y -= 20
        c.setFillColor(colors.black)
        c.drawString(50, y, "- Sensitive individuals should reduce outdoor exertion.")
    else:
        c.setFillColor(colors.green)
        c.drawString(50, y, "Air quality is acceptable.")
        y -= 20
        c.setFillColor(colors.black)
        c.drawString(50, y, "- Enjoy normal outdoor activities safely.")
        
    c.save()
    return filepath, filename
