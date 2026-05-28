from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.base import get_db
from app.models.inconsistencia import Inconsistencia, GravidadeEnum, StatusIncEnum
from app.schemas.inconsistencia import InconsistenciaUpdate, InconsistenciaResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/inconsistencias", tags=["inconsistencias"])

@router.get("/", response_model=List[InconsistenciaResponse])
def listar(competencia_id: int, gravidade: Optional[GravidadeEnum] = None,
           status: Optional[StatusIncEnum] = None, modulo: Optional[str] = None,
           db: Session = Depends(get_db), _=Depends(get_current_user)):
    q = db.query(Inconsistencia).filter(Inconsistencia.competencia_id == competencia_id)
    if gravidade: q = q.filter(Inconsistencia.gravidade == gravidade)
    if status:    q = q.filter(Inconsistencia.status == status)
    if modulo:    q = q.filter(Inconsistencia.modulo == modulo)
    return q.order_by(Inconsistencia.gravidade).all()

@router.put("/{inc_id}", response_model=InconsistenciaResponse)
def tratar(inc_id: int, data: InconsistenciaUpdate, db: Session = Depends(get_db),
           current_user=Depends(get_current_user)):
    inc = db.query(Inconsistencia).filter(Inconsistencia.id == inc_id).first()
    if not inc: raise HTTPException(404, "Inconsistência não encontrada")
    if data.tratativa: inc.tratativa = data.tratativa
    if data.status:    inc.status    = data.status
    if data.status in (StatusIncEnum.resolvida, StatusIncEnum.ignorada):
        inc.resolvida_por = current_user.id
    db.commit(); db.refresh(inc)
    return inc
