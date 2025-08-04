import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, engine
from app.models import Base, Room, User

@pytest.fixture
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    db.add(Room(id=1, name="Test Room", location="Floor 1", equipment="Projector", capacity=2))
    db.add(User(email="test@example.com", name="Test User"))
    db.commit()
    db.close()
    yield TestClient(app)
    Base.metadata.drop_all(bind=engine)

def test_double_booking(client):
    # Here it creates a booking
    response = client.post("/bookings", json={
        "room_id": 1,
        "start_time": "2025-08-05T10:00:00",
        "end_time": "2025-08-05T11:00:00",
        "title": "Test Meeting",
        "invitees": ["test@example.com"]
    })
    print("First booking response:", response.json())
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.json()}"

    # This is trying to craete a conflicting booking
    response = client.post("/bookings", json={
        "room_id": 1,
        "start_time": "2025-08-05T10:30:00",
        "end_time": "2025-08-05T11:30:00",
        "title": "Conflicting Meeting",
        "invitees": ["test@example.com"]
    })
    print("Conflicting booking response:", response.json())
    assert response.status_code == 400
    assert response.json()["detail"] == "Room is already booked for this time slot"