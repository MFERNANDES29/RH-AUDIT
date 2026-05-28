from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class StatusFopagEnum(str, enum.Enum):
    aberta     = "aberta"
    em_revisao = "em_revisao"
    aprovada   = "aprovada"
    fechada    = "fechada"

class Competencia(Base):
    __tablename__ = "competencias"

    id          = Column(Integer, primary_key=True)
    mes         = Column(Integer, nullable=False)
    ano         = Column(Integer, nullable=False)
    descricao   = Column(String(30))           # "FOPAG Maio 2026"
    status      = Column(Enum(StatusFopagEnum), default=StatusFopagEnum.aberta)
    empresa_id  = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    fechada_em  = Column(DateTime(timezone=True), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    empresa        = relationship("Empresa",      back_populates="competencias")
    importacoes    = relationship("Importacao",   back_populates="competencia")
    inconsistencias= relationship("Inconsistencia",back_populates="competencia")
    lancamentos    = relationship("Lancamento",   back_populates="competencia")
    consolidacoes  = relationship("Consolidacao", back_populates="competencia")
