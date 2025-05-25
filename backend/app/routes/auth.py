from flask import Blueprint, request, jsonify
from firebase_admin import auth
from ..models import UserCreate
from ..middleware import require_auth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = UserCreate(**request.json)
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=data.email,
            password=data.password,
            display_name=data.username
        )
        
        return jsonify({'uid': user.uid}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 422

@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    try:
        user = auth.get_user(g.current_user['uid'])
        return jsonify({
            'uid': user.uid,
            'email': user.email,
            'username': user.display_name
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 401 