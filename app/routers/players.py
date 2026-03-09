from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/players",
    tags=["Players"]
)


@router.get(
    "/",
    response_model=list[schemas.PlayerResponse],
    summary="Get all players",
    description="Retrieve all players in the database. Optionally filter by team ID or position."
)
def get_players(
    team_id: int | None = Query(None, description="Filter players by team ID"),
    position: str | None = Query(None, description="Filter players by position (Forward, Midfielder, Defender, Goalkeeper)"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Player)

    if team_id:
        query = query.filter(models.Player.team_id == team_id)

    if position:
        query = query.filter(models.Player.position == position)

    return query.all()


@router.get(
    "/{player_id}",
    response_model=schemas.PlayerResponse,
    summary="Get player by ID",
    description="Retrieve a single player using their unique player ID."
)
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    return player


@router.post(
    "/",
    response_model=schemas.PlayerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new player",
    description="Create a new player record and link it to an existing team."
)
def create_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    new_player = models.Player(**player.dict())

    db.add(new_player)
    db.commit()
    db.refresh(new_player)

    return new_player


@router.put(
    "/{player_id}",
    response_model=schemas.PlayerResponse,
    summary="Update a player",
    description="Update an existing player’s information using their player ID."
)
def update_player(player_id: int, player_update: schemas.PlayerCreate, db: Session = Depends(get_db)):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    for key, value in player_update.dict().items():
        setattr(player, key, value)

    db.commit()
    db.refresh(player)

    return player


@router.delete(
    "/{player_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a player",
    description="Delete a player record from the database using their ID."
)
def delete_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    db.delete(player)
    db.commit()

    return