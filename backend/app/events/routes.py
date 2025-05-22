from flask import Blueprint, request, jsonify

events_bp = Blueprint('events', __name__)

@events_bp.route('', methods=['POST'])
def create_event():
    data = request.get_json()
    # TODO: Pydantic model validation
    return jsonify({'message': 'Event created'}), 201