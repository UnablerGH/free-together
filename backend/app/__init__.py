import os
import firebase_admin
from flask import Flask, app
from firebase_admin import credentials, initialize_app
from .config import Config
from .auth import auth_bp
from .users.routes import users_bp
from .events.routes import events_bp
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.config.from_object(Config)

    # Initialize Firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate(app.config['FIREBASE_CRED_PATH'])
        initialize_app(cred, {
            'projectId': app.config['FIREBASE_PROJECT_ID'],
        })

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(events_bp, url_prefix='/api/v1/events')

    # Health check route
    @app.route('/healthz', methods=['GET'])
    def health_check():
        return {'status': 'ok'}, 200

    return app



