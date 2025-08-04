from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from .database import get_db

app = FastAPI()

@app.get("/")
def read_root(db: Session = Depends(get_db)):
    return {"message": "The backend is running!"}