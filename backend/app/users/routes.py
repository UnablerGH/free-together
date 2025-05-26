from flask import Blueprint, jsonify, g, request
from ..middleware import auth_required
 
users_bp = Blueprint('users', __name__)
 

@users_bp.route('/me', methods=['GET', 'OPTIONS'])
def get_profile():
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        return response, 200
    
    # Apply auth_required logic manually for GET requests
    from firebase_admin import auth
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
    
    user = g.current_user
    return jsonify({
        'uid': user['uid'],
        'email': user.get('email'),
        'name': user.get('name') or user.get('display_name')
    })