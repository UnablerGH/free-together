from flask import Blueprint, jsonify, g
from ..middleware import auth_required
 
users_bp = Blueprint('users', __name__)
 

@users_bp.route('/me', methods=['GET'])
@auth_required
def get_profile():
    user = g.current_user
    return jsonify({
        'uid': user['uid'],
        'email': user.get('email'),
        'name': user.get('name') or user.get('display_name')
    })