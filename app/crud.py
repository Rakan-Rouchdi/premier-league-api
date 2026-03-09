from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models import Player, Team, Match


def get_players(db: Session, team_id: int | None = None, position: str | None = None):
    query = db.query(Player)

    if team_id is not None:
        query = query.filter(Player.team_id == team_id)

    if position is not None:
        query = query.filter(Player.position == position)

    return query.all()


def get_player(db: Session, player_id: int):
    return db.query(Player).filter(Player.id == player_id).first()


def create_player(db: Session, player_data):
    player = Player(**player_data.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


def update_player(db: Session, player_id: int, player_data):
    player = get_player(db, player_id)

    if not player:
        return None

    for field, value in player_data.model_dump().items():
        setattr(player, field, value)

    db.commit()
    db.refresh(player)
    return player


def delete_player(db: Session, player_id: int):
    player = get_player(db, player_id)

    if not player:
        return None

    db.delete(player)
    db.commit()
    return player

def get_teams(db: Session):
    return db.query(Team).all()


def get_team(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()


def get_matches(db: Session, season: str | None = None, team_id: int | None = None):
    query = db.query(Match)

    if season:
        query = query.filter(Match.season == season)

    if team_id:
        query = query.filter(
            (Match.home_team_id == team_id) |
            (Match.away_team_id == team_id)
        )

    return query.all()


def get_match(db: Session, match_id: int):
    return db.query(Match).filter(Match.id == match_id).first()

def get_top_scorers(db: Session, limit: int = 10):
    return db.query(Player).order_by(desc(Player.goals)).limit(limit).all()


def get_top_assists(db: Session, limit: int = 10):
    return db.query(Player).order_by(desc(Player.assists)).limit(limit).all()


def get_highest_scoring_matches(db: Session, limit: int = 10):
    matches = db.query(Match).all()

    results = []
    for match in matches:
        results.append({
            "match_id": match.id,
            "match_date": match.match_date,
            "season": match.season,
            "home_team_id": match.home_team_id,
            "away_team_id": match.away_team_id,
            "home_goals": match.home_goals,
            "away_goals": match.away_goals,
            "total_goals": match.home_goals + match.away_goals,
        })

    results.sort(key=lambda x: x["total_goals"], reverse=True)
    return results[:limit]


def get_league_table(db: Session, season: str):
    teams = db.query(Team).all()
    matches = db.query(Match).filter(Match.season == season).all()

    table = {
        team.id: {
            "team_id": team.id,
            "team_name": team.name,
            "played": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "goals_for": 0,
            "goals_against": 0,
            "goal_difference": 0,
            "points": 0,
        }
        for team in teams
    }

    for match in matches:
        home = table[match.home_team_id]
        away = table[match.away_team_id]

        home["played"] += 1
        away["played"] += 1

        home["goals_for"] += match.home_goals
        home["goals_against"] += match.away_goals

        away["goals_for"] += match.away_goals
        away["goals_against"] += match.home_goals

        if match.home_goals > match.away_goals:
            home["wins"] += 1
            away["losses"] += 1
            home["points"] += 3
        elif match.home_goals < match.away_goals:
            away["wins"] += 1
            home["losses"] += 1
            away["points"] += 3
        else:
            home["draws"] += 1
            away["draws"] += 1
            home["points"] += 1
            away["points"] += 1

    for team_stats in table.values():
        team_stats["goal_difference"] = team_stats["goals_for"] - team_stats["goals_against"]

    return sorted(
        table.values(),
        key=lambda x: (x["points"], x["goal_difference"], x["goals_for"]),
        reverse=True
    )


def get_team_summary(db: Session, team_id: int):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        return None

    matches = db.query(Match).filter(
        (Match.home_team_id == team_id) | (Match.away_team_id == team_id)
    ).all()

    summary = {
        "team_id": team.id,
        "team_name": team.name,
        "matches_played": 0,
        "wins": 0,
        "draws": 0,
        "losses": 0,
        "goals_for": 0,
        "goals_against": 0,
        "points": 0,
    }

    for match in matches:
        summary["matches_played"] += 1

        if match.home_team_id == team_id:
            goals_for = match.home_goals
            goals_against = match.away_goals
        else:
            goals_for = match.away_goals
            goals_against = match.home_goals

        summary["goals_for"] += goals_for
        summary["goals_against"] += goals_against

        if goals_for > goals_against:
            summary["wins"] += 1
            summary["points"] += 3
        elif goals_for < goals_against:
            summary["losses"] += 1
        else:
            summary["draws"] += 1
            summary["points"] += 1

    return summary