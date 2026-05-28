from sqlalchemy import Column, Integer, String, JSON, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class AuditTrail(Base):
    __tablename__ = "audit_trail"

    id          = Column(Integer, primary_key=True)
    acao        = Column(String(100), nullable=False)
    modulo      = Column(String(50))
    descricao   = Column(Text)
    dados_antes = Column(JSON)
    dados_depois= Column(JSON)
    ip          = Column(String(45))
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    user        = relationship("User", back_populates="audit_trails")
