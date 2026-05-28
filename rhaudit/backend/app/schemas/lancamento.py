from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.lancamento import TipoLancEnum, StatusLancEnum

class LancamentoCreate(BaseModel):
    matricula: str
    nome_colaborador: Optional[str] = None
    tipo: TipoLancEnum
    categoria: str
    modulo: Optional[str] = None
    valor: float
    justificativa: str
    competencia_id: int

class LancamentoResponse(LancamentoCreate):
    id: int
    status: StatusLancEnum
    requer_aprovacao: bool
    criado_por: int
    created_at: datetime
    class Config: from_attributes = True
