# Altcorp Avarias

Sistema de Controle e Registro de Avarias de Frota.

Stack:
- **Backend**: FastAPI + SQLAlchemy + Alembic (PostgreSQL)
- **Storage**: MinIO (S3-compatible) para fotos
- **Web**: React + Vite + Tailwind (admin)
- **Mobile**: React + Vite PWA (motorista, offline-first via Dexie)

---

## Deploy em VM (producao)

### Pre-requisitos
- Docker 24+ e Docker Compose v2
- Git
- Portas livres no host: `5173` (web), `5174` (mobile), `8000` (API), `9000`/`9001` (MinIO), `5432` (Postgres)

### Passo a passo

1. **Clone**:
   ```bash
   git clone https://github.com/Luizfmenezes/Altcorp-Avaria.git
   cd Altcorp-Avaria
   ```

2. **Configure o `.env`** a partir do template:
   ```bash
   cp .env.example .env
   ```

   Edite `.env` e ajuste **obrigatoriamente**:

   | Variavel | O que colocar |
   |---|---|
   | `HOST_IP` | IP da VM na rede (ex: `192.168.1.50`). Use `localhost` so pra testar local. |
   | `POSTGRES_PASSWORD` | Senha forte do Postgres |
   | `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | Credenciais admin do MinIO |
   | `JWT_SECRET` | Gere com `openssl rand -hex 32` |
   | `CORS_ORIGINS` | Inclua as origens reais do frontend, ex: `https://avaria.altcorphub.com` |
   | `VITE_API_URL` | Em deploy com nginx/proxy reverso, use `/api` |
   | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Conta admin criada na primeira subida |
   | `OLHOVIVO_TOKEN` | Token SPTrans (opcional, so pra rastreio de onibus) |

3. **Suba o stack**:
   ```bash
   docker compose up -d --build
   ```

   Na primeira execucao o backend roda `alembic upgrade head` e cria o admin do `.env`.

4. **Acessos** (substituindo `HOST_IP` pelo IP configurado):

   | Servico | URL |
   |---|---|
   | Web (admin) | `http://HOST_IP:5173` |
   | Mobile (PWA) | `http://HOST_IP:5174` |
   | API | `http://HOST_IP:8000` (docs: `/docs`) |
   | MinIO Console | `http://HOST_IP:9001` |

### Atualizar

```bash
git pull
docker compose up -d --build
```

### Logs e troubleshooting

```bash
docker compose logs -f backend
docker compose logs -f web mobile
docker compose ps
```

Se o frontend retornar `localhost` em vez do IP da VM:
- Confirme que `HOST_IP` esta setado em `.env` antes do build.
- Em deploy web/mobile atras do nginx, use `VITE_API_URL=/api`.
- Rebuild forcado: `docker compose build --no-cache web mobile && docker compose up -d`.

Se aparecer erro de CORS no login:
- Confirme que `CORS_ORIGINS` contem o dominio publico usado no browser, por exemplo `https://avaria.altcorphub.com`.
- Se o frontend estiver publicado no mesmo dominio do proxy, prefira `VITE_API_URL=/api` para evitar chamadas cross-origin ao backend.

Se o MinIO recusar uploads:
- Verifique que `MINIO_ROOT_PASSWORD` tem minimo 8 caracteres.
- Checar bucket criado: `docker compose logs minio-init`.

### Backup

```bash
docker compose exec postgres pg_dump -U avarias avarias > backup_$(date +%F).sql

docker run --rm -v altcorp-avaria_minio_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/minio_$(date +%F).tar.gz -C /data .
```

---

## Desenvolvimento local

Backend:
```bash
cd backend
python -m venv .venv
. .venv/bin/activate   # Linux/macOS
.venv\Scripts\activate # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend / Mobile:
```bash
cd frontend  # ou mobile
npm install
npm run dev
```
