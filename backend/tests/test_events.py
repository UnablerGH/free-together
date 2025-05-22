from unittest.mock import patch

@patch("firebase_admin.auth.verify_id_token")
@patch("firebase_admin.firestore.client")
def test_create_event(mock_db, mock_auth, client):
    mock_auth.return_value = {"uid": "abc"}
    mock_collection = mock_db.return_value.collection.return_value
    mock_doc = mock_collection.document.return_value
    mock_doc.id = "event123"

    res = client.post("/api/v1/events", headers={
        "Authorization": "Bearer token"
    }, json={
        "name": "Meeting",
        "type": "once",
        "timezone": "Europe/Warsaw",
        "access": "public"
    })

    assert res.status_code == 201
    assert res.get_json()["eventId"] == "event123"