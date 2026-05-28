from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class ModuloEnum(str, enum.Enum):
    home_office   = "home_office"
    deslocamento  = "deslocamento"
    fretado_betim = "fretado_betim"
    fretado_goiana= "fretado_goiana"
    refeitorio    = "refeitorio"
    he_an         = "he_an"
    ponto         = "ponto"
    colaboradores = "colaboradores"

class StatusImpEnum(str, enum.Enum):
    processando= "processando"
    concluido  = "concluido"
    erro       = "erro"

class Importacao(Base):
    __tablename__ = "importacoes"

    id             = Column(Integer, primary_key=True)
    modulo         = Column(Enum(ModuloEnum), nullable=False)
    nome_arquivo   = Column(String(255), nullable=False)
    caminho        = Column(String(500))
    status         = Column(Enum(StatusImpEnum), default=StatusImpEnum.processando)
    total_registros= Column(Integer, default=0)
    total_erros    = Column(Integer, default=0)
    resultado      = Column(JSON, default={})
    log            = Column(Text)
    competencia_id = Column(Integer, ForeignKey("competencias.id"), nullable=False)
    importado_por  = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    competencia    = relationship("Competencia", back_populates="importacoes")
