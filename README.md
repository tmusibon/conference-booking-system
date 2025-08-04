# Conference Room Booking System

A full-stack application for booking conference rooms with real-time availability updates using server-sent events (SSE).

## Setup

### Prerequisites

- Docker
- Node.js (v14+)
- Python 3.9

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend

   ```

2. Create and activate a virtual environment:
   python -m venv venv
   source venv/bin/activate

3. Install dependencies:
   pip install -r requirements.txt

4. Run Docker Compose:
   cd ..
   docker compose up --build

### Frontend Setup

# The frontend is containerized and runs automatically with docker compose up.

# To run manually:

1.  Navigate to the frontend directory:
    cd frontend

2.  Install dependencies:
    npm install

3.  Start the frontend:
    npm start

### API Endpoints

- GET /rooms: List all rooms.

Response: [{id: number, name: string, location: string, equipment: string, capacity: number}, ...]

- GET /users: List all users.

Response: [{email: string, name: string}, ...]

- GET /bookings: List all bookings.

Response: [{id: number, room_id: number, start_time: string, end_time: string, title: string, invitees: string[]}, ...]

- POST /bookings: Create a booking.

Request: {room_id: number, start_time: string, end_time: string, title: string, invitees: string[]}
Response: {id: number, room_id: number, start_time: string, end_time: string, title: string, invitees: string[]}

- GET /bookings/{id}: Get booking details.

Response: {id: number, room_id: number, start_time: string, end_time: string, title: string, invitees: string[]}

- DELETE /bookings/{id}: Cancel a booking.

Response: {message: string}

- GET /room-availability: Stream real-time availability updates (SSE).

Response: data: {room_id: number, start_time: string, end_time: string, status: string}

### Component Diagram

[Frontend (React/TypeScript + Material-UI)]
|
| HTTP (GET/POST/DELETE), SSE
|
[Backend (FastAPI)]
|
| SQLAlchemy
|
[PostgreSQL Database]

### Database Schema

- Rooms: id (PK), name, location, equipment, capacity
- Users: email (PK), name
- Bookings: id (PK), room_id (FK), start_time, end_time, title
- Invitees: booking_id (FK), user_email (FK)

### Running Tests

# Backend:

cd backend
pytest tests/test_bookings.py

# Frontend:

cd frontend
npm test
