from flask import Blueprint, jsonify

users_bp = Blueprint('users', __name__)

@users_bp.route('/me', methods=['GET'])
def get_profile():
    # TODO: verify token middleware to set current_user
    return jsonify({'message': 'User profile endpoint'})