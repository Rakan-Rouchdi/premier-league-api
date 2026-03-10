from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_players():
    response = client.get("/players/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_single_player():
    response = client.get("/players/1")
    assert response.status_code == 200
    assert "id" in response.json()
    assert "name" in response.json()


def test_create_update_delete_player():
    new_player = {
        "name": "Test Player",
        "team_id": 1,
        "position": "Forward",
        "appearances": 5,
        "minutes": 450,
        "goals": 3,
        "assists": 1
    }

    create_response = client.post("/players/", json=new_player)
    assert create_response.status_code == 201

    created_player = create_response.json()
    player_id = created_player["id"]

    updated_data = {
        "name": "Updated Test Player",
        "team_id": 1,
        "position": "Midfielder",
        "appearances": 8,
        "minutes": 650,
        "goals": 4,
        "assists": 2
    }

    update_response = client.put(f"/players/{player_id}", json=updated_data)
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Updated Test Player"

    delete_response = client.delete(f"/players/{player_id}")
    assert delete_response.status_code == 204