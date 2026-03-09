from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.dependencies import get_db

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.get("/", response_model=list[schemas.MatchResponse])
def read_matches(
    season: str | None = Query(default=None),
    team_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.get_matches(db, season=season, team_id=team_id)


@router.get("/{match_id}", response_model=schemas.MatchResponse)
def read_match(match_id: int, db: Session = Depends(get_db)):
    match = crud.get_match(db, match_id)

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )

    return match