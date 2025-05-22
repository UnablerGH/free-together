# backend/tests/test_auth.py
# probably needed $ export FIREBASE_CRED_PATH=backend/serviceAccountKey.json
import json
from types import SimpleNamespace
from unittest.mock import patch

@patch("firebase_admin.auth.create_user")
def test_signup(mock_create_user, client):
    # pretend create_user returns an object with a uid
    mock_create_user.return_value = SimpleNamespace(uid="fake-uid-123")
    res = client.post('/api/v1/auth/signup', json={
        "email": "unit@test.com",
        "password": "password123",
        "username": "unituser"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["uid"] == "fake-uid-123"
