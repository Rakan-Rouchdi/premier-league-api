from fastapi import FastAPI

from app import models
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Premier League Statistics API",
    description="API for Premier League players, matches and analytics",
    version="1.0.0"
)


@app.get("/")
def root():
    return {"message": "Premier League API is running"}