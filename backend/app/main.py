from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .database import SessionLocal, get_db
from .models import Room, Booking, Invitee, User
from .schemas import Room as RoomSchema, User as UserSchema, BookingCreate, Booking as BookingSchema
from typing import List
import asyncio
import json

app = FastAPI()

# In-memory event queue for SSE (simplified for demo)
event_queue = []

@app.get("/rooms", response_model=List[RoomSchema])
def get_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()

@app.get("/users", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.post("/bookings", response_model=BookingSchema)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    # Validate room exists
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Validate invitees exist
    for email in booking.invitees:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User {email} not found")

    # Check for double booking
    conflicting_booking = db.query(Booking).filter(
        Booking.room_id == booking.room_id,
        and_(
            Booking.start_time < booking.end_time,
            Booking.end_time > booking.start_time
        )
    ).first()
    if conflicting_booking:
        raise HTTPException(status_code=400, detail="Room is already booked for this time slot")

    # Create booking
    db_booking = Booking(
        room_id=booking.room_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        title=booking.title
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    # Add invitees
    for email in booking.invitees:
        db_invitee = Invitee(booking_id=db_booking.id, user_email=email)
        db.add(db_invitee)
    db.commit()

    # Notify SSE clients of availability change
    event_queue.append({
        "room_id": db_booking.room_id,
        "start_time": db_booking.start_time.isoformat(),
        "end_time": db_booking.end_time.isoformat(),
        "status": "booked"
    })

    # Return booking with invitees
    invitees = [invitee.user_email for invitee in db_booking.invitees]
    return BookingSchema(
        id=db_booking.id,
        room_id=db_booking.room_id,
        start_time=db_booking.start_time,
        end_time=db_booking.end_time,
        title=db_booking.title,
        invitees=invitees
    )

@app.get("/bookings/{booking_id}", response_model=BookingSchema)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    invitees = [invitee.user_email for invitee in booking.invitees]
    return BookingSchema(
        id=booking.id,
        room_id=booking.room_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        title=booking.title,
        invitees=invitees
    )

@app.delete("/bookings/{booking_id}")
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.query(Invitee).filter(Invitee.booking_id == booking_id).delete()
    db.delete(booking)
    db.commit()
    event_queue.append({
        "room_id": booking.room_id,
        "start_time": booking.start_time.isoformat(),
        "end_time": booking.end_time.isoformat(),
        "status": "canceled"
    })
    return {"message": "Booking canceled"}

@app.get("/room-availability")
async def room_availability():
    async def stream_events():
        while True:
            if event_queue:
                event = event_queue.pop(0)
                yield f"data: {json.dumps(event)}\n\n"
            await asyncio.sleep(1)
    return StreamingResponse(stream_events(), media_type="text/event-stream")