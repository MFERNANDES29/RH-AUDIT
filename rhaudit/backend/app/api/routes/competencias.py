from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.competencia import Competencia, StatusFopagEnum
from app.api.deps import get_current_user

router = APIRouter(prefix="/competencias", tags=["competencias"])

@router.get("/")
def listar(empresa_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Competencia).filter(Competencia.empresa_id == empresa_id).order_by(Competencia.ano.desc(), Competencia.mes.desc()).all()

@router.post("/")
def criar(mes: int, ano: int, empresa_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    existe = db.query(Competencia).filter(
        Competencia.mes == mes, Competencia.ano == ano, Competencia.empresa_id == empresa_id
    ).first()
    if existe: raise HTTPException(400, "Competência já existe")
    import calendar
    from datetime import date
    meses_pt = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    comp = Competencia(mes=mes, ano=ano, empresa_id=empresa_id,
                       descricao=f"FOPAG {meses_pt[mes]} {ano}",
                       status=StatusFopagEnum.aberta)
    db.add(comp); db.commit(); db.refresh(comp)
    return comp
