from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200


def test_api_root():
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json() == {"message": "Premier League API is running"}
