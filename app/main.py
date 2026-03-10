from fastapi import FastAPI

from app import models
from app.database import Base, engine
from app.routers import players, teams, matches, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Premier League Analytics API",
    description="""
A REST API for exploring Premier League data including players, teams,
matches, and advanced analytics such as top scorers and league tables.

Features:
- Player CRUD operations
- Team and match retrieval
- Analytical insights
- Season league table generation
""",
    version="1.0.0",
    contact={
        "name": "Rakan Rouchdi",
        "email": "sc23r2r@leeds.ac.uk"
    }
)

app.include_router(players.router)
app.include_router(teams.router)
app.include_router(matches.router)
app.include_router(analytics.router)

@app.get("/", tags=["Root"])
def root():
    return {"message": "Premier League API is running"}