# E-Paper Admin Panel

Full-stack application for managing E-Paper clients.

## Project Structure

```
epaper/
├── backend/          # Node.js/Express backend
│   ├── models/      # MongoDB models
│   ├── routes/      # API routes
│   └── server.js    # Main server file
└── whitelabelfrontend/  # React frontend
    ├── src/
    │   ├── components/  # React components
    │   └── services/    # API service layer
    └── ...
```

## Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `backend` folder:
```
MONGODB_URI=mongodb+srv://websitedogy_db_user:Zealstar_02@cluster0.p6nxafh.mongodb.net/epaper_db?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd whitelabelfrontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create `.env` file in `whitelabelfrontend` folder if backend is on different URL:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Features

- ✅ Super Admin Panel with sidebar navigation
- ✅ Add E-Paper Client form with validation
- ✅ MongoDB database integration
- ✅ RESTful API endpoints
- ✅ Responsive design with Tailwind CSS
- ✅ Professional UI/UX

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)

"# epaper" 
"# MERN_whitelabel_epaper" 
