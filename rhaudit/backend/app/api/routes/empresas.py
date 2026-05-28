from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.models.empresa import Empresa
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/empresas", tags=["empresas"])

@router.get("/")
def listar(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Empresa).filter(Empresa.ativo == True).all()

@router.put("/{emp_id}/config")
def atualizar_config(emp_id: int, config: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    emp = db.query(Empresa).filter(Empresa.id == emp_id).first()
    if not emp: raise HTTPException(404, "Empresa não encontrada")
    emp.config = {**(emp.config or {}), **config}
    db.commit()
    return emp
