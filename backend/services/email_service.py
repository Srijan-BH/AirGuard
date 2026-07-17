import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_alert_email(to_email, city, aqi):
    sender_email = os.getenv("SMTP_EMAIL", "alerts@airguard.ai")
    sender_password = os.getenv("SMTP_PASSWORD", "dummy_pass")
    
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = f"URGENT: Dangerous Air Quality Alert in {city}"
    
    body = f"""
    Dear User,
    
    This is an automated alert from AirGuard AI.
    The current Air Quality Index (OpenWeather Scale) in {city} has reached a dangerous level of {aqi} out of 5.
    
    Please take immediate precautions:
    - Avoid outdoor activities.
    - Keep windows closed.
    - Use air purifiers if available.
    
    Stay safe,
    AirGuard AI Team
    """
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        # In a real environment, you'd connect to an actual SMTP server.
        # server = smtplib.SMTP('smtp.gmail.com', 587)
        # server.starttls()
        # server.login(sender_email, sender_password)
        # text = msg.as_string()
        # server.sendmail(sender_email, to_email, text)
        # server.quit()
        print(f"-> [Simulated] Alert email successfully sent to {to_email} for {city} (AQI: {aqi})")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
