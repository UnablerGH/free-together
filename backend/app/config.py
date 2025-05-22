import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    FIREBASE_CRED_PATH = os.getenv('FIREBASE_CRED_PATH')
    FIREBASE_PROJECT_ID = os.getenv('FIREBASE_PROJECT_ID')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret')