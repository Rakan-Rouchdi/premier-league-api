from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_teams():
    response = client.get("/teams/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_team_by_id():
    response = client.get("/teams/1")
    assert response.status_code == 200
    assert "id" in response.json()
    assert "name" in response.json()


def test_get_matches():
    response = client.get("/matches/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_match_by_id():
    response = client.get("/matches/1")
    assert response.status_code == 200
    assert "id" in response.json()
    assert "season" in response.json()