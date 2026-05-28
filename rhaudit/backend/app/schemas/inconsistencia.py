from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.inconsistencia import GravidadeEnum, StatusIncEnum

class InconsistenciaBase(BaseModel):
    modulo: str
    tipo: str
    descricao: str
    gravidade: GravidadeEnum
    categoria: Optional[str] = None
    matricula_ref: Optional[str] = None
    nome_ref: Optional[str] = None

class InconsistenciaUpdate(BaseModel):
    status: Optional[StatusIncEnum] = None
    tratativa: Optional[str] = None

class InconsistenciaResponse(InconsistenciaBase):
    id: int
    status: StatusIncEnum
    tratativa: Optional[str] = None
    competencia_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config: from_attributes = True
