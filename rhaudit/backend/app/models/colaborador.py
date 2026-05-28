from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Colaborador(Base):
    __tablename__ = "colaboradores"

    id            = Column(Integer, primary_key=True)
    matricula     = Column(String(20), index=True, nullable=False)
    nome          = Column(String(150), nullable=False)
    nome_norm     = Column(String(150))
    cpf           = Column(String(14))
    cargo         = Column(String(100))
    situacao      = Column(String(50))
    centro_custo  = Column(String(80))
    data_admissao = Column(Date, nullable=True)
    data_deslig   = Column(Date, nullable=True)
    chefia        = Column(String(150))
    projeto       = Column(String(100))
    ativo         = Column(Boolean, default=True)
    empresa_id    = Column(Integer, ForeignKey("empresas.id"), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    empresa       = relationship("Empresa", back_populates="colaboradores")
