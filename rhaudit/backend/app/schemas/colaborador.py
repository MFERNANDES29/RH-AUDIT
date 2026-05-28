from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ColaboradorBase(BaseModel):
    matricula: str
    nome: str
    cpf: Optional[str] = None
    cargo: Optional[str] = None
    situacao: Optional[str] = None
    centro_custo: Optional[str] = None
    data_admissao: Optional[date] = None
    chefia: Optional[str] = None
    projeto: Optional[str] = None
    empresa_id: int

class ColaboradorCreate(ColaboradorBase): pass

class ColaboradorResponse(ColaboradorBase):
    id: int
    ativo: bool
    created_at: datetime
    class Config: from_attributes = True
