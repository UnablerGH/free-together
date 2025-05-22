import os
import pytest
from unittest.mock import patch

@patch("firebase_admin.auth.verify_id_token")
def test_get_profile(mock_verify, client):
    mock_verify.return_value = {"uid": "abc", "email": "me@example.com"}
    res = client.get("/api/v1/users/me", headers={
        "Authorization": "Bearer test-token"
    })
    assert res.status_code == 200
    assert res.get_json()["email"] == "me@example.com"