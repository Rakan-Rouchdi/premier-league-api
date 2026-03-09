from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/teams",
    tags=["Teams"]
)


@router.get(
    "/",
    response_model=list[schemas.TeamResponse],
    summary="Get all teams",
    description="Retrieve all teams that exist in the database."
)
def get_teams(db: Session = Depends(get_db)):
    teams = db.query(models.Team).all()
    return teams


@router.get(
    "/{team_id}",
    response_model=schemas.TeamResponse,
    summary="Get team by ID",
    description="Retrieve a specific team using its unique team ID."
)
def get_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    return team