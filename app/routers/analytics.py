from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, schemas
from app.dependencies import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get(
    "/top-scorers",
    response_model=list[schemas.TopPlayerStats],
    summary="Top goal scorers",
    description="Return the players with the highest number of goals."
)
def top_scorers(
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Maximum number of players to return"
    ),
    db: Session = Depends(get_db)
):
    return crud.get_top_scorers(db, limit)


@router.get(
    "/top-assists",
    response_model=list[schemas.TopPlayerStats],
    summary="Top assist providers",
    description="Return the players with the highest number of assists."
)
def top_assists(
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Maximum number of players to return"
    ),
    db: Session = Depends(get_db)
):
    return crud.get_top_assists(db, limit)


@router.get(
    "/highest-scoring-matches",
    response_model=list[schemas.HighScoringMatchResponse],
    summary="Highest scoring matches",
    description="Return matches with the highest combined goal totals."
)
def highest_scoring_matches(
    limit: int = Query(
        10,
        ge=1,
        le=50,
        description="Maximum number of matches to return"
    ),
    db: Session = Depends(get_db)
):
    return crud.get_highest_scoring_matches(db, limit)


@router.get(
    "/league-table",
    response_model=list[schemas.LeagueTableRow],
    summary="Season league table",
    description="Generate a league table based on match results for a specific season."
)
def league_table(
    season: str = Query(
        ...,
        description="Season format example: 2024/25"
    ),
    db: Session = Depends(get_db)
):
    return crud.get_league_table(db, season)


@router.get(
    "/team-summary/{team_id}",
    response_model=schemas.TeamSummaryResponse,
    summary="Team performance summary",
    description="Return an overview of a team's performance across all matches.",
    responses={404: {"description": "Team not found"}}
)
def team_summary(team_id: int, db: Session = Depends(get_db)):
    summary = crud.get_team_summary(db, team_id)

    if not summary:
        raise HTTPException(status_code=404, detail="Team not found")

    return summary