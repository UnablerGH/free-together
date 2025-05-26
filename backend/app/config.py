import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FIREBASE_CRED_PATH = os.getenv('FIREBASE_CRED_PATH')
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID')
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev'
    CORS_HEADERS = 'Content-Type'
    
    # Production CORS settings - update with your actual frontend URL
    CORS_ORIGINS = [
        'http://localhost:3000',  # Development
        'https://your-app-name.vercel.app',  # Production - UPDATE THIS
        'https://freetogether.vercel.app',  # Example production URL
    ]
    CORS_SUPPORTS_CREDENTIALS = True