from flask import Blueprint, jsonify, request
from utils.auth import token_required
from models import mongo
import datetime
from services.openweather import OpenWeatherService
from services.email_service import send_alert_email
from services.pdf_generator import generate_aqi_report
import os
from twilio.rest import Client

api_bp = Blueprint('api', __name__)

@api_bp.route('/predict', methods=['POST'])
@token_required
def predict_aqi(current_user):
    data = request.json
    city = data.get("city", "Unknown")
    prediction_result = { "AQI": 142, "PM25": 55.4, "city": city }
    
    mongo.db.predictions.insert_one({
        "user_id": current_user['_id'],
        "city": city,
        "AQI": prediction_result["AQI"],
        "PM25": prediction_result["PM25"],
        "prediction_date": datetime.datetime.utcnow()
    })
    return jsonify(prediction_result), 200

@api_bp.route('/history', methods=['GET'])
@token_required
def get_history(current_user):
    city = request.args.get('city')
    query = {"user_id": current_user['_id']}
    if city: query["city"] = city
        
    history = list(mongo.db.predictions.find(query).sort("prediction_date", -1).limit(50))
    for item in history:
        item['_id'] = str(item['_id'])
        item['user_id'] = str(item['user_id'])
    return jsonify(history), 200

@api_bp.route('/live-aqi', methods=['GET'])
@token_required
def live_aqi(current_user):
    city = request.args.get('city')
    if not city:
        return jsonify({"message": "City parameter required"}), 400
        
    owm_service = OpenWeatherService()
    live_data, error = owm_service.fetch_all_city_data(city)
    
    if error:
        return jsonify({"message": error}), 500
        
    db_data = live_data.copy()
    db_data['user_id'] = current_user['_id']
    mongo.db.live_measurements.insert_one(db_data)
    
    # ALERT SYSTEM INTEGRATION
    # OpenWeather AQI scale is 1-5. 4 and 5 are Poor/Hazardous.
    if live_data['AQI'] >= 4:
        send_alert_email(current_user['email'], city, live_data['AQI'])
        mongo.db.alerts.insert_one({
            "user_id": current_user['_id'],
            "AQI_level": live_data['AQI'],
            "warning_message": f"Dangerous AQI in {city} (Scale {live_data['AQI']}/5)",
            "city": city,
            "timestamp": datetime.datetime.utcnow()
        })
        
    return jsonify(live_data), 200

@api_bp.route('/generate-pdf', methods=['POST'])
@token_required
def generate_pdf(current_user):
    data = request.json
    city = data.get("city")
    
    if not city:
        return jsonify({"message": "City parameter required"}), 400

    latest_data = mongo.db.live_measurements.find_one(
        {"user_id": current_user['_id'], "city": city},
        sort=[("timestamp", -1)]
    )
    
    if not latest_data:
        return jsonify({"message": "No data found for this city to generate report"}), 404
        
    user_details = {
        "name": current_user.get("name", "User"),
        "email": current_user.get("email", "unknown@example.com")
    }

    filepath, filename = generate_aqi_report(user_details, latest_data)
    
    report_record = {
        "user_id": current_user['_id'],
        "report_path": filepath,
        "filename": filename,
        "city": city,
        "generated_date": datetime.datetime.utcnow()
    }
    mongo.db.reports.insert_one(report_record)
    
    return jsonify({"message": "PDF Report Generated", "url": f"/reports/download/{filename}"}), 200

@api_bp.route('/alerts', methods=['GET'])
@token_required
def handle_alerts(current_user):
    alerts = list(mongo.db.alerts.find({"user_id": current_user['_id']}).sort("timestamp", -1).limit(20))
    for alert in alerts:
        alert['_id'] = str(alert['_id'])
        alert['user_id'] = str(alert['user_id'])
    return jsonify(alerts), 200

@api_bp.route('/send-sms', methods=['POST'])
@token_required
def send_sms(current_user):

    data = request.json
    city = data.get("city", "Unknown Location")
    aqi = data.get("aqi", "Unknown")

    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_phone = os.getenv("TWILIO_PHONE_NUMBER")
    subscribers_str = os.getenv("SUBSCRIBED_PHONE_NUMBERS", "")

    if not account_sid or not auth_token or not twilio_phone:
        return jsonify({"message": "Twilio credentials not configured in backend .env"}), 500

    subscribers = [s.strip() for s in subscribers_str.split(",") if s.strip()]
    if not subscribers:
        return jsonify({"message": "No subscribed phone numbers configured in .env"}), 400

    try:
        client = Client(account_sid, auth_token)
        message_body = f"EMERGENCY ALERT: AirGuard AI has detected hazardous air quality (AQI: {aqi}) in {city}. Please stay indoors, close windows, and use air filtration."
        
        sent_count = 0
        for phone in subscribers:
            try:
                client.messages.create(
                    body=message_body,
                    from_=twilio_phone,
                    to=phone
                )
                sent_count += 1
            except Exception as e:
                # Log individual failures but continue the broadcast
                print(f"Failed to send to {phone}: {str(e)}")
                
        return jsonify({"message": "Broadcast complete", "count": sent_count}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@api_bp.route('/users', methods=['GET'])
@token_required
def get_all_users(current_user):
    # Ideally check if current_user role is Admin, but keeping it simple for the demo
    users_cursor = mongo.db.users.find({}, {"password": 0}) # Exclude password hashes
    users_list = []
    for u in users_cursor:
        u['_id'] = str(u['_id'])
        users_list.append({
            "id": u['_id'],
            "name": u.get("name", "Unknown"),
            "email": u.get("email", "Unknown"),
            "role": u.get("role", "User"),
            "status": "Active" # Assuming active for demo
        })
    return jsonify(users_list), 200
