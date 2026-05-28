from sqlalchemy import Column, Integer, String, Boolean, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base

class Empresa(Base):
    __tablename__ = "empresas"

    id         = Column(Integer, primary_key=True)
    nome       = Column(String(150), unique=True, nullable=False)
    sigla      = Column(String(30), nullable=False)
    cidade     = Column(String(80))
    uf         = Column(String(2))
    ativo      = Column(Boolean, default=True)
    config     = Column(JSON, default={})  # padrões financeiros

    colaboradores  = relationship("Colaborador",  back_populates="empresa")
    competencias   = relationship("Competencia",  back_populates="empresa")
