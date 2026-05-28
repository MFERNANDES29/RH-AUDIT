from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.core.security import decode_token
from app.models.user import User, PerfilEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado",
                            headers={"WWW-Authenticate": "Bearer"})
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.perfil not in (PerfilEnum.admin, PerfilEnum.rh):
        raise HTTPException(status_code=403, detail="Permissão insuficiente")
    return current_user
