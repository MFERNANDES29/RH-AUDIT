from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.user import LoginRequest, Token, ChangePasswordRequest
from app.services.auth_service import authenticate_user, create_token_for_user, change_password
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, req.email, req.password)
    return create_token_for_user(user)

@router.post("/change-password")
def change_pwd(req: ChangePasswordRequest, db: Session = Depends(get_db),
               current_user: User = Depends(get_current_user)):
    from app.core.security import verify_password
    if not verify_password(req.senha_atual, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    change_password(db, current_user, req.nova_senha)
    return {"msg": "Senha alterada com sucesso"}

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return current_user
