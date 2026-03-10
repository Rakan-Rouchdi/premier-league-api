from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, schemas
from app.dependencies import get_db

router = APIRouter(
    prefix="/matches",
    tags=["Matches"]
)


@router.get(
    "/",
    response_model=list[schemas.MatchResponse],
    summary="Get matches",
    description="Retrieve all matches with optional filters."
)
def get_matches(
    season: str | None = Query(
        None,
        description="Filter matches by season (example: 2024/25)"
    ),
    team_id: int | None = Query(
        None,
        description="Filter matches where a specific team participated"
    ),
    db: Session = Depends(get_db)
):
    return crud.get_matches(db, season=season, team_id=team_id)


@router.get(
    "/{match_id}",
    response_model=schemas.MatchResponse,
    summary="Get match by ID",
    description="Retrieve details for a specific match.",
    responses={404: {"description": "Match not found"}}
)
def get_match(match_id: int, db: Session = Depends(get_db)):
    match = crud.get_match(db, match_id)

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    return match