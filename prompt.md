# 🚀 Modo Produção — Altcorp Avarias

> Status: Backend corrigido ✅ | Frontend web corrigido ✅ | PWA Login corrigido ✅ | PWA Inspection corrigido ✅ | Falta: XLSX e syncQueue

---

## ✅ JÁ FEITO (não mexer)

| Tarefa | Arquivo | Detalhe |
|---|---|---|
| Autofill removido | `frontend/src/pages/Login.tsx` | `useState("")` nos dois campos |
| Autofill removido | `mobile/src/pages/Login.tsx` | `useState("")` nos dois campos |
| Label "Usuário" | ambos Login.tsx | `type="text"`, ícone `User` |
| Contas demo removidas | `frontend/src/pages/Login.tsx` | Bloco "Contas de teste" deletado |
| Seed limpo | `backend/app/seed.py` | Só Admin, sem demo/veículos |
| Senha admin | `backend/app/core/config.py` | `REDACTED` |
| Logo Altcorp PWA | `mobile/src/pages/Login.tsx` | Shield SVG em `bg-lime-400 text-ink-900` |
| Favicon | `mobile/public/favicon.ico` e `altcorp-logo.png` | Já existem |
| Pydantic corrigido | `backend/app/schemas/auth.py` | `email: str` (não EmailStr) — aceita username |
| Erro React corrigido | ambos Login.tsx | catch trata detail array/objeto |
| Vistoria Retorno | `mobile/src/pages/Inspection.tsx` | Retorno: só prefixo; Saída: placa+prefixo |

---

## 🔧 PENDENTE

### 1. Tela de Frota — Trocar CSV → XLSX

**Frontend** `frontend/src/pages/Vehicles.tsx`:
- No `ImportModal`: `accept=".xlsx,.xls"`, texto "Apenas .xlsx (Excel)"
- Baixar exemplo como `.xlsx`

**Backend** `backend/app/api/v1/vehicles.py`:
- Novo endpoint `POST /api/v1/vehicles/import-xlsx` com `openpyxl`
- Colunas: plate, prefix, model, chassis, year, vehicle_type

**Backend** `backend/requirements.txt`:
- Adicionar `openpyxl>=3.1.0`

### 2. Corrigir bugs da fila de sincronização

**Arquivo** `mobile/src/sync/syncQueue.ts`:
- Garantir `running = false` sempre no `syncNow`
- `PHOTO_UPLOAD_TIMEOUT` → `180_000` (3 min)
- Teto de tentativas: `attempts >= 10` → `"blocked"`
- Fallback com `setTimeout(syncNow, 2000)` quando lock não adquirido

---

## 📦 Resumo de Arquivos

| Arquivo | Status |
|---|---|
| `frontend/src/pages/Login.tsx` | ✅ Pronto |
| `mobile/src/pages/Login.tsx` | ✅ Pronto |
| `mobile/src/pages/Inspection.tsx` | ✅ Pronto |
| `backend/app/schemas/auth.py` | ✅ Pronto |
| `backend/app/seed.py` | ✅ Pronto |
| `backend/app/core/config.py` | ✅ Pronto |
| `frontend/src/pages/Vehicles.tsx` | 🔧 Pendente (XLSX) |
| `backend/app/api/v1/vehicles.py` | 🔧 Pendente (XLSX) |
| `backend/requirements.txt` | 🔧 Pendente (openpyxl) |
| `mobile/src/sync/syncQueue.ts` | 🔧 Pendente (bugs) |
