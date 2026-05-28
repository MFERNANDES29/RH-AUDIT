from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.user import User, StatusEnum
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.core.security import get_password_hash
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
def listar(db: Session = Depends(get_db), _=Depends(require_admin)):
    return db.query(User).all()

@router.post("/", response_model=UserResponse)
def criar(data: UserCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    user = User(
        nome=data.nome, email=data.email, perfil=data.perfil,
        hashed_password=get_password_hash(data.password),
        empresas_acesso=data.empresas_acesso, permissoes=data.permissoes,
        status=StatusEnum.ativo, primeiro_acesso=True,
    )
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.put("/{user_id}", response_model=UserResponse)
def atualizar(user_id: int, data: UserUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "Usuário não encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit(); db.refresh(user)
    return user

@router.delete("/{user_id}")
def inativar(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "Usuário não encontrado")
    user.status = StatusEnum.inativo
    db.commit()
    return {"msg": "Usuário inativado"}
