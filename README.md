# Premier League Analytics API

A RESTful API built with **FastAPI** that provides access to Premier League data including players, teams, matches, and analytical insights.

The system integrates real-world datasets and demonstrates modern backend development practices including API design, database integration, analytics queries, automated testing, and documentation.

---

## Features

The API provides the following functionality.

### Player Management (CRUD)

- Create a new player
- Retrieve all players
- Retrieve a player by ID
- Update player information
- Delete a player

### Teams

- Retrieve all teams
- Retrieve team details by ID

### Matches

- Retrieve all matches
- Retrieve match details by ID
- Filter matches by season
- Filter matches by team

### Analytics

- Top goal scorers
- Top assist providers
- Highest scoring matches
- League table by season
- Team performance summary

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Backend Framework | FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Data Validation | Pydantic |
| Testing | Pytest |
| Documentation | Swagger / OpenAPI |

---

## Project Structure

```
premier-league-api
│
├── app
│   ├── routers
│   │   ├── players.py
│   │   ├── teams.py
│   │   ├── matches.py
│   │   └── analytics.py
│   │
│   ├── services
│   │   └── import_data.py
│   │
│   ├── crud.py
│   ├── database.py
│   ├── dependencies.py
│   ├── models.py
│   ├── schemas.py
│   └── main.py
│
├── data
│   ├── matches.csv
│   └── players.csv
│
├── tests
│   ├── test_main.py
│   ├── test_players.py
│   ├── test_teams_matches.py
│   └── test_analytics.py
│
├── docs
├── slides
├── report
├── pytest.ini
└── requirements.txt
```

---

## Datasets

Two public datasets from Kaggle were used.

### Premier League Match Data (2000–2025)

Contains match results and statistics including:

- goals
- shots
- fouls
- cards
- corners

Source:  
https://www.kaggle.com/datasets/marcohuiii/english-premier-league-epl-match-data-2000-2025

### Premier League Player Statistics (2024/25)

Contains player performance data including:

- goals
- assists
- minutes
- appearances
- positions

Source:  
https://www.kaggle.com/datasets/aesika/english-premier-league-player-stats-2425

---

## Installation

Clone the repository.

```bash
git clone https://github.com/Rakan-Rouchdi/premier-league-api.git
cd premier-league-api
```

Create a virtual environment.

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

---

## Running the API

Start the FastAPI server.

```bash
uvicorn app.main:app --reload
```

Open the interactive API documentation.

```
http://127.0.0.1:8000/docs
```

Swagger UI allows interactive testing of all endpoints.

---

## Example Endpoints

### Players

```
GET /players
GET /players/{player_id}
POST /players
PUT /players/{player_id}
DELETE /players/{player_id}
```

### Teams

```
GET /teams
GET /teams/{team_id}
```

### Matches

```
GET /matches
GET /matches/{match_id}
```

### Analytics

```
GET /analytics/top-scorers
GET /analytics/top-assists
GET /analytics/highest-scoring-matches
GET /analytics/league-table?season=2024/25
GET /analytics/team-summary/{team_id}
```

---

## Testing

Automated tests are implemented using **Pytest**.

Run tests with:

```bash
pytest
```

The test suite verifies:

- Player CRUD operations
- Teams retrieval endpoints
- Matches retrieval endpoints
- Analytics endpoints
- Root API functionality

---

## Generative AI Usage

Generative AI tools were used during development to assist with:

- development planning
- debugging
- API structure design
- documentation drafting

All AI usage followed the coursework guidelines and was used as a development aid rather than replacing independent implementation.

---

## Future Improvements

Potential future enhancements include:

- authentication and user accounts
- advanced player analytics
- team comparison analytics
- caching for analytical queries
- deployment to a cloud platform

---

## Author

Rakan Rouchdi  
University Coursework Project  
Premier League Analytics API