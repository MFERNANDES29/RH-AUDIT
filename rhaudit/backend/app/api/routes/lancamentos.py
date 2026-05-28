from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.lancamento import Lancamento, StatusLancEnum
from app.schemas.lancamento import LancamentoCreate, LancamentoResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/lancamentos", tags=["lancamentos"])

@router.get("/", response_model=List[LancamentoResponse])
def listar(competencia_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Lancamento).filter(Lancamento.competencia_id == competencia_id).all()

@router.post("/", response_model=LancamentoResponse)
def criar(data: LancamentoCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    requer = data.valor > 500
    lanc = Lancamento(**data.model_dump(), criado_por=current_user.id,
                       requer_aprovacao=requer,
                       status=StatusLancEnum.pendente if requer else StatusLancEnum.aprovado)
    db.add(lanc); db.commit(); db.refresh(lanc)
    return lanc

@router.put("/{lanc_id}/aprovar")
def aprovar(lanc_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    lanc = db.query(Lancamento).filter(Lancamento.id == lanc_id).first()
    if not lanc: raise HTTPException(404, "Lançamento não encontrado")
    lanc.status = StatusLancEnum.aprovado
    lanc.aprovado_por = current_user.id
    db.commit()
    return {"msg": "Aprovado"}

@router.put("/{lanc_id}/cancelar")
def cancelar(lanc_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    lanc = db.query(Lancamento).filter(Lancamento.id == lanc_id).first()
    if not lanc: raise HTTPException(404, "Lançamento não encontrado")
    lanc.status = StatusLancEnum.cancelado
    db.commit()
    return {"msg": "Cancelado"}
