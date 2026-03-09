from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.dependencies import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/top-scorers", response_model=list[schemas.TopPlayerStats])
def read_top_scorers(limit: int = Query(default=10), db: Session = Depends(get_db)):
    players = crud.get_top_scorers(db, limit=limit)

    return [
        {
            "player_id": player.id,
            "name": player.name,
            "team_id": player.team_id,
            "goals": player.goals,
            "assists": player.assists,
        }
        for player in players
    ]


@router.get("/top-assists", response_model=list[schemas.TopPlayerStats])
def read_top_assists(limit: int = Query(default=10), db: Session = Depends(get_db)):
    players = crud.get_top_assists(db, limit=limit)

    return [
        {
            "player_id": player.id,
            "name": player.name,
            "team_id": player.team_id,
            "goals": player.goals,
            "assists": player.assists,
        }
        for player in players
    ]


@router.get("/highest-scoring-matches", response_model=list[schemas.HighScoringMatchResponse])
def read_highest_scoring_matches(limit: int = Query(default=10), db: Session = Depends(get_db)):
    return crud.get_highest_scoring_matches(db, limit=limit)


@router.get("/league-table", response_model=list[schemas.LeagueTableRow])
def read_league_table(season: str = Query(...), db: Session = Depends(get_db)):
    return crud.get_league_table(db, season=season)


@router.get("/team-summary/{team_id}", response_model=schemas.TeamSummaryResponse)
def read_team_summary(team_id: int, db: Session = Depends(get_db)):
    summary = crud.get_team_summary(db, team_id)

    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    return summary