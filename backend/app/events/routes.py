from flask import Blueprint, request, jsonify, g
from firebase_admin import firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
from pydantic import ValidationError
from ..middleware import auth_required
from ..schemas.event import EventCreateModel
from ..schemas.response import ResponseCreateModel

events_bp = Blueprint('events', __name__)
 
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

@events_bp.route('', methods=['GET'])
@auth_required
def list_events():
    db = firestore.client()
    uid = g.current_user['uid']
    docs = db.collection('events').where('createdBy', '==', uid).stream()
    events = []
    for doc in docs:
        e = doc.to_dict(); e['eventId'] = doc.id
        events.append(e)
    return jsonify(events), 200


@events_bp.route('/<event_id>', methods=['GET'])
@auth_required
def get_event(event_id):
    db = firestore.client()
    doc = db.collection('events').document(event_id).get()
    if not doc.exists:
        return jsonify({'message': 'Event not found'}), 404
    e = doc.to_dict(); e['eventId'] = doc.id
    return jsonify(e), 200


@events_bp.route('/<event_id>/responses', methods=['POST'])
@auth_required
def create_response(event_id):
    try:
        payload = ResponseCreateModel(**request.get_json())
    except ValidationError as e:
        return jsonify({'errors': e.errors()}), 422

    db = firestore.client()
    ref = db.collection('events').document(event_id).collection('responses').document(g.current_user['uid'])
    ref.set({
        'availability': payload.availability,
        'comments': payload.comments,
        'userId': g.current_user['uid'],
        'updatedAt': SERVER_TIMESTAMP
    })
    return jsonify({'responseId': g.current_user['uid']}), 201


@events_bp.route('/<event_id>/responses', methods=['GET'])
@auth_required
def list_responses(event_id):
    db = firestore.client()
    docs = db.collection('events').document(event_id).collection('responses').stream()
    responses = []
    for doc in docs:
        r = doc.to_dict(); r['responseId'] = doc.id
        responses.append(r)
    return jsonify(responses), 200