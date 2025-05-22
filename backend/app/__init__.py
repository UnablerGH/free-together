import os
from flask import Flask
from firebase_admin import credentials, initialize_app
from .config import Config
from .auth import auth_bp
from .users.routes import users_bp
from .events.routes import events_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize Firebase
    cred = credentials.Certificate(app.config['FIREBASE_CRED_PATH'])
    initialize_app(cred, {
        'projectId': app.config['FIREBASE_PROJECT_ID'],
    })

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(events_bp, url_prefix='/api/v1/events')

    return app