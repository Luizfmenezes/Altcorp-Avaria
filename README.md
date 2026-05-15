# Altcorp Avarias

Sistema de controle e registro de avarias de frota com backend FastAPI, plataforma web analitica em React e PWA mobile offline-first.

## Execucao rapida

1. Copie `.env.example` para `.env` na raiz do projeto.
2. Suba a stack com `docker compose up --build`.
3. Acesse:
   - Web analitica: `http://localhost:5173`
   - PWA mobile: `http://localhost:5174`
   - API: `http://localhost:8000`
   - MinIO console: `http://localhost:9001`

## Credenciais seed

- Admin: `admin@altcorp.com` / `admin123`
- Analista: `analista@altcorp.com` / `analista123`
- Inspetor: `inspetor@altcorp.com` / `inspetor123`

## Checklist offline do PWA

1. Faça login no PWA com o perfil de inspetor.
2. Abra a tela inicial e confirme o badge de rede exibindo `Online`.
3. Desative a rede no aparelho ou no DevTools remoto.
4. Crie uma vistoria com foto e salve.
5. Abra `Fila de envio` e confirme o registro como `Na fila`.
6. Feche completamente a aba ou o app instalado e abra de novo.
7. Volte em `Fila de envio` e confirme que o registro continua presente.
8. Reative a rede e aguarde a sincronizacao automatica.
9. Confirme que a fila esvaziou.
10. Valide no web que o item apareceu no `Feed Operacional` e no prontuario do veiculo.

## Observacoes de sincronizacao

- O PWA persiste a fila em IndexedDB.
- Em navegadores com Background Sync, o service worker tenta enviar a fila em segundo plano.
- Quando o navegador nao suporta Background Sync, o app faz fallback por eventos de foco, retorno de conectividade e varredura periodica.

## Validacao local

- Backend: `python -m compileall app`
- Web: `npm run build`
- Mobile: `npm run build`