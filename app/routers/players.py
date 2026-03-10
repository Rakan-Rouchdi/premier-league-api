from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.dependencies import get_db

router = APIRouter(
    prefix="/players",
    tags=["Players"]
)


@router.get(
    "/",
    response_model=list[schemas.PlayerResponse],
    summary="Get all players",
    description="Retrieve all players in the database with optional filters.",
)
def get_players(
    team_id: int | None = Query(
        None,
        description="Filter players by team ID"
    ),
    position: str | None = Query(
        None,
        description="Filter players by position (FWD, MID, DEF, GKP)"
    ),
    db: Session = Depends(get_db)
):
    return crud.get_players(db, team_id=team_id, position=position)


@router.get(
    "/{player_id}",
    response_model=schemas.PlayerResponse,
    summary="Get player by ID",
    description="Retrieve a single player using their unique ID.",
    responses={404: {"description": "Player not found"}}
)
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = crud.get_player(db, player_id)

    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    return player


@router.post(
    "/",
    response_model=schemas.PlayerResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a player",
    description="Create a new player record linked to an existing team."
)
def create_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    return crud.create_player(db, player)


@router.put(
    "/{player_id}",
    response_model=schemas.PlayerResponse,
    summary="Update player",
    description="Update an existing player's information.",
    responses={404: {"description": "Player not found"}}
)
def update_player(player_id: int, player: schemas.PlayerUpdate, db: Session = Depends(get_db)):
    updated_player = crud.update_player(db, player_id, player)

    if not updated_player:
        raise HTTPException(status_code=404, detail="Player not found")

    return updated_player


@router.delete(
    "/{player_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete player",
    description="Remove a player from the database.",
    responses={404: {"description": "Player not found"}}
)
def delete_player(player_id: int, db: Session = Depends(get_db)):
    success = crud.delete_player(db, player_id)

    if not success:
        raise HTTPException(status_code=404, detail="Player not found")