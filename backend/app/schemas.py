from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class Room(BaseModel):
    id: int
    name: str
    location: str
    equipment: str
    capacity: int

    class Config:
        orm_mode = True

class User(BaseModel):
    email: str
    name: str

    class Config:
        orm_mode = True

class BookingCreate(BaseModel):
    room_id: int
    start_time: datetime
    end_time: datetime
    title: Optional[str] = None
    invitees: List[str] = []

class Booking(BaseModel):
    id: int
    room_id: int
    start_time: datetime
    end_time: datetime
    title: Optional[str]
    invitees: List[str]

    class Config:
        orm_mode = True