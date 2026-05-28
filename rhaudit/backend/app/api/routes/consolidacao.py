from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import hashlib, json
from app.db.base import get_db
from app.models.consolidacao import Consolidacao
from app.models.competencia import Competencia, StatusFopagEnum
from app.api.deps import get_current_user
from app.services.exportacao_service import gerar_base_consolidada, gerar_relatorio_pdf
from fastapi.responses import FileResponse

router = APIRouter(prefix="/consolidacao", tags=["consolidacao"])

@router.post("/{competencia_id}/gerar")
def gerar(competencia_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    comp = db.query(Competencia).filter(Competencia.id == competencia_id).first()
    if not comp: raise HTTPException(404, "Competência não encontrada")
    
    snapshot = {"competencia_id": competencia_id, "gerado_em": datetime.utcnow().isoformat(),
                "gerado_por": current_user.email}
    hash_doc = hashlib.sha256(json.dumps(snapshot).encode()).hexdigest()[:16]
    
    cons = Consolidacao(competencia_id=competencia_id, snapshot=snapshot, hash_doc=hash_doc)
    db.add(cons); db.commit(); db.refresh(cons)
    return {"id": cons.id, "hash": hash_doc, "msg": "Base consolidada gerada"}

@router.post("/{competencia_id}/aprovar-n1")
def aprovar_n1(competencia_id: int, obs: str = "", db: Session = Depends(get_db),
               current_user=Depends(get_current_user)):
    cons = db.query(Consolidacao).filter(Consolidacao.competencia_id == competencia_id).order_by(Consolidacao.id.desc()).first()
    if not cons: raise HTTPException(404, "Consolidação não encontrada")
    cons.aprovado_n1_por = current_user.id
    cons.aprovado_n1_em  = datetime.utcnow()
    cons.assinatura_n1   = {"user": current_user.email, "nome": current_user.nome,
                            "obs": obs, "em": datetime.utcnow().isoformat()}
    db.commit()
    return {"msg": "Nível 1 aprovado"}

@router.post("/{competencia_id}/aprovar-n2")
def aprovar_n2(competencia_id: int, obs: str = "", db: Session = Depends(get_db),
               current_user=Depends(get_current_user)):
    cons = db.query(Consolidacao).filter(Consolidacao.competencia_id == competencia_id).order_by(Consolidacao.id.desc()).first()
    if not cons: raise HTTPException(404, "Consolidação não encontrada")
    if not cons.aprovado_n1_por: raise HTTPException(400, "Aprovação Nível 1 pendente")
    cons.aprovado_n2_por = current_user.id
    cons.aprovado_n2_em  = datetime.utcnow()
    cons.assinatura_n2   = {"user": current_user.email, "nome": current_user.nome,
                            "obs": obs, "em": datetime.utcnow().isoformat()}
    comp = db.query(Competencia).filter(Competencia.id == competencia_id).first()
    comp.status = StatusFopagEnum.fechada
    comp.fechada_em = datetime.utcnow()
    db.commit()
    return {"msg": "FOPAG fechada com sucesso"}

@router.get("/{competencia_id}/exportar-xlsx")
def exportar_xlsx(competencia_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    comp = db.query(Competencia).filter(Competencia.id == competencia_id).first()
    path = gerar_base_consolidada(db, competencia_id, comp.empresa.nome if comp else "")
    return FileResponse(path, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        filename=path.split("/")[-1])

@router.get("/{competencia_id}/exportar-pdf")
def exportar_pdf(competencia_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    comp = db.query(Competencia).filter(Competencia.id == competencia_id).first()
    path = gerar_relatorio_pdf(db, competencia_id, comp.empresa.nome if comp else "", comp.descricao if comp else "")
    return FileResponse(path, media_type="application/pdf", filename=path.split("/")[-1])
