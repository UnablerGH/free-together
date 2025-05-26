from flask import Blueprint, request, jsonify, g
from firebase_admin import firestore, auth
from firebase_admin import credentials, initialize_app
from google.cloud.firestore_v1 import SERVER_TIMESTAMP
from google.cloud.firestore_v1 import ArrayUnion
from pydantic import ValidationError
from ..middleware import auth_required
from ..schemas.event import EventCreateModel
from ..schemas.response import ResponseCreateModel

# Firestore initialization (ensure this only runs once)
# This snippet assumes credentials initialized in app factory

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

    # Events I created
    created_q = db.collection('events').where('createdBy', '==', uid).stream()
    # Events I'm invited to (by email)
    user_email = g.current_user.get('email')
    invited_q = db.collection('events').where('invitees', 'array_contains', user_email).stream() if user_email else []

    events = []
    for doc in created_q:
        e = doc.to_dict()
        e['eventId'] = doc.id
        e['isOwner'] = True
        events.append(e)

    for doc in invited_q:
        if doc.id in [e['eventId'] for e in events]:
            continue
        e = doc.to_dict()
        e['eventId'] = doc.id
        e['isOwner'] = False
        events.append(e)

    return jsonify(events), 200

@events_bp.route('/<event_id>', methods=['GET'])
@auth_required
def get_event(event_id):
    db = firestore.client()
    uid = g.current_user['uid']
    doc = db.collection('events').document(event_id).get()
    if not doc.exists:
        return jsonify({'message': 'Event not found'}), 404
    e = doc.to_dict()
    e['eventId'] = doc.id
    e['isOwner'] = (e.get('createdBy') == uid)
    return jsonify(e), 200

@events_bp.route('/<event_id>', methods=['DELETE'])
@auth_required
def delete_event(event_id):
    db = firestore.client()
    doc_ref = db.collection('events').document(event_id)
    doc = doc_ref.get()
    if not doc.exists:
        return jsonify({'message': 'Event not found'}), 404
    event = doc.to_dict()
    if event.get('createdBy') != g.current_user['uid']:
        return jsonify({'message': 'Forbidden'}), 403
    # Delete responses
    for resp in doc_ref.collection('responses').stream():
        doc_ref.collection('responses').document(resp.id).delete()
    # Delete event
    doc_ref.delete()
    return jsonify({'message': 'Event deleted'}), 200

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
        r = doc.to_dict()
        r['responseId'] = doc.id
        responses.append(r)
    return jsonify(responses), 200

@events_bp.route('/<event_id>/invite', methods=['POST'])
@auth_required
def invite_user(event_id):
    db = firestore.client()
    uid = g.current_user['uid']
    doc_ref = db.collection('events').document(event_id)
    ev = doc_ref.get()
    if not ev.exists:
        return jsonify({'message': 'Event not found'}), 404
    if ev.to_dict().get('createdBy') != uid:
        return jsonify({'message': 'Forbidden'}), 403
    
    data = request.get_json() or {}
    
    # Support both single email and multiple emails
    emails = data.get('emails', [])
    single_email = data.get('email')
    
    if single_email:
        emails = [single_email]
    
    if not emails:
        return jsonify({'error': 'No emails provided'}), 400
    
    valid_emails = []
    invalid_emails = []
    
    for email in emails:
        try:
            # Verify the email corresponds to a real user
            user = auth.get_user_by_email(email)
            valid_emails.append(email)
        except auth.UserNotFoundError:
            invalid_emails.append(email)
    
    if valid_emails:
        doc_ref.update({ 'invitees': ArrayUnion(valid_emails) })
    
    response_message = f'Successfully invited {len(valid_emails)} user(s)'
    if invalid_emails:
        response_message += f'. Users not found: {", ".join(invalid_emails)}'
    
    return jsonify({
        'message': response_message,
        'invited_count': len(valid_emails),
        'not_found': invalid_emails
    }), 200
