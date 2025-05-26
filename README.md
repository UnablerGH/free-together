# FreeTogether 🎉

A modern When2Meet-style scheduling application built with React and Flask.

## ✨ Features

- **When2Meet-style Interface**: Interactive time slot selection with drag-and-drop
- **Real-time Availability Heatmap**: Visual representation of group availability
- **Custom Time Settings**: Define your own business and evening hours
- **Firebase Authentication**: Secure user management
- **Event Management**: Create, schedule, and manage events
- **Calendar Integration**: Export to Google Calendar, Outlook, and ICS files
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Spotify-inspired modern UI with theme switching

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd freetogether
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   - Create `.env` files in both `backend/` and `frontend/` directories
   - See `DEPLOYMENT.md` for required environment variables

5. **Run the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python run.py

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## 🌐 Production Deployment

### Quick Deploy (Recommended)
- **Frontend**: Vercel
- **Backend**: Railway

### Pre-deployment Check
Run the deployment helper:
```bash
# Windows
deploy.bat

# Linux/Mac
./deploy.sh
```

### Full Deployment Guide
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete step-by-step instructions.

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Material-UI (MUI)** - Component library
- **Vite** - Fast build tool
- **Zustand** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Flask** - Python web framework
- **Firebase Admin** - Authentication and database
- **Pydantic** - Data validation
- **Flask-CORS** - Cross-origin resource sharing
- **Gunicorn** - Production WSGI server

### Database & Auth
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management

## 📁 Project Structure

```
freetogether/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── stores/         # Zustand stores
│   │   └── api.js          # API client
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Flask backend
│   ├── app/
│   │   ├── routes/         # API routes
│   │   ├── events/         # Event-specific logic
│   │   ├── users/          # User-specific logic
│   │   └── __init__.py     # App factory
│   ├── requirements.txt
│   ├── app.py             # Production entry point
│   └── Procfile           # Deployment configuration
├── DEPLOYMENT.md          # Deployment guide
├── deploy.bat            # Windows deployment helper
└── deploy.sh             # Linux/Mac deployment helper
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
FIREBASE_CRED_PATH=./serviceAccountKey.json
FIREBASE_PROJECT_ID=your-firebase-project-id
SECRET_KEY=your-secret-key
FLASK_ENV=production
PORT=5000
```

**Frontend (.env)**
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_API_URL=https://your-backend-url.railway.app/api/v1
```

## 🎯 Key Features Explained

### Time Slot Selection
- Interactive grid interface similar to When2Meet
- Support for "Available" and "Maybe" states
- Drag-and-drop selection
- Custom business/evening hour presets

### Availability Heatmap
- Color-coded visualization of group availability
- Hover tooltips showing available users
- Real-time updates as responses come in

### Event Management
- Create events with date ranges
- Invite users via email
- Schedule events based on availability
- Close/reopen availability collection

### Settings & Customization
- Custom business hours (default: 9 AM - 5 PM)
- Custom evening hours (default: 6 PM - 10 PM)
- Dark/light theme toggle
- Persistent user preferences

## 🔒 Security

- Firebase Authentication for secure user management
- JWT token-based API authentication
- CORS protection
- Input validation with Pydantic
- Environment-based configuration

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:

1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Verify all environment variables are set correctly
3. Check Firebase console for authentication issues
4. Review browser console for frontend errors
5. Check server logs for backend issues

## 🎉 Acknowledgments

- Inspired by When2Meet's simple and effective interface
- Built with modern web technologies for better performance and user experience
- Designed with accessibility and mobile-first principles