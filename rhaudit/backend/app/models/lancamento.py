from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class TipoLancEnum(str, enum.Enum):
    credito = "credito"
    debito  = "debito"

class StatusLancEnum(str, enum.Enum):
    pendente  = "pendente"
    aprovado  = "aprovado"
    cancelado = "cancelado"

class Lancamento(Base):
    __tablename__ = "lancamentos"

    id              = Column(Integer, primary_key=True)
    matricula       = Column(String(20), nullable=False)
    nome_colaborador= Column(String(150))
    tipo            = Column(Enum(TipoLancEnum), nullable=False)
    categoria       = Column(String(100), nullable=False)
    modulo          = Column(String(50))
    valor           = Column(Float, nullable=False)
    justificativa   = Column(Text, nullable=False)
    status          = Column(Enum(StatusLancEnum), default=StatusLancEnum.pendente)
    requer_aprovacao= Column(Boolean, default=True)
    competencia_id  = Column(Integer, ForeignKey("competencias.id"), nullable=False)
    criado_por      = Column(Integer, ForeignKey("users.id"), nullable=False)
    aprovado_por    = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    competencia     = relationship("Competencia", back_populates="lancamentos")
