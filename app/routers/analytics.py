from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app import models
from app.database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get(
    "/top-scorers",
    summary="Top goal scorers",
    description="Return the top goal scorers in the dataset ordered by total goals."
)
def top_scorers(limit: int = Query(10, description="Number of players to return"), db: Session = Depends(get_db)):
    players = (
        db.query(models.Player.name, models.Player.goals)
        .order_by(desc(models.Player.goals))
        .limit(limit)
        .all()
    )

    return players


@router.get(
    "/top-assists",
    summary="Top assist providers",
    description="Return the players with the most assists."
)
def top_assists(limit: int = Query(10, description="Number of players to return"), db: Session = Depends(get_db)):
    players = (
        db.query(models.Player.name, models.Player.assists)
        .order_by(desc(models.Player.assists))
        .limit(limit)
        .all()
    )

    return players


@router.get(
    "/highest-scoring-matches",
    summary="Highest scoring matches",
    description="Return matches with the highest total goals."
)
def highest_scoring_matches(limit: int = Query(5, description="Number of matches to return"), db: Session = Depends(get_db)):
    matches = (
        db.query(
            models.Match.id,
            models.Match.home_team,
            models.Match.away_team,
            models.Match.home_goals,
            models.Match.away_goals,
            (models.Match.home_goals + models.Match.away_goals).label("total_goals")
        )
        .order_by(desc("total_goals"))
        .limit(limit)
        .all()
    )

    return matches


@router.get(
    "/league-table",
    summary="League table for a season",
    description="Generate a league table summary for a specific season based on match results."
)
def league_table(
    season: str = Query(..., description="Season format example: 2024/25"),
    db: Session = Depends(get_db)
):
    matches = db.query(models.Match).filter(models.Match.season == season).all()

    table = {}

    for match in matches:
        home = match.home_team
        away = match.away_team

        table.setdefault(home, {"points": 0})
        table.setdefault(away, {"points": 0})

        if match.home_goals > match.away_goals:
            table[home]["points"] += 3
        elif match.home_goals < match.away_goals:
            table[away]["points"] += 3
        else:
            table[home]["points"] += 1
            table[away]["points"] += 1

    result = [
        {"team": team, "points": data["points"]}
        for team, data in table.items()
    ]

    result.sort(key=lambda x: x["points"], reverse=True)

    return result


@router.get(
    "/team-summary/{team_id}",
    summary="Team performance summary",
    description="Return a summary of a team including total matches played and goals scored."
)
def team_summary(team_id: int, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter(models.Team.id == team_id).first()

    if not team:
        return {"error": "Team not found"}

    matches = db.query(models.Match).filter(
        (models.Match.home_team == team.name) |
        (models.Match.away_team == team.name)
    ).all()

    total_matches = len(matches)

    total_goals = 0
    for match in matches:
        if match.home_team == team.name:
            total_goals += match.home_goals
        if match.away_team == team.name:
            total_goals += match.away_goals

    return {
        "team_name": team.name,
        "matches_played": total_matches,
        "goals_scored": total_goals
    }