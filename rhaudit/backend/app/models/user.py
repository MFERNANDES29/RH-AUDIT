from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class PerfilEnum(str, enum.Enum):
    admin   = "admin"
    rh      = "rh"
    gestor  = "gestor"
    analista= "analista"

class StatusEnum(str, enum.Enum):
    ativo   = "ativo"
    inativo = "inativo"
    pendente= "pendente"

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    nome            = Column(String(150), nullable=False)
    email           = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    perfil          = Column(Enum(PerfilEnum), nullable=False)
    status          = Column(Enum(StatusEnum), default=StatusEnum.ativo)
    primeiro_acesso = Column(Boolean, default=True)
    permissoes      = Column(JSON, default={})
    empresas_acesso = Column(JSON, default=[])
    ultimo_acesso   = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    audit_trails    = relationship("AuditTrail", back_populates="user")
