from functools import wraps
from flask import request, g, jsonify
import firebase_admin
from firebase_admin import auth

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No authorization header'}), 401

        token = auth_header.split('Bearer ')[1]
        try:
            decoded_token = auth.verify_id_token(token)
            g.current_user = {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email')
            }
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401

    return decorated_function