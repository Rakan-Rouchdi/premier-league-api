import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
app.include_router(players.router)
app.include_router(teams.router)
app.include_router(matches.router)
app.include_router(analytics.router)

# Serve static files (CSS, JS)
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
app.mount("/static", StaticFiles(directory=frontend_dir), name="static")


@app.get("/", tags=["Root"])
def root():
    return FileResponse(os.path.join(frontend_dir, "index.html"))


@app.get("/api", tags=["Root"])
def api_root():
    return {"message": "Premier League API is running"}
