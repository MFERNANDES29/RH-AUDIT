from sqlalchemy import Column, Integer, String, JSON, Float, Text, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class Consolidacao(Base):
    __tablename__ = "consolidacoes"

    id               = Column(Integer, primary_key=True)
    snapshot         = Column(JSON, default={})
    total_colabs     = Column(Integer, default=0)
    total_ho         = Column(Float, default=0)
    total_desl       = Column(Float, default=0)
    total_fretado    = Column(Float, default=0)
    total_refeitorio = Column(Float, default=0)
    total_he_an      = Column(Float, default=0)
    ressalvas        = Column(Text)
    hash_doc         = Column(String(64))
    assinatura_n1    = Column(JSON)
    assinatura_n2    = Column(JSON)
    competencia_id   = Column(Integer, ForeignKey("competencias.id"), nullable=False)
    aprovado_n1_por  = Column(Integer, ForeignKey("users.id"), nullable=True)
    aprovado_n2_por  = Column(Integer, ForeignKey("users.id"), nullable=True)
    aprovado_n1_em   = Column(DateTime(timezone=True), nullable=True)
    aprovado_n2_em   = Column(DateTime(timezone=True), nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    competencia      = relationship("Competencia", back_populates="consolidacoes")
