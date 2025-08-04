from app.database import Base, engine
from app.models import User, Room, Booking, Invitee
print("Imports successful!")
print("Registered models:", Base.metadata.tables.keys())