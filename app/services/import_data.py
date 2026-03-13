from datetime import datetime

import pandas as pd
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Match, Player, Team


MATCHES_CSV = "data/matches.csv"
PLAYERS_CSV = "data/players.csv"

# Mapping of full/alternative team names to their canonical short names.
# The matches CSV uses short names consistently across 25 seasons,
# while the players CSV uses full official names for current teams.
TEAM_NAME_MAP = {
    "Brighton & Hove Albion": "Brighton",
    "Ipswich Town": "Ipswich",
    "Leicester City": "Leicester",
    "Manchester City": "Man City",
    "Manchester United": "Man United",
    "Newcastle United": "Newcastle",
    "Nottingham Forest": "Nott'm Forest",
    "Tottenham Hotspur": "Tottenham",
    "West Ham United": "West Ham",
    "Wolverhampton Wanderers": "Wolves",
}


def normalise_team_name(name: str) -> str:
    """Return the canonical short name for a team."""
    return TEAM_NAME_MAP.get(name, name)


def parse_date(date_str: str):
    return datetime.strptime(date_str, "%Y-%m-%d").date()


def import_teams(db: Session, matches_df: pd.DataFrame, players_df: pd.DataFrame):
    match_teams = set(matches_df["HomeTeam"].dropna().unique()) | set(matches_df["AwayTeam"].dropna().unique())
    player_teams = {normalise_team_name(t) for t in players_df["Club"].dropna().unique()}
    all_teams = sorted(match_teams | player_teams)

    existing_team_names = {team.name for team in db.query(Team).all()}

    for team_name in all_teams:
        if team_name not in existing_team_names:
            db.add(Team(name=team_name))

    db.commit()


def import_players(db: Session, players_df: pd.DataFrame):
    if db.query(Player).first():
        print("Players already imported. Skipping players import.")
        return

    teams = {team.name: team.id for team in db.query(Team).all()}

    for _, row in players_df.iterrows():
        club_name = normalise_team_name(row["Club"])
        team_id = teams.get(club_name)
        if not team_id:
            continue

        player = Player(
            name=row["Player Name"],
            team_id=team_id,
            position=row["Position"],
            appearances=int(row["Appearances"]) if pd.notna(row["Appearances"]) else 0,
            minutes=int(row["Minutes"]) if pd.notna(row["Minutes"]) else 0,
            goals=int(row["Goals"]) if pd.notna(row["Goals"]) else 0,
            assists=int(row["Assists"]) if pd.notna(row["Assists"]) else 0,
        )
        db.add(player)

    db.commit()


def import_matches(db: Session, matches_df: pd.DataFrame):
    if db.query(Match).first():
        print("Matches already imported. Skipping matches import.")
        return

    teams = {team.name: team.id for team in db.query(Team).all()}

    for _, row in matches_df.iterrows():
        home_team_id = teams.get(row["HomeTeam"])
        away_team_id = teams.get(row["AwayTeam"])

        if not home_team_id or not away_team_id:
            continue

        match = Match(
            match_date=parse_date(row["MatchDate"]),
            season=row["Season"],
            home_team_id=home_team_id,
            away_team_id=away_team_id,
            home_goals=int(row["FullTimeHomeGoals"]) if pd.notna(row["FullTimeHomeGoals"]) else 0,
            away_goals=int(row["FullTimeAwayGoals"]) if pd.notna(row["FullTimeAwayGoals"]) else 0,
            home_shots=int(row["HomeShots"]) if pd.notna(row["HomeShots"]) else 0,
            away_shots=int(row["AwayShots"]) if pd.notna(row["AwayShots"]) else 0,
            home_corners=int(row["HomeCorners"]) if pd.notna(row["HomeCorners"]) else 0,
            away_corners=int(row["AwayCorners"]) if pd.notna(row["AwayCorners"]) else 0,
            home_yellow=int(row["HomeYellowCards"]) if pd.notna(row["HomeYellowCards"]) else 0,
            away_yellow=int(row["AwayYellowCards"]) if pd.notna(row["AwayYellowCards"]) else 0,
            home_red=int(row["HomeRedCards"]) if pd.notna(row["HomeRedCards"]) else 0,
            away_red=int(row["AwayRedCards"]) if pd.notna(row["AwayRedCards"]) else 0,
        )
        db.add(match)

    db.commit()


def run_import():
    from app.database import Base, engine

    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        matches_df = pd.read_csv(MATCHES_CSV)
        players_df = pd.read_csv(PLAYERS_CSV)

        import_teams(db, matches_df, players_df)
        import_players(db, players_df)
        import_matches(db, matches_df)

        print("Data import complete.")
    finally:
        db.close()


if __name__ == "__main__":
    run_import()