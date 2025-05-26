from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os
from dotenv import load_dotenv
from .config import Config
from .routes.auth import auth_bp
from .users.routes import users_bp
from .events.routes import events_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Simple CORS configuration for development
    CORS(app, 
         resources={r"/*": {
             "origins": "*",
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "Accept"],
             "expose_headers": ["Content-Type", "Authorization"],
             "max_age": 3600
         }})
    
    app.config.from_object(Config)

    # Initialize Firebase Admin
    try:
        # Check if Firebase is already initialized
        firebase_admin.get_app()
    except ValueError:
        # Initialize Firebase Admin with emulator settings for development
        if os.getenv('FLASK_ENV') == 'development':
            os.environ['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099'
            os.environ['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080'
            
        # Get the absolute path to serviceAccountKey.json
        current_dir = os.path.dirname(os.path.abspath(__file__))
        service_account_path = os.path.join(os.path.dirname(current_dir), 'serviceAccountKey.json')
        
        if not os.path.exists(service_account_path):
            raise FileNotFoundError(f"Firebase service account key not found at {service_account_path}")
            
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    
    # Initialize Firestore
    db = firestore.client()

    # Global OPTIONS handler
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = jsonify()
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
            response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            response.headers.add('Access-Control-Max-Age', '3600')
            return response

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(events_bp, url_prefix='/api/v1/events')

    # Health check route
    @app.route('/healthz', methods=['GET'])
    def health_check():
        return {'status': 'ok'}, 200

    return app



