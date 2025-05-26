from flask import Blueprint, request, jsonify, g, current_app
from firebase_admin import auth
from ..models import UserCreate
from ..middleware import auth_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST', 'OPTIONS'])
def signup():
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        return response, 200
        
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400
            
        data = UserCreate(**request.json)
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=data.email,
            password=data.password,
            display_name=data.username
        )
        
        return jsonify({'uid': user.uid}), 201
    except ValueError as e:
        current_app.logger.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 422
    except Exception as e:
        current_app.logger.error(f"Signup error: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@auth_bp.route('/me', methods=['GET', 'OPTIONS'])
def get_current_user():
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        return response, 200
    
    # Apply auth_required logic manually for GET requests
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
    except Exception as e:
        return jsonify({'error': 'Invalid token'}), 401
        
    try:
        if not hasattr(g, 'current_user'):
            current_app.logger.error("No current_user in g object")
            return jsonify({'error': 'No authenticated user'}), 401
            
        current_app.logger.info(f"Getting user data for uid: {g.current_user['uid']}")
        user = auth.get_user(g.current_user['uid'])
        
        response_data = {
            'uid': user.uid,
            'email': user.email,
            'username': user.display_name
        }
        current_app.logger.info(f"User data retrieved successfully: {response_data}")
        
        return jsonify(response_data)
    except Exception as e:
        current_app.logger.error(f"Get current user error: {str(e)}")
        return jsonify({'error': str(e)}), 401 