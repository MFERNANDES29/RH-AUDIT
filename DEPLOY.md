# Deploy RH Audit — DigitalOcean

## 1. Criar Droplet
- Plano: Basic · $12/mês · 2GB RAM · 1 vCPU · 50GB SSD
- Sistema: Ubuntu 24.04 LTS
- Região: São Paulo (sfo3 ou nyc3)
- Adicionar sua chave SSH

## 2. Conectar e instalar dependências
```bash
ssh root@SEU_IP

apt update && apt upgrade -y
apt install -y docker.io docker-compose-v2 git nginx certbot python3-certbot-nginx
systemctl enable docker && systemctl start docker
```

## 3. Clonar o projeto
```bash
git clone https://github.com/SEU_USUARIO/rhaudit.git /opt/rhaudit
cd /opt/rhaudit
```

## 4. Configurar variáveis de ambiente
```bash
cp .env.example .env
nano .env
# Altere: SECRET_KEY, DB_PASSWORD, SMTP_USER, SMTP_PASSWORD
```

## 5. Subir o sistema
```bash
cd /opt/rhaudit
docker compose up -d --build
# Aguardar ~2 minutos para inicializar
docker compose logs -f backend  # verificar logs
```

## 6. Configurar domínio e HTTPS
```bash
# Apontar DNS: registro A do seu domínio → IP do Droplet

# Configurar nginx para o domínio
certbot --nginx -d rhaudit.zeentech.com.br

# Renovação automática (já configurado pelo certbot)
```

## 7. Verificar funcionamento
```bash
curl http://localhost:8000/health   # deve retornar {"status":"ok"}
curl http://localhost/              # frontend React
```

## URLs após deploy
- **Sistema:** https://rhaudit.zeentech.com.br
- **API Docs:** https://rhaudit.zeentech.com.br/api/docs
- **Health:** https://rhaudit.zeentech.com.br/health

## Backup automático do banco
```bash
# Adicionar ao crontab (crontab -e)
0 3 * * * docker exec rhaudit-db-1 pg_dump -U rhaudit rhaudit > /opt/backups/rhaudit_$(date +%Y%m%d).sql
```

## Atualizar o sistema
```bash
cd /opt/rhaudit
git pull
docker compose up -d --build
```
