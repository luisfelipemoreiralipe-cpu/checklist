# CheckOps — Sistema de Performance Operacional para Restaurantes

> Plataforma SaaS multi-tenant que digitaliza os processos operacionais de restaurantes com checklists, dashboard em tempo real, gamificação de equipe e alertas automáticos.

---

## 🖥️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Backend** | Node.js + TypeScript + Express 5 |
| **ORM / DB** | Prisma ORM + PostgreSQL |
| **Frontend** | React 18 + Vite |
| **Auth** | JWT (jsonwebtoken) + Bcrypt |
| **Validação** | Zod |
| **Logs** | Winston |
| **Testes** | Vitest |

---

## 🏗️ Arquitetura

```
checklist/
├── src/                         # Backend (Node.js / TypeScript)
│   ├── modules/
│   │   ├── auth/                # Autenticação e cadastro
│   │   ├── checklists/          # Templates e itens
│   │   ├── executions/          # Motor de execução + RuleEngine
│   │   ├── gamification/        # Ranking e pontuação
│   │   ├── alerts/              # Alertas automáticos
│   │   └── dashboard/           # KPIs e métricas
│   └── shared/
│       ├── config/              # Env, Database
│       ├── errors/              # AppError, globalErrorHandler
│       ├── middlewares/         # Auth, Tenant, Validate
│       └── logger/              # Winston
├── prisma/
│   ├── schema.prisma            # Esquema do banco
│   ├── migrations/              # Histórico de migrações
│   └── seed.ts                  # Dados de demonstração
├── frontend/                    # Frontend (React / Vite)
│   └── src/
│       ├── pages/               # Landing, Login, Dashboard, Execute...
│       ├── components/          # Layout, modais reutilizáveis
│       ├── contexts/            # AuthContext, ToastContext
│       └── services/            # api.js (Axios)
└── tests/                       # Testes unitários (Vitest)
```

---

## ⚙️ Configuração e Instalação

### Pré-requisitos
- **Node.js** v18 ou superior
- **PostgreSQL** v14 ou superior
- **npm** v9 ou superior

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/checkops.git
cd checkops
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Edite o `.env` e preencha os valores (DATABASE_URL e JWT_SECRET são obrigatórios).

### 3. Instale as dependências do backend
```bash
npm install
```

### 4. Instale as dependências do frontend
```bash
cd frontend && npm install && cd ..
```

### 5. Configure o banco de dados
```bash
# Gera o Prisma Client
npm run db:generate

# Executa as migrações
npm run db:migrate

# Popula com dados de demonstração (opcional)
npm run db:seed
```

### 6. Inicie o ambiente de desenvolvimento

**Backend** (porta 3333):
```bash
npm run dev
```

**Frontend** (porta 5173):
```bash
cd frontend && npm run dev
```

---

## 🔑 Contas de Demonstração (após seed)

| Usuário | Email | Senha | Role |
|---|---|---|---|
| Admin | admin@restaurante.com | admin123456 | ADMIN |
| Gerente | gerente@restaurante.com | gerente123456 | MANAGER |
| Colaborador | staff@restaurante.com | staff123456 | STAFF |

> ⚠️ Utilize apenas em ambiente de desenvolvimento local. Nunca em produção.

---

## 📡 API — Endpoints Principais

### Autenticação (público)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Cadastro de novo estabelecimento + Admin |
| `POST` | `/api/v1/auth/login` | Login (retorna JWT) |
| `GET` | `/api/v1/auth/me` | Perfil do usuário autenticado |

### Checklists (MANAGER+)
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/v1/checklists` | Listar templates |
| `POST` | `/api/v1/checklists` | Criar template |
| `PUT` | `/api/v1/checklists/:id` | Editar template |
| `DELETE` | `/api/v1/checklists/:id` | Desativar template |

### Execuções (todos os usuários)
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/executions/start` | Iniciar execução |
| `POST` | `/api/v1/executions/:id/answer` | Responder item |
| `POST` | `/api/v1/executions/:id/finish` | Finalizar execução |
| `GET` | `/api/v1/executions` | Listar histórico |

---

## 🔐 Segurança

- **Multi-tenancy**: Todos os dados são isolados por `tenantId`. Um restaurante nunca acessa dados de outro.
- **RBAC**: Hierarquia `STAFF < MANAGER < ADMIN`. Rotas protegidas por `authorize()` middleware.
- **JWT**: Token com expiração de 7 dias, segredo com mínimo de 32 caracteres.
- **Senhas**: Hash com bcrypt (12 rounds). O hash nunca é exposto em nenhuma resposta.
- **Validação**: Todos os payloads de entrada são validados com Zod antes de chegar ao controller.

---

## 🧪 Testes

```bash
# Rodar todos os testes
npm test

# Rodar com watch (desenvolvimento)
npm run test:watch

# Gerar relatório de cobertura
npm run test:coverage
```

---

## 🚀 Deploy

### Build de produção

```bash
# Backend
npm run build

# Frontend
cd frontend && npm run build
```

### Variáveis de ambiente para produção
- `NODE_ENV=production`
- `JWT_SECRET` com pelo menos 64 caracteres aleatórios
- `BCRYPT_SALT_ROUNDS=12`
- `LOG_LEVEL=warn`
- `DATABASE_URL` apontando para o PostgreSQL de produção

---

## 👥 Roles e Permissões

| Funcionalidade | STAFF | MANAGER | ADMIN |
|---|:---:|:---:|:---:|
| Executar Checklists | ✅ | ✅ | ✅ |
| Ver Ranking | ✅ | ✅ | ✅ |
| Dashboard e Métricas | ❌ | ✅ | ✅ |
| Criar/Editar Checklists | ❌ | ✅ | ✅ |
| Gerenciar Alertas | ❌ | ✅ | ✅ |
| Gerenciar Usuários | ❌ | ❌ | ✅ |

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
