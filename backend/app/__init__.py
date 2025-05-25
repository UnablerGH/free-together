from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from dotenv import load_dotenv
from .config import Config
from .auth import auth_bp
from .users.routes import users_bp
from .events.routes import events_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
    app.config.from_object(Config)

    # Initialize Firebase Admin with emulator settings
    if os.getenv('FLASK_ENV') == 'development':
        os.environ['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099'
        os.environ['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080'
        
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    
    # Initialize Firestore
    db = firestore.client()

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(events_bp, url_prefix='/api/v1/events')

    # Health check route
    @app.route('/healthz', methods=['GET'])
    def health_check():
        return {'status': 'ok'}, 200

    return app



