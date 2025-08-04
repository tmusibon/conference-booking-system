from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_
from .database import SessionLocal, get_db
from .models import Room, Booking, Invitee, User
from .schemas import Room as RoomSchema, User as UserSchema, BookingCreate, Booking as BookingSchema
from typing import List
import asyncio
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory event queue for SSE (simplified for demo)
event_queue = []

@app.get("/rooms", response_model=List[RoomSchema])
def get_rooms(db: Session = Depends(get_db)):
    return db.query(Room).all()

@app.get("/users", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.get("/bookings", response_model=List[BookingSchema])
def get_bookings(db: Session = Depends(get_db)):
    bookings = db.query(Booking).all()
    return [
        BookingSchema(
            id=booking.id,
            room_id=booking.room_id,
            start_time=booking.start_time,
            end_time=booking.end_time,
            title=booking.title,
            invitees=[invitee.user_email for invitee in booking.invitees]
        )
        for booking in bookings
    ]

@app.post("/bookings", response_model=BookingSchema)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    for email in booking.invitees:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User {email} not found")

    conflicting_booking = db.query(Booking).filter(
        Booking.room_id == booking.room_id,
        and_(
            Booking.start_time < booking.end_time,
            Booking.end_time > booking.start_time
        )
    ).first()
    if conflicting_booking:
        raise HTTPException(status_code=400, detail="Room is already booked for this time slot")

    db_booking = Booking(
        room_id=booking.room_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        title=booking.title
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    for email in booking.invitees:
        db_invitee = Invitee(booking_id=db_booking.id, user_email=email)
        db.add(db_invitee)
    db.commit()

    event_queue.append({
        "room_id": db_booking.room_id,
        "start_time": db_booking.start_time.isoformat(),
        "end_time": db_booking.end_time.isoformat(),
        "status": "booked"
    })

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