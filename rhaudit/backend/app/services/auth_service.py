from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, StatusEnum
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.user import LoginRequest
from datetime import datetime

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    if user.status != StatusEnum.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo ou pendente de ativação")
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    user.ultimo_acesso = datetime.utcnow()
    db.commit()
    return user

def create_token_for_user(user: User) -> dict:
    token = create_access_token({"sub": str(user.id), "email": user.email, "perfil": user.perfil})
    return {"access_token": token, "token_type": "bearer",
            "user": user, "primeiro_acesso": user.primeiro_acesso}

def change_password(db: Session, user: User, nova_senha: str):
    user.hashed_password = get_password_hash(nova_senha)
    user.primeiro_acesso = False
    db.commit()
