from sqlalchemy.orm import Session

from app.models import Player


def get_players(db: Session, team_id: int | None = None, position: str | None = None):
    query = db.query(Player)

    if team_id is not None:
        query = query.filter(Player.team_id == team_id)

    if position is not None:
        query = query.filter(Player.position == position)

    return query.all()


def get_player(db: Session, player_id: int):
    return db.query(Player).filter(Player.id == player_id).first()


def create_player(db: Session, player_data):
    player = Player(**player_data.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


def update_player(db: Session, player_id: int, player_data):
    player = get_player(db, player_id)

    if not player:
        return None

    for field, value in player_data.model_dump().items():
        setattr(player, field, value)

    db.commit()
    db.refresh(player)
    return player


def delete_player(db: Session, player_id: int):
    player = get_player(db, player_id)

    if not player:
        return None

    db.delete(player)
    db.commit()
    return player