📋 Plano: Melhorias e Novas Funcionalidades — Altcorp Avarias
TL;DR: Reformular design do PWA mobile, adicionar favicon/logo Altcorp, criar busca inteligente na Sidebar, implementar foto padrão por veículo, substituir quadrados por círculos no heatmap 2D/3D, suporte a veículos tipo "carro", botão "Ver modelo 3D" realocado, filtros na tela de Operação, edição de veículos na Frota, integração com API Olho Vivo SPTrans para rastreamento, e correção de bugs de sincronização do PWA.

FASE 1 — Design e Identidade Visual (PWA + Frontend)
Favicon e logo da Altcorp — Adicionar favicon.ico, apple-touch-icon, logo nos HTMLs do frontend e mobile
Redesign do PWA mobile — Substituir paleta navy por ink + lime, alinhar com design system web (Bricolage Grotesque, Inter Tight, cards arredondados, glassmorphism)
Foto padrão do veículo na Operação — Quando sem avaria, mostrar default_photo_url do veículo
Cadastro de foto padrão no veículo — Backend: campo default_photo_key no Vehicle; endpoint de upload; Frontend: upload no modal de veículo
FASE 2 — Busca Inteligente na Sidebar
Cmd+K / busca funcional — Modal/popover que pesquisa GET /api/v1/vehicles?q=... por prefixo, placa, modelo; ao selecionar, navega ao prontuário
FASE 3 — Filtros na Tela de Operação
Filtros no Feed — Filtros por prefixo, marca/modelo, dia/mês; padrão "hoje"; botão Clear; backend ajustado para aceitar query params
FASE 4 — Mapa de Calor com Círculos
Círculos no VehicleSilhouette — Substituir rect/path vermelhos por círculos proporcionais ao número de avarias (mais danos = maior círculo)
Labels em português — left_side_front → "Lateral dianteira esquerda", etc.
Esferas 3D no Bus3D — Substituir boxGeometry por sphereGeometry com raio proporcional
Botão "Ver modelo 3D" — Reposicionar para cima do "Pico:" na legenda do heatmap
FASE 5 — Suporte a Carros
VehicleSilhouette para carro — Renderizar SVG de carro quando vehicle_type === "car"
Bus3D para carro — Adicionar CAR_AREAS_3D e modelo 3D de carro
Botão 3D no VehicleDetail — Ao lado do heatmap individual
Modal 3D com suporte a carro — Seletor "Ver somente carros / ônibus"
FASE 6 — Edição de Veículos na Frota
Botão editar (lápis) na tabela — Modal com campos preenchidos, toggle ativar/desativar
Tipo do veículo no prontuário — Badge "Ônibus" ou "Carro" no hero
FASE 7 — Filtros no Prontuário
Filtros no histórico — "Últimas saídas", "Ver mês", "Ver dia"; backend com query params
FASE 8 — Rastreamento Olho Vivo SPTrans
19-20. Backend: cliente Olho Vivo — Autenticação com chave, endpoints de busca e posição
21. Mapa no prontuário — Botão "Ver no mapa" só para ônibus; mapa Leaflet com marcador; atualização a cada 30-60s

FASE 9 — Correção de Bugs de Sincronização do PWA
22-23. Diagnóstico e correção — Lock de concorrência, versão do DB, timeout maior para fotos, retry com backoff, feedback de progresso

📁 Arquivos Relevantes
Frontend: Sidebar.tsx, Topbar.tsx, VehicleSilhouette.tsx, Bus3D.tsx, Bus3DModal.tsx, bus3d-areas.ts, Heatmap.tsx, Feed.tsx, Vehicles.tsx, VehicleDetail.tsx
Mobile: Home.tsx, Inspection.tsx, Queue.tsx, Login.tsx, index.css, AreaPicker.tsx, syncQueue.ts, sw.ts, dexie.ts
Backend: vehicle.py (model/schema/api), inspections.py, sptrans.py (novo), storage.py, requirements.txt