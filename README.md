# FreeTogether Backend

This is the backend for **FreeTogether**, a collaborative scheduling and availability coordination platform. Built with **Flask**, **Firebase (Emulators)**, and **Pydantic**, it follows clean architecture principles and provides a RESTful API.

---

## 📦 Project Structure

free-together-backend/
├── app/
│ ├── init.py # App factory
│ ├── config.py # Environment & Firebase config
│ ├── auth.py # Auth routes (signup, login)
│ ├── users/ # User-related routes
│ └── events/ # Event-related routes
├── run.py # App entrypoint
├── .env # Local environment config
├── firebase.json # Emulator config
├── requirements.txt # Python dependencies
└── README.md

---

## 🚀 Quick Start (Local Dev)

### 1. Clone and Install

```bash
git clone https://github.com/yourname/freetogether-backend.git
cd freetogether-backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt


2. Firebase Setup (Free)
Go to Firebase Console

Create a project (free-together-dev)

Generate a service account key
Go to: ⚙️ Project Settings → Service Accounts → Generate new private key

Save as: serviceAccountKey.json in your root folder

3. Create .env

FIREBASE_CRED_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=free-together-dev
SECRET_KEY=dev-secret

4. Initialize Emulators
Install Firebase tools:

npm install -g firebase-tools
firebase login
firebase init emulators

firebase emulators:start --only auth,firestore

5. Run the Flask Server

# Linux/macOS
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export FIRESTORE_EMULATOR_HOST=localhost:8080

# Windows PowerShell
$Env:FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099"
$Env:FIRESTORE_EMULATOR_HOST = "localhost:8080"

# Start app
python run.py

 Health Check

 GET /healthz
Response: 200 OK
{
  "status": "ok"
}


📘 API Overview (WIP)
Endpoint	Method	Description
/api/v1/auth/signup	POST	Create a new user
/api/v1/users/me	GET	Get current user profile
/api/v1/events	POST	Create a new event
/api/v1/healthz	GET	Health check