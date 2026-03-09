from datetime import date

from pydantic import BaseModel


class TeamBase(BaseModel):
    name: str


class TeamResponse(TeamBase):
    id: int

    class Config:
        from_attributes = True


class PlayerBase(BaseModel):
    name: str
    team_id: int
    position: str | None = None
    appearances: int = 0
    minutes: int = 0
    goals: int = 0
    assists: int = 0


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(PlayerBase):
    pass


class PlayerResponse(PlayerBase):
    id: int

    class Config:
        from_attributes = True


class MatchResponse(BaseModel):
    id: int
    match_date: date
    season: str
    home_team_id: int
    away_team_id: int
    home_goals: int
    away_goals: int
    home_shots: int
    away_shots: int
    home_corners: int
    away_corners: int
    home_yellow: int
    away_yellow: int
    home_red: int
    away_red: int

    class Config:
        from_attributes = True

class TopPlayerStats(BaseModel):
    player_id: int
    name: str
    team_id: int
    goals: int
    assists: int

    class Config:
        from_attributes = True


class HighScoringMatchResponse(BaseModel):
    match_id: int
    match_date: date
    season: str
    home_team_id: int
    away_team_id: int
    home_goals: int
    away_goals: int
    total_goals: int


class LeagueTableRow(BaseModel):
    team_id: int
    team_name: str
    played: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    goal_difference: int
    points: int


class TeamSummaryResponse(BaseModel):
    team_id: int
    team_name: str
    matches_played: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
    points: int