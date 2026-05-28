from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from app.models.user import PerfilEnum, StatusEnum

class UserBase(BaseModel):
    nome: str
    email: EmailStr
    perfil: PerfilEnum
    empresas_acesso: List[str] = []
    permissoes: Dict = {}

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    nome: Optional[str] = None
    perfil: Optional[PerfilEnum] = None
    status: Optional[StatusEnum] = None
    empresas_acesso: Optional[List[str]] = None
    permissoes: Optional[Dict] = None

class UserResponse(UserBase):
    id: int
    status: StatusEnum
    primeiro_acesso: bool
    ultimo_acesso: Optional[datetime] = None
    created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    primeiro_acesso: bool

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    empresa: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    senha_atual: str
    nova_senha: str
