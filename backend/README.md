# E-Paper Backend Server

Backend API server for the E-Paper Admin Panel.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` folder with the following content:

```
MONGODB_URI=mongodb+srv://websitedogy_db_user:Zealstar_02@cluster0.p6nxafh.mongodb.net/epaper_db?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=development
```

### 3. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Clients
- `POST /api/clients` - Create a new client
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get a single client by ID
- `PUT /api/clients/:id` - Update a client
- `DELETE /api/clients/:id` - Delete a client

## Database

The application uses MongoDB. The connection string is configured in the `.env` file.

