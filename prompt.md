📋 PROMPT MASTER: Sistema de Controle e Registro de Avarias de Frota
Objetivo Central:
Desenvolver um sistema de missão crítica para registro de avarias em veículos (ônibus e carros) durante vistorias de saída e entrada na garagem. O foco principal é a retenção legal de imagens (comprovação jurídica), velocidade de operação no pátio (offline-first) e análise de dados avançada para a gestão.

Padrão Visual (UI/UX):

Aparência: Interface moderna, limpa (clean), elegante e animada.

Paleta de Cores: Fundo principal obrigatoriamente branco com elementos em (#010118) e tons de azul para contrastes e botões.

Design System: Uso de TailwindCSS para garantir responsividade e consistência.

Stack Tecnológico Rigoroso:

Infraestrutura: Docker e Docker Compose (orquestração total do ambiente local/produção).

Backend: Python (FastAPI recomendado pela alta performance) para controle de APIs RESTful.

Banco de Dados: PostgreSQL (armazenamento relacional sólido para usuários, veículos, logs e relacionamentos).

Armazenamento de Mídia: MinIO (Blob Storage local rodando no Docker, compatível com API S3) para armazenar fotos a longo prazo, garantindo escalabilidade.

Frontend Web & Mobile (PWA): TypeScript, React (JSX), ecossistema Node.js (Vite).

MÓDULO 1: Controle de Acessos e Usuários (RBAC)
O sistema deve ter níveis rígidos de acesso. Ninguém se cadastra sozinho; contas são criadas internamente.

Nível 1: Master/Admin: Controle total. Cria/edita/inativa qualquer usuário, visualiza todos os dashboards, configura o sistema e tem poder de auditoria.

Nível 2: Analista / Gestor: Acesso apenas à plataforma Web. Pode ver os dashboards, extrair relatórios, gerenciar cadastros de veículos e visualizar o feed operacional. Não cria usuários e não usa o app de vistoria.

Nível 3: Inspetor: Acesso EXCLUSIVO ao PWA Mobile. Só pode fazer login, registrar avarias e sincronizar. Não tem acesso à plataforma Web analítica.

MÓDULO 2: Web App (Plataforma Analítica e de Gestão)
Interface web voltada para monitoramento e análise de dados, contendo uma barra lateral com as seguintes telas:

Dashboard de Inteligência:

Métricas principais: Total de veículos avariados na semana, ranking dos veículos com mais problemas, tempo médio entre vistorias.

Gráficos dinâmicos e exportáveis.

Feed Operacional em Tempo Real (Estilo Rede Social):

Timeline atualizada em tempo real (WebSockets ou Polling otimizado).

Cards mostrando: Foto principal, placa do veículo, tipo de vistoria (Saída/Retorno), nome do inspetor, data/hora exata e status (Aprovado ou Com Avaria).

Mapa de Calor de Avarias (Visual):

Interface mostrando o "esqueleto" ou wireframe de um ônibus/carro.

Exibição visual das áreas com maior índice de impacto/avarias (ex: parachoque dianteiro, lateral direita) baseada nos cliques/registros dos inspetores no app.

Gestão de Veículos (Prontuário):

Cadastro de frota (Placa, Prefixo, Modelo, Chassi, Ano).

Tela de perfil do veículo detalhando todo o seu histórico ("prontuário"), mostrando uma linha do tempo de todas as vistorias pelas quais ele passou, com acesso direto ao banco de imagens.

Gestão de Usuários:

Tela administrativa (exclusiva do Admin) para cadastrar, editar permissões e inativar usuários.

MÓDULO 3: PWA Mobile (Operação de Campo)
Focado em velocidade extrema e garantia de dados, rodando como um aplicativo no celular do inspetor.

Mecanismo Offline-First (Resiliência Total):

O PWA deve usar Service Workers e IndexedDB.

Se o app for fechado, o celular reiniciado ou a aba morta, os dados não podem ser perdidos. Eles devem permanecer no IndexedDB.

Ao recuperar conexão de rede, o app sincroniza os dados silenciosamente em background com o backend Python e limpa a fila local.

Fluxo de Registro Simplificado:

Tela 1: Login seguro (JWT).

Tela 2 (Principal): Botões gigantes - "Vistoria de Saída" e "Vistoria de Retorno". Status da rede no topo (Online / Offline / Sincronizando).

Tela 3 (Registro): Busca rápida da placa do veículo. Interface de clique na área do dano (alimentando o mapa de calor).

Captura de Fotos: Integração com a câmera nativa. As fotos devem ser levemente comprimidas no frontend antes de irem para o IndexedDB/Servidor.

Campo de texto para descrição da avaria.

Botão "Salvar Registro" (instantâneo, sem loads de rede na tela).

Diretrizes de Código para o LLM:
Desenvolva o código seguindo as melhores práticas de Clean Architecture. Os arquivos devem ser entregues completos, sem omissões de lógicas críticas.

Visão Geral do Projeto (Arquitetura e Execução)
Para construirmos esse sistema completo de forma organizada, dividiremos o projeto nos seguintes blocos lógicos:

Infraestrutura e Banco de Dados (Docker, PostgreSQL, MinIO): Configuração do ambiente base.

Backend Python (FastAPI): Modelagem do banco, rotas de autenticação, usuários e rotas de veículos/avarias.

Integração de Arquivos (Boto3): Lógica no backend para enviar e recuperar fotos do MinIO.

Frontend Web (React/Vite): Estruturação do painel escuro (#010118), rotas de admin, feed operacional e dashboards.

Frontend Mobile PWA: Configuração do Service Worker, IndexedDB para modo offline e fluxo simplificado de câmera.