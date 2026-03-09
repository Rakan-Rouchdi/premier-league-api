from fastapi import FastAPI

from app import models
from app.database import Base, engine
from app.routers import players, teams, matches, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Premier League Analytics API",
    description="A REST API for analysing Premier League teams, players, and match data.",
    version="1.0.0"
)

app.include_router(players.router)
app.include_router(teams.router)
app.include_router(matches.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {"message": "Premier League API is running"}