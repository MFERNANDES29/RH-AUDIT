from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class GravidadeEnum(str, enum.Enum):
    alta  = "alta"
    media = "media"
    baixa = "baixa"

class StatusIncEnum(str, enum.Enum):
    aberta       = "aberta"
    em_tratamento= "em_tratamento"
    resolvida    = "resolvida"
    ignorada     = "ignorada"

class Inconsistencia(Base):
    __tablename__ = "inconsistencias"

    id              = Column(Integer, primary_key=True)
    modulo          = Column(String(50), nullable=False)
    tipo            = Column(String(100), nullable=False)
    descricao       = Column(Text, nullable=False)
    gravidade       = Column(Enum(GravidadeEnum), nullable=False)
    categoria       = Column(String(50))
    status          = Column(Enum(StatusIncEnum), default=StatusIncEnum.aberta)
    tratativa       = Column(Text)
    matricula_ref   = Column(String(20))
    nome_ref        = Column(String(150))
    competencia_id  = Column(Integer, ForeignKey("competencias.id"), nullable=False)
    resolvida_por   = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    competencia     = relationship("Competencia", back_populates="inconsistencias")
