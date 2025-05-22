from functools import wraps
from flask import request, jsonify, g
import firebase_admin.auth as firebase_auth


def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'message':'Unauthorized'}), 401
        id_token = auth_header.split(' ', 1)[1]
        try:
            decoded = firebase_auth.verify_id_token(id_token)
            g.current_user = decoded
        except Exception:
            return jsonify({'message':'Invalid or expired token'}), 401
        return f(*args, **kwargs)
    return wrapper