from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.importacao import Importacao, StatusImpEnum
from app.services.importacao_service import (
    detectar_modulo, salvar_arquivo, processar_colaboradores,
    processar_refeitorio, ModuloEnum
)
import traceback

router = APIRouter(prefix="/importacao", tags=["importacao"])

@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    competencia_id: int = Form(...),
    empresa_id: int = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    modulo = detectar_modulo(file.filename)
    path = salvar_arquivo(file)
    
    imp = Importacao(
        modulo=modulo, nome_arquivo=file.filename, caminho=path,
        status=StatusImpEnum.processando, competencia_id=competencia_id,
        importado_por=current_user.id
    )
    db.add(imp); db.commit(); db.refresh(imp)
    
    try:
        if modulo == ModuloEnum.colaboradores:
            resultado = processar_colaboradores(db, path, empresa_id)
        elif modulo == ModuloEnum.refeitorio:
            resultado = processar_refeitorio(db, path, competencia_id)
        else:
            resultado = {"modulo": modulo.value, "status": "processado", "arquivo": file.filename}
        
        imp.status = StatusImpEnum.concluido
        imp.resultado = resultado
        imp.total_registros = resultado.get("total", 0)
        imp.total_erros = resultado.get("erros", 0)
    except Exception as e:
        imp.status = StatusImpEnum.erro
        imp.log = traceback.format_exc()
    
    db.commit()
    return {"id": imp.id, "modulo": modulo.value, "status": imp.status, "resultado": imp.resultado}

@router.get("/historico")
def historico(competencia_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Importacao).filter(Importacao.competencia_id == competencia_id).all()
