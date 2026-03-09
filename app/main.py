from fastapi import FastAPI

from app import models
from app.database import Base, engine
from app.routers import players

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Premier League Statistics API",
    description="API for Premier League players, matches and analytics",
    version="1.0.0"
)

app.include_router(players.router)


@app.get("/")
def root():
    return {"message": "Premier League API is running"}