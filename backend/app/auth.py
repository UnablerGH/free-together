from flask import Blueprint, request, jsonify
import firebase_admin.auth as auth
from pydantic import ValidationError
from .schemas.auth import SignupModel
 
auth_bp = Blueprint('auth', __name__)
 
@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        payload = SignupModel(**request.get_json())
    except ValidationError as e:
       return jsonify({'errors': e.errors()}), 422
    user = auth.create_user(
        email=payload.email,
        password=payload.password,
        display_name=payload.username
    )
    return jsonify({'uid': user.uid}), 201