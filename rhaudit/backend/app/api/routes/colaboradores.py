from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.base import get_db
from app.models.colaborador import Colaborador
from app.schemas.colaborador import ColaboradorCreate, ColaboradorResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/colaboradores", tags=["colaboradores"])

@router.get("/", response_model=List[ColaboradorResponse])
def listar(empresa_id: Optional[int] = None, q: Optional[str] = None,
           situacao: Optional[str] = None, skip: int = 0, limit: int = 100,
           db: Session = Depends(get_db), _=Depends(get_current_user)):
    query = db.query(Colaborador)
    if empresa_id: query = query.filter(Colaborador.empresa_id == empresa_id)
    if situacao:   query = query.filter(Colaborador.situacao == situacao)
    if q:          query = query.filter(Colaborador.nome.ilike(f"%{q}%") | Colaborador.matricula.ilike(f"%{q}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/{colab_id}", response_model=ColaboradorResponse)
def detalhe(colab_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Colaborador).filter(Colaborador.id == colab_id).first()
    if not c: raise HTTPException(404, "Colaborador não encontrado")
    return c

@router.put("/{colab_id}", response_model=ColaboradorResponse)
def atualizar(colab_id: int, data: ColaboradorCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Colaborador).filter(Colaborador.id == colab_id).first()
    if not c: raise HTTPException(404, "Colaborador não encontrado")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(c, field, value)
    db.commit(); db.refresh(c)
    return c
