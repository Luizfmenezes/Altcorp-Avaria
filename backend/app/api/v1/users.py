from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import require_admin
from app.core.security import hash_password
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserUpdate, UserOut

router = APIRouter()


@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    if payload.role not in [r.value for r in Role]:
        raise HTTPException(400, "Role inválida")
    if db.query(User).filter(User.email == payload.email.lower()).first():
        raise HTTPException(409, "Email já cadastrado")
    user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        user.email = payload.email.lower()
    if payload.password:
        user.hashed_password = hash_password(payload.password)
    if payload.role is not None:
        if payload.role not in [r.value for r in Role]:
            raise HTTPException(400, "Role inválida")
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def deactivate_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "Usuário não encontrado")
    user.is_active = False
    db.commit()
