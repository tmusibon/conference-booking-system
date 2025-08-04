from app.database import Base, engine
from app.models import User, Room, Booking, Invitee
from sqlalchemy import inspect

try:
    with engine.connect() as connection:
        print("Successfully connected to the database!")
except Exception as e:
    print(f"Failed to connect to the database: {e}")
    exit(1)

inspector = inspect(engine)
existing_tables = inspector.get_table_names()
print(f"Existing tables before creation: {existing_tables}")

Base.metadata.create_all(bind=engine)
print("Ran create_all command!")

existing_tables = inspector.get_table_names()
print(f"Tables after creation: {existing_tables}")
if existing_tables:
    print("Tables created successfully!")
else:
    print("No tables were created!")