from flask import Blueprint, request, jsonify, g
from firebase_admin import firestore
from ..models import EventCreate, ResponseCreate
from ..middleware import require_auth
from datetime import datetime

events_bp = Blueprint('events', __name__)
db = firestore.client()

@events_bp.route('', methods=['POST'])
@require_auth
def create_event():
    try:
        data = EventCreate(**request.json)
        event_ref = db.collection('events').document()
        
        event_data = {
            'name': data.name,
            'type': data.type,
            'timezone': data.timezone,
            'access': data.access,
            'end_date': data.end_date,
            'invitees': data.invitees,
            'createdBy': g.current_user['uid'],
            'createdAt': datetime.utcnow(),
            'closed': False
        }
        
        event_ref.set(event_data)
        return jsonify({'eventId': event_ref.id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 422

@events_bp.route('', methods=['GET'])
@require_auth
def list_events():
    try:
        # Get events created by user
        created_events = db.collection('events').where('createdBy', '==', g.current_user['uid']).stream()
        
        # Get events where user is invited
        invited_events = db.collection('events').where('invitees', 'array_contains', g.current_user['uid']).stream()
        
        events = []
        for event in created_events:
            event_data = event.to_dict()
            event_data['eventId'] = event.id
            event_data['isOwner'] = True
            events.append(event_data)
            
        for event in invited_events:
            event_data = event.to_dict()
            event_data['eventId'] = event.id
            event_data['isOwner'] = False
            events.append(event_data)
            
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@events_bp.route('/<event_id>', methods=['GET'])
@require_auth
def get_event(event_id):
    try:
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        
        if not event.exists:
            return jsonify({'error': 'Event not found'}), 404
            
        event_data = event.to_dict()
        event_data['eventId'] = event.id
        event_data['isOwner'] = event_data['createdBy'] == g.current_user['uid']
        
        return jsonify(event_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@events_bp.route('/<event_id>/responses', methods=['POST'])
@require_auth
def submit_response(event_id):
    try:
        data = ResponseCreate(**request.json)
        response_ref = db.collection('events').document(event_id).collection('responses').document(g.current_user['uid'])
        
        response_data = {
            'availability': data.availability,
            'comments': data.comments,
            'userId': g.current_user['uid'],
            'updatedAt': datetime.utcnow()
        }
        
        response_ref.set(response_data)
        return jsonify({'responseId': g.current_user['uid']}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 422

@events_bp.route('/<event_id>/responses', methods=['GET'])
@require_auth
def get_responses(event_id):
    try:
        responses = db.collection('events').document(event_id).collection('responses').stream()
        
        response_list = []
        for response in responses:
            response_data = response.to_dict()
            response_data['responseId'] = response.id
            response_list.append(response_data)
            
        return jsonify(response_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500 