from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)


@router.get(
    "/",
    response_model=list[schemas.MatchResponse],
    summary="Get all matches",
    description="Retrieve all recorded Premier League matches from the database."
)
def get_matches(db: Session = Depends(get_db)):
    matches = db.query(models.Match).all()
    return matches


@router.get(
    "/{match_id}",
    response_model=schemas.MatchResponse,
    summary="Get match by ID",
    description="Retrieve a single match using its unique match ID."
)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = db.query(models.Match).filter(models.Match.id == match_id).first()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    return match