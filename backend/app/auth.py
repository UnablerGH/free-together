from flask import Blueprint, request, jsonify, current_app
import firebase_admin.auth as auth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    user = auth.create_user(
        email=data['email'],
        password=data['password'],
        display_name=data.get('username')
    )
    return jsonify({'uid': user.uid}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    # Client obtains ID token via Firebase SDK; backend can verify
    return jsonify({'message': 'Use Firebase client SDK to login.'}), 200