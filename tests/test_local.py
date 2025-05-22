import requests

BASE = "http://localhost:5000"

TOKEN = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImF1dGhfdGltZSI6MTc0NzkwMTI0OCwidXNlcl9pZCI6IjNucmtqS1BZS2pKTER3VjRlRFNmNGpVYUF5VHEiLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RAZXhhbXBsZS5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9LCJpYXQiOjE3NDc5MDEyNDgsImV4cCI6MTc0NzkwNDg0OCwiYXVkIjoiZnJlZS10b2dldGhlci1kZXYiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vZnJlZS10b2dldGhlci1kZXYiLCJzdWIiOiIzbnJraktQWUtqSkxEd1Y0ZURTZjRqVWFBeVRxIn0."  # from Emulator UI

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

# Test /users/me
res = requests.get(f"{BASE}/api/v1/users/me", headers=headers)
print("GET /users/me", res.status_code, res.json())

# Test /events
payload = {
    "name": "Code review",
    "type": "once",
    "timezone": "Europe/Warsaw",
    "access": "public"
}
res = requests.post(f"{BASE}/api/v1/events", headers=headers, json=payload)
print("POST /events", res.status_code, res.json())
