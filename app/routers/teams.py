from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.dependencies import get_db

router = APIRouter(
    prefix="/teams",
    tags=["Teams"]
)


@router.get(
    "/",
    response_model=list[schemas.TeamResponse],
    summary="Get all teams",
    description="Retrieve all Premier League teams stored in the database."
)
def get_teams(db: Session = Depends(get_db)):
    return crud.get_teams(db)


@router.get(
    "/{team_id}",
    response_model=schemas.TeamResponse,
    summary="Get team by ID",
    description="Retrieve a single team using its unique team ID.",
    responses={404: {"description": "Team not found"}}
)
def get_team(team_id: int, db: Session = Depends(get_db)):
    team = crud.get_team(db, team_id)

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    return team