import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FIREBASE_CRED_PATH = os.getenv('FIREBASE_CRED_PATH')
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID')
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = ['http://localhost:3000']
    CORS_SUPPORTS_CREDENTIALS = True