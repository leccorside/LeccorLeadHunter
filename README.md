# LeadHunter Local - CRM & Prospecção Comercial Local

Plataforma autônoma e completa para prospecção comercial, qualificação de leads e gestão de relacionamento (CRM) de empresas locais, executada **100% localmente no seu computador através de Docker Compose**.

---

## 🚀 Visão Geral

O **LeadHunter Local** foi desenvolvido para identificar e prospectar empresas e prestadores de serviços locais que necessitam de:
- Criação e modernização de websites
- Desenvolvimento de sistemas sob medida
- Criação de aplicativos mobile
- Melhoria da presença digital e SEO
- Automação e cardápios digitais

A plataforma permite **buscar**, **qualificar com score automático**, **organizar no funil Kanban**, **geolocalizar no mapa** e **abrir contato direto via WhatsApp** sem necessidade de digitar mensagens manualmente.

---

## 🛠️ Stack Tecnológica

### Front-end
- **React 18** com **TypeScript** e **Vite**
- **Tailwind CSS** (design profissional de SaaS CRM com modo claro e escuro)
- **TanStack Query (React Query v5)** para cache e sincronização de dados
- **React Router DOM v6** para navegação SPA
- **Recharts** para gráficos interativos
- **Leaflet & React Leaflet** para o mapa de oportunidades geográfico
- **Lucide Icons** para ícones modernos

### Back-end
- **Node.js** com **NestJS 10** e **TypeScript**
- **Prisma ORM** com **PostgreSQL 16**
- **BullMQ** com **Redis 7** para processamento de filas e buscas assíncronas
- **Swagger / OpenAPI** disponível em `/api/docs`
- **Axios** para integrações externas
- **WebsiteAnalyzer** módulo independente para diagnóstico técnico de SEO e HTTPS

### Infraestrutura
- **Docker** & **Docker Compose**
- 5 containers orquestrados com volumes persistentes (`postgres_data`, `redis_data`)

---

## 📦 Serviços e Containers do Docker

| Container | Serviço | Porta Externa | Descrição |
| :--- | :--- | :--- | :--- |
| `lead-hunter-frontend` | React / Nginx | `3000` | Interface Web do CRM |
| `lead-hunter-backend` | NestJS API | `3001` | API REST e Swagger Docs |
| `lead-hunter-worker` | BullMQ Worker | - | Processamento assíncrono de buscas e análises |
| `lead-hunter-postgres` | PostgreSQL 16 | `5432` | Banco de dados relacional persistente |
| `lead-hunter-redis` | Redis 7 | `6379` | Cache e gerenciador de filas BullMQ |

---

## ⚡ Como Iniciar a Aplicação (Passo a Passo)

### 1. Pré-requisitos
- Ter o **Docker** e o **Docker Compose** instalados e em execução no computador.

### 2. Configurar Variáveis de Ambiente
O projeto já vem com `.env` pré-configurado com valores padrão para ambiente Docker. Se desejar usar sua própria chave da **Google Places API**, abra o `.env` e configure:

```env
GOOGLE_MAPS_API_KEY="SuaChaveDoGoogleMapsPlatform"
```

> **Nota:** Caso você não insira nenhuma chave do Google, o sistema utilizará automaticamente o provedor **OpenStreetMap (Overpass API)** como fallback gratuito, permitindo que você teste e utilize a plataforma imediatamente!

### 3. Iniciar todos os containers
No terminal, dentro da pasta do projeto, execute:

```bash
docker compose up -d --build
```

O Docker baixará as imagens, compilará o frontend, backend e worker, executará as migrações do Prisma com o seed de dados e iniciará todos os serviços.

### 4. Acessar o Sistema
- **Dashboard e CRM Web:** [http://localhost:3000](http://localhost:3000)
- **Documentação da API (Swagger):** [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **Health Check da Infraestrutura:** [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

## 🎯 Funcionalidades Principais

### 1. Dashboard Completo
- Métricas em tempo real no topo:
  - Total de leads
  - Leads encontrados hoje
  - Empresas sem site (maior oportunidade de venda)
  - Empresas com WhatsApp
  - Leads ainda não contatados
  - Leads convertidos em clientes ganhos
- Lembretes de follow-up (Atrasados, Hoje e Próximos)
- Gráficos de leads por dia, categoria, cidade, presença de site e avaliações

### 2. Busca de Empresas Assíncrona (BullMQ)
- Seleção em cascata: **País** -> **Estado** -> **Cidade** -> **Categoria**
- Criação de categorias personalizadas
- Filtros avançados:
  - *Somente empresas sem site*
  - *Somente empresas com telefone*
  - *Somente com WhatsApp*
  - *Filtro de avaliações mínimas/máximas e nota*
  - *Excluir empresas já cadastradas (deduplicação ativa)*
- Monitoramento em tempo real com barra de progresso e cancelamento gracioso

### 3. Score de Oportunidade Comercial (0 a 100)
Cada lead recebe automaticamente uma pontuação que calcula a probabilidade e facilidade de venda:
- **Sem site:** `+40 pontos`
- **Possui telefone:** `+10 pontos`
- **Possui WhatsApp:** `+20 pontos`
- **Mais de 20 avaliações:** `+10 pontos`
- **Mais de 100 avaliações:** `+10 pontos`
- **Nota média boa (>=4.0):** `+5 pontos`
- **Site lento, sem HTTPS ou sem meta description:** `+15 pontos`

*Classificação:* **Muito Alta** (>=80), **Alta** (60-79), **Média** (40-59), **Baixa** (<40).

### 4. Integração Inteligente com WhatsApp
- Normalização de telefones para o padrão internacional **E.164** (`55 + DDD + 9 dígitos`).
- Gerador de link direto `https://wa.me/NUMERO?text=MENSAGEM`.
- Templates de mensagens com tags dinâmicas:
  - `{{nome}}`, `{{empresa}}`, `{{cidade}}`, `{{estado}}`, `{{categoria}}`, `{{site}}`, `{{telefone}}`
- Balão de preview antes do envio.
- Registro automático na linha do tempo e atualização de status para `CONTATADO`.

### 5. Funil Kanban
- Visualização em colunas:
  - `Novo` -> `Contatado` -> `Respondeu` -> `Interessado` -> `Negociação` -> `Cliente Ganho` -> `Sem Interesse`
- Movimentação direta de leads com persistência no banco de dados.

### 6. Mapa Interativo
- Pinos geográficos com cores dinâmicas:
  - 🔵 **Azul:** Novo
  - 🟡 **Amarelo:** Contatado / Respondeu / Negociação
  - 🟢 **Verde:** Cliente Ganho
  - 🔴 **Vermelho:** Sem Interesse
- Popups informativos com botão de contato direto.

### 7. Exportação de Dados
- Exportação dos leads filtrados para **Excel (.xlsx)** e **CSV** com suporte a caracteres especiais brasileiros (BOM UTF-8).

---

## 💾 Backup e Restauração do Banco de Dados

Os dados do banco estão persistidos no volume Docker `postgres_data`. Para criar ou restaurar backups:

### Fazer Backup (.sql):
```bash
docker exec -t lead-hunter-postgres pg_dump -U postgres -d leadhunter > backup_leadhunter.sql
```

### Restaurar Backup:
```bash
docker exec -i lead-hunter-postgres psql -U postgres -d leadhunter < backup_leadhunter.sql
```

---

## 🧪 Testes Automatizados

### Backend (Jest):
```bash
cd backend
npm test
```
Testes inclusos para:
- Normalizador de telefones e construtor de links wa.me
- Motor de cálculo de score comercial (ScoringService)
- Interpolação de templates de mensagens

### Frontend (Vitest):
```bash
cd frontend
npm test
```
Testes inclusos para componentes críticos de exibição de score e badges de status.

---

## 📄 Licença
Uso local e comercial privado para prospecção de clientes.
