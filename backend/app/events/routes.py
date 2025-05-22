from flask import Blueprint, request, jsonify
from flask import Blueprint, request, jsonify, g
from datetime import datetime
from pydantic import ValidationError
from firebase_admin import firestore
from ..middleware import auth_required
from ..schemas.event import EventCreateModel
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
 
events_bp = Blueprint('events', __name__)
 

@events_bp.route('', methods=['POST'])
@auth_required
def create_event():
    try:
        payload = EventCreateModel(**request.get_json())
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422
    db = firestore.client()
    doc_ref = db.collection('events').document()
    doc_ref.set({
        'name': payload.name,
        'type': payload.type,
        'timezone': payload.timezone,
        'access': payload.access,
        'endDate': payload.end_date,
        'invitees': payload.invitees,
        'createdBy': g.current_user['uid'],
        'createdAt': SERVER_TIMESTAMP,
        'closed': False
    })
    return jsonify({'eventId': doc_ref.id}), 201