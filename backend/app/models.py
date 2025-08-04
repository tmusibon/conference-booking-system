from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True)
    name = Column(String)
    bookings = relationship("Invitee", back_populates="user")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    location = Column(String)
    equipment = Column(String)
    capacity = Column(Integer)
    bookings = relationship("Booking", back_populates="room")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    room_id = Column(Integer, ForeignKey("rooms.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    title = Column(String, nullable=True)
    room = relationship("Room", back_populates="bookings")
    invitees = relationship("Invitee", back_populates="booking")

class Invitee(Base):
    __tablename__ = "invitees"
    booking_id = Column(Integer, ForeignKey("bookings.id"), primary_key=True)
    user_email = Column(String, ForeignKey("users.email"), primary_key=True)
    booking = relationship("Booking", back_populates="invitees")
    user = relationship("User", back_populates="bookings")