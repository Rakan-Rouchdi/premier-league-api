# Premier League Analytics API

A RESTful API built with **FastAPI** that provides access to Premier League data including players, teams, matches, and analytical insights.

The system integrates real-world datasets and demonstrates modern backend development practices including API design, database integration, analytics queries, automated testing, and documentation.

In addition to the backend API, the project includes a lightweight **browser-based front-end dashboard** that consumes the API and demonstrates real-world usage of the service.

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

### Front-End Dashboard

A responsive front-end interface was developed to interact with the API.

The dashboard allows users to:

- Browse players, teams, and matches
- Perform player CRUD operations
- View league analytics and summaries
- Navigate data through a simple user interface

The front-end consumes the API using JavaScript `fetch` requests and demonstrates how the backend service can be used in a real application.

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Backend Framework | FastAPI |
| Database | SQLite |
| ORM | SQLAlchemy |
| Data Validation | Pydantic |
| Testing | Pytest |
| Frontend | HTML, CSS, JavaScript |
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
├── frontend
│   ├── index.html
│   ├── css
│   │   └── styles.css
│   └── js
│       ├── app.js
│       ├── dashboard.js
│       ├── players.js
│       ├── teams.js
│       ├── matches.js
│       └── analytics.js
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
├── requirements.txt
└── README.md
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

## Running the Front-End Dashboard

After starting the API server, the front-end dashboard is automatically served at the root URL:

```
http://127.0.0.1:8000/
```

The dashboard communicates with the API using JavaScript fetch requests and allows users to:

- View a dashboard with key statistics
- Browse, search, and filter players, teams, and matches
- Perform full CRUD operations on players
- View analytics including top scorers, assists, and league tables
- Explore team performance summaries

The frontend is responsive and works on desktop, tablet, and mobile devices.

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

## Deployment

This application is ready for deployment on Render.com. See the [DEPLOYMENT.md](DEPLOYMENT.md) file for detailed instructions on how to deploy the application.

## Future Improvements

Potential future enhancements include:

- Authentication and user accounts
- Advanced player analytics
- Team comparison analytics
- Caching for analytical queries
- Additional frontend visualizations (charts, graphs)
- Progressive Web App (PWA) capabilities

---

## Author

Rakan Rouchdi  
University Coursework Project  
Premier League Analytics API