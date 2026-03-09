from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.dependencies import get_db

router = APIRouter(prefix="/teams", tags=["Teams"])


@router.get("/", response_model=list[schemas.TeamResponse])
def read_teams(db: Session = Depends(get_db)):
    return crud.get_teams(db)


@router.get("/{team_id}", response_model=schemas.TeamResponse)
def read_team(team_id: int, db: Session = Depends(get_db)):
    team = crud.get_team(db, team_id)

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    return team