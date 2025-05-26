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
        # Add owner info for created events
        e['ownerEmail'] = user_email
        try:
            current_user = auth.get_user(uid)
            e['ownerName'] = current_user.display_name or current_user.email
        except:
            e['ownerName'] = user_email
        events.append(e)

    for doc in invited_q:
        if doc.id in [e['eventId'] for e in events]:
            continue
        e = doc.to_dict()
        e['eventId'] = doc.id
        e['isOwner'] = False
        # Add owner info for invited events
        try:
            owner_user = auth.get_user(e.get('createdBy'))
            e['ownerEmail'] = owner_user.email
            e['ownerName'] = owner_user.display_name or owner_user.email
        except:
            e['ownerEmail'] = 'Unknown'
            e['ownerName'] = 'Unknown'
        events.append(e)

    return jsonify(events), 200

@events_bp.route('/<event_id>', methods=['GET'])
@auth_required
def get_event(event_id):
    db = firestore.client()
    uid = g.current_user['uid']
    user_email = g.current_user.get('email')
    
    doc = db.collection('events').document(event_id).get()
    if not doc.exists:
        return jsonify({'message': 'Event not found'}), 404
    
    e = doc.to_dict()
    e['eventId'] = doc.id
    e['isOwner'] = (e.get('createdBy') == uid)
    e['currentUserId'] = uid
    e['currentUserEmail'] = user_email
    
    # Add owner email information
    try:
        owner_user = auth.get_user(e.get('createdBy'))
        e['ownerEmail'] = owner_user.email
        e['ownerName'] = owner_user.display_name or owner_user.email
    except Exception as ex:
        logger.warning(f"Could not get owner info: {ex}")
        e['ownerEmail'] = 'Unknown'
        e['ownerName'] = 'Unknown'
    
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
    
    response_data = {
        'userId': g.current_user['uid'],
        'userEmail': g.current_user.get('email'),
        'updatedAt': SERVER_TIMESTAMP
    }
    
    # Handle When2Meet-style time slot availability
    if payload.timeSlots:
        response_data['timeSlots'] = payload.timeSlots
        # Get user info for display
        try:
            user = auth.get_user(g.current_user['uid'])
            response_data['userName'] = user.display_name or user.email
        except:
            response_data['userName'] = g.current_user.get('email', 'Unknown User')
    
    # Handle new RSVP system (for backward compatibility)
    if payload.rsvpStatus:
        response_data['rsvpStatus'] = payload.rsvpStatus
        response_data['comment'] = payload.comment or ''
    
    # Handle legacy availability system (for backward compatibility)
    if payload.availability:
        response_data['availability'] = payload.availability
        response_data['comments'] = payload.comments or {}
    
    ref.set(response_data)
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

@events_bp.route('/<event_id>/heatmap', methods=['GET'])
@auth_required
def get_heatmap_data(event_id):
    """Get heatmap data for When2Meet-style visualization"""
    db = firestore.client()
    
    # Check if user has access to this event
    event_doc = db.collection('events').document(event_id).get()
    if not event_doc.exists:
        return jsonify({'message': 'Event not found'}), 404
    
    event_data = event_doc.to_dict()
    uid = g.current_user['uid']
    user_email = g.current_user.get('email')
    
    # Check if user is owner or invited
    is_owner = event_data.get('createdBy') == uid
    is_invited = user_email in event_data.get('invitees', [])
    
    if not (is_owner or is_invited):
        return jsonify({'message': 'Access denied'}), 403
    
    # Get all responses with time slots
    responses = db.collection('events').document(event_id).collection('responses').stream()
    
    # Build heatmap data
    slot_counts = {}  # slot -> count
    user_responses = []  # list of {userName, timeSlots}
    
    for response_doc in responses:
        response_data = response_doc.to_dict()
        time_slots = response_data.get('timeSlots', [])
        user_name = response_data.get('userName', 'Unknown User')
        
        if time_slots:
            user_responses.append({
                'userName': user_name,
                'timeSlots': time_slots,
                'userId': response_data.get('userId')
            })
            
            # Count each slot
            for slot in time_slots:
                slot_counts[slot] = slot_counts.get(slot, 0) + 1
    
    # Generate time grid (7 days x 24 hours)
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    hours = list(range(24))  # 0-23
    
    heatmap_grid = []
    for day in days:
        day_data = []
        for hour in hours:
            slot_key = f"{day}_{hour}"
            count = slot_counts.get(slot_key, 0)
            day_data.append({
                'slot': slot_key,
                'count': count,
                'day': day,
                'hour': hour
            })
        heatmap_grid.append({
            'day': day,
            'slots': day_data
        })
    
    return jsonify({
        'heatmapGrid': heatmap_grid,
        'userResponses': user_responses,
        'totalResponses': len(user_responses),
        'maxCount': max(slot_counts.values()) if slot_counts else 0
    }), 200
