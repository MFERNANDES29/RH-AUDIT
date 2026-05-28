from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.db.base import engine, Base
from app.api.routes import auth, users, colaboradores, importacao, inconsistencias, lancamentos, consolidacao
from app.core.security import get_password_hash
import os

def create_tables():
    Base.metadata.create_all(bind=engine)

def seed_initial_data():
    from app.db.base import SessionLocal
    from app.models.user import User, PerfilEnum, StatusEnum
    from app.models.empresa import Empresa
    db = SessionLocal()
    try:
        # Empresas
        if not db.query(Empresa).first():
            empresas = [
                Empresa(nome="Stellantis Betim", sigla="BETIM", cidade="Betim", uf="MG",
                        config={"ho_bruto": 621.0, "ho_dias_base": 30, "ho_retroativo": True,
                                "desl_bruto": 453.0, "desl_desconto_pct": 50, "desl_retroativo": False}),
                Empresa(nome="Stellantis Goiana", sigla="GOIANA", cidade="Goiana", uf="PE",
                        config={"ho_bruto": 621.0, "ho_dias_base": 30, "ho_retroativo": True,
                                "desl_bruto": 453.0, "desl_desconto_pct": 50, "desl_retroativo": True}),
                Empresa(nome="Leap Motors / Mopar", sigla="LEAP", cidade="Goiana", uf="PE", config={}),
            ]
            db.add_all(empresas)
            db.commit()

        # Usuários iniciais
        if not db.query(User).first():
            usuarios = [
                User(nome="Mariane Fernandes", email="mfernandes@zeentech.com.br",
                     hashed_password=get_password_hash("Zeen@2026!"),
                     perfil=PerfilEnum.admin, status=StatusEnum.ativo, primeiro_acesso=True,
                     empresas_acesso=["Stellantis Betim","Stellantis Goiana","Leap Motors / Mopar"],
                     permissoes={"importar":True,"gerColabs":True,"tratarAudit":True,
                                 "aprovarCons":True,"exportar":True,"configurar":True,
                                 "gerUsers":True,"trocarEmp":True,"lancamentos":True}),
                User(nome="Thais Silva", email="tsouza@zeentech.com.br",
                     hashed_password=get_password_hash("Zeen@2026!"),
                     perfil=PerfilEnum.rh, status=StatusEnum.ativo, primeiro_acesso=True,
                     empresas_acesso=["Stellantis Betim","Stellantis Goiana","Leap Motors / Mopar"],
                     permissoes={"importar":True,"gerColabs":True,"tratarAudit":True,
                                 "aprovarCons":True,"exportar":True,"configurar":True,
                                 "gerUsers":True,"trocarEmp":True,"lancamentos":True}),
                User(nome="Moisés Zelteman", email="mnascimento@zeentech.com.br",
                     hashed_password=get_password_hash("Zeen@2026!"),
                     perfil=PerfilEnum.analista, status=StatusEnum.ativo, primeiro_acesso=True,
                     empresas_acesso=["Stellantis Betim","Stellantis Goiana","Leap Motors / Mopar"],
                     permissoes={"importar":True,"gerColabs":True,"tratarAudit":True,"exportar":True,"lancamentos":True}),
                User(nome="Barbara Lelis", email="blelis@zeentech.com.br",
                     hashed_password=get_password_hash("Zeen@2026!"),
                     perfil=PerfilEnum.analista, status=StatusEnum.ativo, primeiro_acesso=True,
                     empresas_acesso=["Stellantis Betim","Stellantis Goiana","Leap Motors / Mopar"],
                     permissoes={"importar":True,"gerColabs":True,"tratarAudit":True,"exportar":True,"lancamentos":True}),
                User(nome="Elaine Ramos Ferreira", email="erferreira@zeentech.com.br",
                     hashed_password=get_password_hash("Zeen@2026!"),
                     perfil=PerfilEnum.analista, status=StatusEnum.ativo, primeiro_acesso=True,
                     empresas_acesso=["Stellantis Betim","Stellantis Goiana","Leap Motors / Mopar"],
                     permissoes={"importar":True,"gerColabs":True,"tratarAudit":True,"exportar":True,"lancamentos":True}),
            ]
            db.add_all(usuarios)
            db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    seed_initial_data()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.EXPORT_DIR, exist_ok=True)
    yield

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION,
              description="Sistema de gestão de RH e auditoria — Zeentech",
              lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

PREFIX = "/api"
app.include_router(auth.router,            prefix=PREFIX)
app.include_router(users.router,           prefix=PREFIX)
app.include_router(colaboradores.router,   prefix=PREFIX)
app.include_router(importacao.router,      prefix=PREFIX)
app.include_router(inconsistencias.router, prefix=PREFIX)
app.include_router(lancamentos.router,     prefix=PREFIX)
app.include_router(consolidacao.router,    prefix=PREFIX)

@app.get("/health")
def health(): return {"status": "ok", "version": settings.APP_VERSION}

# Importar e registrar rotas adicionais
from app.api.routes import empresas, competencias
app.include_router(empresas.router,    prefix=PREFIX)
app.include_router(competencias.router,prefix=PREFIX)
