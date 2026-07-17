import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the parent AirGuard folder (one level up from /backend)
env_path = Path(__file__).resolve().parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from flask import Flask
from flask_cors import CORS
from models import mongo
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.api import api_bp
from config import Config

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.config.from_object(Config)

    # Explicitly set MONGO_URI so PyMongo can find it
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/airguard_db')
    app.config['MONGO_URI'] = mongo_uri

    # Initialize MongoDB
    mongo.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(api_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
