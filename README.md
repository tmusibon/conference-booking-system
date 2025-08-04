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

1.  Navigate to the frontend directory:
    cd frontend

2.  Install dependencies:
    npm install

3.  Start the frontend:
    npm start

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
