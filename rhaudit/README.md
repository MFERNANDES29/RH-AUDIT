# RH Audit — Zeentech

Sistema de gestão de RH e auditoria de folha de pagamento.

## Stack
- **Back-end:** Python · FastAPI · SQLAlchemy · PostgreSQL
- **Front-end:** React 18 · Vite · Tailwind CSS · TanStack Query
- **Infra:** Docker · Docker Compose · Nginx · DigitalOcean

## Usuários iniciais
| Nome | E-mail | Perfil | Senha |
|------|--------|--------|-------|
| Mariane Fernandes | mfernandes@zeentech.com.br | Admin + Gestor | Zeen@2026! |
| Thais Silva | tsouza@zeentech.com.br | RH | Zeen@2026! |
| Moisés Zelteman | mnascimento@zeentech.com.br | Analista | Zeen@2026! |
| Barbara Lelis | blelis@zeentech.com.br | Analista | Zeen@2026! |
| Elaine Ramos Ferreira | erferreira@zeentech.com.br | Analista | Zeen@2026! |

> Todos devem alterar a senha no primeiro acesso.

## Rodar localmente
```bash
# Back-end
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Front-end
cd frontend
npm install && npm run dev
```

## Deploy em produção
Ver `docs/DEPLOY.md`

## API Documentation
Disponível em `/api/docs` após subir o servidor.

## Módulos implementados
- ✅ Autenticação JWT com troca de senha no 1º acesso
- ✅ Gestão de usuários e perfis com permissões granulares
- ✅ Importação automática de planilhas (HO, Desl., Fretado, Refeitório, HE/AN)
- ✅ Auditoria com tratativas e audit trail
- ✅ Créditos e débitos manuais com aprovação
- ✅ Consolidação com aprovação em 2 níveis
- ✅ Exportação Excel (openpyxl) e PDF (reportlab)
- ✅ Dashboard com gráficos
- ✅ Empresas: Stellantis Betim, Stellantis Goiana, Leap Motors/Mopar
