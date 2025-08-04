from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.database import Base, engine
from app.models import User, Room, Booking, Invitee

config = context.config
fileConfig(config.config_file_name)
connectable = engine

with connectable.connect() as connection:
    context.configure(
        connection=connection, target_metadata=Base.metadata
    )
    with context.begin_transaction():
        context.run_migrations()