# FreeTogether

FreeTogether is a collaborative scheduling platform that helps groups find the best time to meet. It allows users to create events, invite others, and respond with their availability.

## Features

- User authentication with Firebase
- Create and manage events
- Set availability for time slots
- Add comments to time slots
- View responses from all participants
- Support for one-time and weekly events
- Timezone support
- Public and restricted access levels

## Tech Stack

### Backend
- Flask (Python)
- Firebase Authentication
- Firebase Firestore
- Pydantic for data validation

### Frontend
- React
- Material-UI
- Firebase SDK
- Axios for API calls
- Zustand for state management

## Prerequisites

- Python 3.8+
- Node.js 16+
- Firebase account
- Firebase project with Authentication and Firestore enabled

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/freetogether.git
cd freetogether
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Configure Firebase:
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Download the service account key and save it as `backend/serviceAccountKey.json`
   - Create a `.env` file in the frontend directory with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Development

- Backend API runs on `http://localhost:5000`
- Frontend development server runs on `http://localhost:3000`
- API documentation is available at `http://localhost:5000/api/v1/docs`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.