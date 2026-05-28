import pandas as pd
import hashlib, os
from sqlalchemy.orm import Session
from fastapi import UploadFile
from app.models.importacao import Importacao, ModuloEnum, StatusImpEnum
from app.models.inconsistencia import Inconsistencia, GravidadeEnum, StatusIncEnum
from app.models.colaborador import Colaborador
from app.core.config import settings
from datetime import datetime

MODULO_MAP = {
    "HOME_OFFICE":    ModuloEnum.home_office,
    "DESLOCAMENTO":   ModuloEnum.deslocamento,
    "FRETADO_BETIM":  ModuloEnum.fretado_betim,
    "FRETADO_GOIANA": ModuloEnum.fretado_goiana,
    "REFEITORIO":     ModuloEnum.refeitorio,
    "HORAEXTRA":      ModuloEnum.he_an,
    "ADNOTURNO":      ModuloEnum.he_an,
    "PONTO":          ModuloEnum.ponto,
    "ATIVOS":         ModuloEnum.colaboradores,
}

def detectar_modulo(filename: str) -> ModuloEnum:
    upper = filename.upper()
    for key, modulo in MODULO_MAP.items():
        if key in upper:
            return modulo
    return ModuloEnum.colaboradores

def salvar_arquivo(file: UploadFile) -> str:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = os.path.join(settings.UPLOAD_DIR, f"{ts}_{file.filename}")
    content = file.file.read()
    with open(path, "wb") as f:
        f.write(content)
    file.file.seek(0)
    return path

def ler_base_planilha(path: str, sheet: str = None) -> pd.DataFrame:
    """Lê planilha detectando automaticamente o header real."""
    xl = pd.ExcelFile(path)
    sheet_name = sheet or xl.sheet_names[0]
    raw = pd.read_excel(path, sheet_name=sheet_name, header=None)
    for i, row in raw.iterrows():
        vals = [str(v).strip().upper() for v in row.values if pd.notna(v)]
        if any(k in vals for k in ["REGISTRO","NOME COLABORADOR","MATRÍCULA","NOME_PESSOA"]):
            df = pd.read_excel(path, sheet_name=sheet_name, header=i)
            df.columns = [str(c).strip().replace("\n"," ") for c in df.columns]
            return df.dropna(how="all")
    return pd.DataFrame()

def processar_colaboradores(db: Session, path: str, empresa_id: int) -> dict:
    df = ler_base_planilha(path)
    if df.empty:
        return {"total": 0, "erros": 1, "msg": "Não foi possível ler o arquivo"}
    
    total, ok, erros = 0, 0, 0
    unidade_map = {"GOIANA": empresa_id + 1}  # simplificado
    
    for _, row in df.iterrows():
        total += 1
        try:
            matricula = str(row.get("REGISTRO", row.get("MATRÍCULA", ""))).strip()
            nome = str(row.get("NOME_PESSOA", row.get("NOME COLABORADOR", ""))).strip()
            if not matricula or matricula == "nan":
                erros += 1; continue
            
            # upsert
            colab = db.query(Colaborador).filter(
                Colaborador.matricula == matricula,
                Colaborador.empresa_id == empresa_id
            ).first()
            
            if not colab:
                colab = Colaborador(matricula=matricula, empresa_id=empresa_id)
                db.add(colab)
            
            colab.nome      = nome
            colab.cargo     = str(row.get("NOME_CARGO","")).strip() or None
            colab.situacao  = str(row.get("NOME_SITUACAO","")).strip() or None
            colab.centro_custo = str(row.get("NOME_CENTRO_CUSTO","")).strip() or None
            colab.chefia    = str(row.get("CHEFIA_NOME_PESSOA","")).strip() or None
            ok += 1
        except Exception:
            erros += 1
    
    db.commit()
    return {"total": total, "importados": ok, "erros": erros}

def processar_refeitorio(db: Session, path: str, competencia_id: int) -> dict:
    try:
        df = pd.read_excel(path, sheet_name="BASE_ENRIQUECIDA")
        inc = pd.read_excel(path, sheet_name="INCONSISTÊNCIAS")
    except Exception as e:
        return {"total": 0, "erros": 1, "msg": str(e)}
    
    inconsistencias = []
    for _, row in inc.iterrows():
        if str(row.get("Tipo Inconsistência","")).strip() == "NÃO LOCALIZADO":
            inconsistencias.append(Inconsistencia(
                modulo="refeitorio",
                tipo="NÃO LOCALIZADO",
                descricao=f"{row.get('Nome Original','')} — sem matrícula na base de RH",
                gravidade=GravidadeEnum.alta,
                categoria="financeiro",
                nome_ref=str(row.get("Nome Original","")),
                competencia_id=competencia_id,
            ))
    
    if inconsistencias:
        db.add_all(inconsistencias)
        db.commit()
    
    total_val = pd.to_numeric(df.get("Valor (R$)", pd.Series()), errors="coerce").sum()
    return {"total": len(df), "inconsistencias": len(inconsistencias), "total_valor": round(total_val, 2)}
