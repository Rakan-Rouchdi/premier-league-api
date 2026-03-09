from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.dependencies import get_db

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("/", response_model=list[schemas.PlayerResponse])
def read_players(
    team_id: int | None = Query(default=None),
    position: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.get_players(db, team_id=team_id, position=position)


@router.get("/{player_id}", response_model=schemas.PlayerResponse)
def read_player(player_id: int, db: Session = Depends(get_db)):
    player = crud.get_player(db, player_id)

    if not player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )

    return player


@router.post("/", response_model=schemas.PlayerResponse, status_code=status.HTTP_201_CREATED)
def create_player(player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter(models.Team.id == player.team_id).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    return crud.create_player(db, player)


@router.put("/{player_id}", response_model=schemas.PlayerResponse)
def update_player(player_id: int, player: schemas.PlayerUpdate, db: Session = Depends(get_db)):
    team = db.query(models.Team).filter(models.Team.id == player.team_id).first()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )

    updated_player = crud.update_player(db, player_id, player)

    if not updated_player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )

    return updated_player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(player_id: int, db: Session = Depends(get_db)):
    deleted_player = crud.delete_player(db, player_id)

    if not deleted_player:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Player not found"
        )

    return None