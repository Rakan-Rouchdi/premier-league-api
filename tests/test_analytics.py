from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_top_scorers():
    response = client.get("/analytics/top-scorers")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_top_assists():
    response = client.get("/analytics/top-assists")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_highest_scoring_matches():
    response = client.get("/analytics/highest-scoring-matches")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_league_table():
    response = client.get("/analytics/league-table", params={"season": "2024/25"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_team_summary():
    response = client.get("/analytics/team-summary/1")
    assert response.status_code == 200
    assert "team_name" in response.json()