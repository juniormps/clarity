# ✨ Clarity

> Organize hoje. Respire amanhã.

Uma aplicação **full stack de gerenciamento de tarefas**, desenvolvida com foco em arquitetura, autenticação, segurança, responsividade, acessibilidade e testes automatizados.

O Clarity permite que cada usuário crie sua própria conta e gerencie suas tarefas em um ambiente protegido. Cada tarefa pertence exclusivamente ao usuário autenticado, garantindo o isolamento dos dados tanto na interface quanto na API.

O projeto foi desenvolvido de forma incremental, priorizando funcionalidades pequenas, responsabilidades bem definidas, commits coerentes e evolução progressiva da arquitetura.

## Demonstração

🔗 **Acesse a aplicação:** [Em breve](#)

> O link da demonstração será adicionado após o deploy da aplicação.

## Preview

As imagens da aplicação serão adicionadas após a finalização do deploy e captura das telas principais.

<!--
![Landing Page](docs/images/landing-page.png)

![Área de tarefas](docs/images/tasks-page.png)

![Login](docs/images/login.png)
-->

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Modelo de dados](#modelo-de-dados)
- [Autenticação](#autenticação)
- [Rotas](#rotas)
- [API](#api)
- [Banco de dados e migrations](#banco-de-dados-e-migrations)
- [Testes](#testes)
- [Responsividade e acessibilidade](#responsividade-e-acessibilidade)
- [Segurança](#segurança)
- [Decisões técnicas](#decisões-técnicas)
- [Instalação](#instalação)
- [Scripts disponíveis](#scripts-disponíveis)
- [Próximos passos](#próximos-passos)

## Sobre o projeto

O **Clarity** é uma aplicação de gerenciamento de tarefas desenvolvida como projeto de estudo e portfólio.

Mais do que construir apenas uma interface de To-Do List, o objetivo do projeto é praticar a construção de uma aplicação completa, envolvendo:

- desenvolvimento front-end;
- desenvolvimento de API;
- autenticação;
- persistência em banco de dados relacional;
- arquitetura em camadas;
- gerenciamento de sessão;
- isolamento de dados entre usuários;
- validação de dados;
- tratamento de erros;
- segurança;
- responsividade;
- acessibilidade;
- testes automatizados;
- testes end-to-end.

A aplicação foi construída utilizando uma arquitetura full stack separada entre **client**, **server** e **database**.

## Funcionalidades

### Autenticação

- Cadastro de novos usuários
- Login
- Logout
- Recuperação da sessão atual
- Restauração da sessão ao recarregar a página
- Rotas públicas
- Rotas protegidas
- Redirecionamento de usuários não autenticados
- Expiração e invalidação de sessão

### Gerenciamento de tarefas

- Criar tarefas
- Listar tarefas
- Editar o título de uma tarefa
- Marcar tarefas como concluídas
- Reabrir tarefas concluídas
- Excluir tarefas individualmente
- Excluir todas as tarefas concluídas
- Filtrar tarefas por status:
  - Todas
  - Pendentes
  - Concluídas
- Buscar tarefas por título
- Visualizar resumo das tarefas
- Visualizar progresso das tarefas

### Experiência do usuário

- Estados de carregamento
- Skeleton loading
- Estados vazios
- Estados de erro
- Mensagens de validação
- Confirmação antes de ações destrutivas
- Interface responsiva
- Abordagem Mobile First
- Navegação por teclado
- Gerenciamento de foco
- Skip links
- Suporte a preferências de redução de movimento

## Tecnologias

### Front-end

| Tecnologia           | Utilização                          |
| -------------------- | ----------------------------------- |
| **React**            | Construção da interface             |
| **TypeScript**       | Tipagem estática                    |
| **Vite**             | Ambiente de desenvolvimento e build |
| **React Router DOM** | Roteamento da aplicação             |
| **Redux Toolkit**    | Estado global de autenticação       |
| **React Redux**      | Integração do Redux com React       |
| **CSS Modules**      | Estilização componentizada          |
| **Vitest**           | Testes automatizados                |
| **Testing Library**  | Testes de componentes               |
| **Playwright**       | Testes end-to-end                   |

### Back-end

| Tecnologia     | Utilização                |
| -------------- | ------------------------- |
| **Node.js**    | Ambiente de execução      |
| **Express**    | API HTTP                  |
| **TypeScript** | Tipagem estática          |
| **MySQL**      | Banco de dados relacional |
| **mysql2**     | Comunicação com o MySQL   |

### Autenticação e segurança

| Tecnologia             | Utilização              |
| ---------------------- | ----------------------- |
| **Argon2id**           | Hash de senhas          |
| **Cookies HttpOnly**   | Gerenciamento de sessão |
| **cookie-parser**      | Leitura de cookies      |
| **Helmet**             | Headers de segurança    |
| **express-rate-limit** | Rate limiting           |
| **dotenv**             | Variáveis de ambiente   |

## Arquitetura

O Clarity utiliza uma arquitetura full stack separada em três partes principais:

```text
┌─────────────────────────────────────────────┐
│                   CLIENT                    │
│                                             │
│   React + TypeScript + Redux + CSS Modules  │
└──────────────────────┬──────────────────────┘
                       │
                       │ HTTP
                       ▼
┌─────────────────────────────────────────────┐
│                   SERVER                    │
│                                             │
│        Node.js + Express + TypeScript       │
│                                             │
│ Route → Controller → Service → Repository   │
└──────────────────────┬──────────────────────┘
                       │
                       │ SQL
                       ▼
┌─────────────────────────────────────────────┐
│                  DATABASE                   │
│                                             │
│                    MySQL                    │
└─────────────────────────────────────────────┘
```

No back-end, o código segue a direção de dependência **route → controller → service → repository → banco**:

- **Routes** — definem os endpoints e conectam middlewares e controllers (sem regra de negócio ou SQL);
- **Controllers** — tratam de preocupações HTTP (dados da requisição, resposta e status);
- **Services** — contêm as regras de negócio e não dependem de `Request`/`Response` do Express;
- **Repositories** — concentram todo o acesso ao banco e o SQL (sempre parametrizado).

## Estrutura do projeto

```text
clarity/
├── client/                    # Front-end (React + Vite)
│   └── src/
│       ├── app/               # Store Redux e hooks
│       ├── components/        # Componentes reutilizáveis
│       ├── features/          # Recursos por domínio (ex.: auth)
│       ├── hooks/             # Hooks customizados (ex.: useTasks)
│       ├── layouts/           # PublicLayout e AppLayout
│       ├── pages/             # Páginas da aplicação
│       ├── services/          # Comunicação HTTP com a API
│       ├── types/             # Tipos de domínio
│       └── utils/             # Funções utilitárias
├── server/                    # Back-end (Node + Express)
│   └── src/
│       ├── config/            # Variáveis de ambiente
│       ├── database/          # Pool de conexões MySQL
│       ├── errors/            # AppError e tratamento de erros
│       ├── middlewares/       # requireAuth, rate limiters, errorHandler
│       ├── modules/           # users, auth e tasks (route → controller → service → repository)
│       └── types/             # Tipos globais
├── database/
│   └── migrations/            # Migrations SQL
└── docs/                      # Documentação complementar
```

## Modelo de dados

O banco possui três tabelas:

| Tabela      | Descrição                                        |
| ----------- | ------------------------------------------------ |
| **users**   | Contas de usuário (nome, e-mail e hash de senha) |
| **tasks**   | Tarefas, cada uma vinculada a um usuário         |
| **sessions**| Sessões ativas (hash do token por usuário)       |

```text
User 1 ─────────── N Task

sessions.user_id → users.id
tasks.user_id     → users.id
```

- um usuário pode possuir várias tarefas;
- cada tarefa pertence a exatamente um usuário (`tasks.user_id` com `NOT NULL`);
- exclusão de usuário propaga a remoção de suas tarefas e sessões (`ON DELETE CASCADE`);
- o detalhamento do modelo está registrado em [`docs/auth-model.md`](docs/auth-model.md).

## Autenticação

- autenticação por **e-mail + senha**;
- a senha nunca é armazenada em texto puro — apenas o hash gerado com **Argon2id**;
- sessão baseada em **cookie HttpOnly** (`sid`) combinada com **sessão server-side**;
- apenas o **hash SHA-256** do token é persistido na tabela `sessions`;
- duração da sessão: **24 horas** (`expires_at` no banco e `Max-Age` do cookie alinhados a uma única fonte de verdade);
- cookie configurado com `HttpOnly`, `SameSite=Lax` e `Path=/`; `Secure` habilitado somente em produção;
- endpoints de sessão: `POST /api/auth/login`, `GET /api/auth/me` e `POST /api/auth/logout`.

A documentação completa do modelo está em [`docs/auth-model.md`](docs/auth-model.md).

## Rotas

Rotas do front-end (React Router DOM):

| Rota         | Acesso                | Página        |
| ------------ | --------------------- | ------------- |
| `/`          | Pública               | HomePage      |
| `/login`     | Somente convidado     | LoginPage     |
| `/register`  | Somente convidado     | RegisterPage  |
| `/app`       | Protegida             | TasksPage     |
| `*`          | Pública               | NotFoundPage  |

## API

Todas as rotas da API usam o prefixo `/api`. Respostas de sucesso seguem o formato `{ "data": ... }`; erros seguem `{ "error": "mensagem" }`.

| Método | Rota                    | Autenticação | Corpo                                  | Sucesso |
| ------ | ----------------------- | ------------ | -------------------------------------- | ------- |
| `GET`  | `/health`               | Não          | —                                      | `200` / `503` |
| `POST` | `/api/users`            | Não (rate limit) | `{ firstName, lastName, email, password, passwordConfirmation }` | `201` |
| `POST` | `/api/auth/login`       | Não (rate limit) | `{ email, password }`                  | `200` |
| `GET`  | `/api/auth/me`          | Cookie       | —                                      | `200` |
| `POST` | `/api/auth/logout`      | Cookie       | —                                      | `204` |
| `GET`  | `/api/tasks`            | Sim          | —                                      | `200` |
| `POST` | `/api/tasks`            | Sim          | `{ title }`                            | `201` |
| `PATCH`| `/api/tasks/:id`        | Sim          | `{ completed: boolean }`               | `200` |
| `PATCH`| `/api/tasks/:id/title`  | Sim          | `{ title }`                            | `200` |
| `DELETE`| `/api/tasks/:id`       | Sim          | —                                      | `204` |
| `DELETE`| `/api/tasks/completed` | Sim          | —                                      | `204` |

### Validação

| Campo                  | Regras                                                        |
| ---------------------- | ------------------------------------------------------------- |
| `title`                | string, sem espaços nas extremidades, não vazio, máx. 140     |
| `firstName` / `lastName` | string, sem espaços nas extremidades, não vazio, máx. 120   |
| `email`                | string, sem espaços nas extremidades, lowercase, válido, máx. 255 |
| `password`             | mínimo 8, máximo 128, não somente espaços                     |
| `passwordConfirmation` | deve ser igual a `password`                                   |

### Rate limiting

| Endpoint          | Limite                                   |
| ----------------- | ---------------------------------------- |
| Login             | 10 tentativas malsucedidas / 15 min / IP |
| Cadastro          | 5 requisições / 1 hora / IP              |

## Banco de dados e migrations

As alterações de schema são representadas por arquivos SQL versionados em `database/migrations/`:

1. `001_create_tasks.sql` — tabela `tasks`;
2. `002_create_users.sql` — tabela `users`;
3. `003_create_sessions.sql` — tabela `sessions`;
4. `004_add_user_id_to_tasks.sql` — vínculo `tasks.user_id → users.id`.

Não há um script dedicado de migration no desenvolvimento: o banco é criado e as migrations são aplicadas manualmente, em ordem. Os testes E2E recriam o banco de testes e aplicam todas as migrations automaticamente.

## Testes

| Tipo          | Comando                  | Requisitos                                          |
| ------------- | ------------------------ | --------------------------------------------------- |
| Unitários e de componente | `npm test`    | —                                                   |
| Integração (server) | `npm run test:integration` | MySQL em execução com o banco `clarity` migrado |
| End-to-end    | `npm run test:e2e`       | Recria um banco `*_e2e` e inicia ambos os servidores |

## Responsividade e acessibilidade

- interface responsiva com abordagem **Mobile First**;
- navegação completa por teclado e gerenciamento de foco;
- skip links e controles com `aria-pressed` e rótulos acessíveis;
- suporte a `prefers-reduced-motion`.

## Segurança

- senhas com hash **Argon2id** (nunca em texto puro);
- sessão em cookie **HttpOnly** + hash do token no servidor;
- **Helmet** para headers de segurança;
- **rate limiting** em login e cadastro;
- **queries SQL parametrizadas** em todas as operações;
- validação de todos os dados recebidos do cliente;
- segredos e credenciais vêm de variáveis de ambiente (`.env` nunca é versionado);
- erros internos e stack traces nunca são expostos ao cliente.

## Decisões técnicas

- **SQL puro** com `mysql2/promise` — sem ORM ou query builder;
- **arquitetura em camadas** com direção de dependência única;
- **sessão por cookie HttpOnly** em vez de tokens no `localStorage`;
- **Redux Toolkit** apenas para o estado global de autenticação; o estado das tarefas permanece em hooks locais;
- **CSS Modules** para estilos por componente, com estilos globais restritos a reset, tipografia e tokens.

## Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS recomendado)
- MySQL em execução

### Passos

1. **Clone o repositório**

   ```bash
   git clone https://github.com/<seu-usuario>/clarity.git
   cd clarity
   ```

2. **Instale as dependências**

   ```bash
   npm install --prefix client
   npm install --prefix server
   ```

3. **Configure o ambiente**

   Copie o `.env.example` para `.env` na raiz do projeto e preencha as credenciais do banco:

   ```bash
   cp .env.example .env
   ```

   | Variável      | Obrigatória | Padrão         | Descrição                          |
   | ------------- | ----------- | -------------- | ---------------------------------- |
   | `PORT`        | Não         | `3000`         | Porta do servidor                  |
   | `NODE_ENV`    | Não         | `development`  | `development`, `test` ou `production` |
   | `DB_HOST`     | Sim         | —              | Host do MySQL                      |
   | `DB_PORT`     | Sim         | —              | Porta do MySQL                     |
   | `DB_USER`     | Sim         | —              | Usuário do MySQL                   |
   | `DB_PASSWORD` | Sim         | —              | Senha do MySQL                     |
   | `DB_NAME`     | Sim         | —              | Nome do banco de dados             |

4. **Crie o banco e aplique as migrations**

   Crie o banco definido em `DB_NAME` e aplique as migrations em ordem:

   ```bash
   mysql -u <usuário> -p -e "CREATE DATABASE clarity"
   mysql -u <usuário> -p clarity < database/migrations/001_create_tasks.sql
   mysql -u <usuário> -p clarity < database/migrations/002_create_users.sql
   mysql -u <usuário> -p clarity < database/migrations/003_create_sessions.sql
   mysql -u <usuário> -p clarity < database/migrations/004_add_user_id_to_tasks.sql
   ```

5. **Execute o servidor e o cliente**

   ```bash
   npm run dev --prefix server
   npm run dev --prefix client
   ```

   O servidor roda em `http://localhost:3000` e o client em `http://localhost:5173` (o Vite faz proxy de `/api` para o servidor).

## Scripts disponíveis

### Client (`client/`)

| Comando          | Descrição                                            |
| ---------------- | ---------------------------------------------------- |
| `dev`            | Inicia o servidor de desenvolvimento (Vite)          |
| `build`          | Gera o build de produção (`tsc -b && vite build`)    |
| `preview`        | Pré-visualiza o build de produção                    |
| `lint`           | Executa o ESLint                                     |
| `typecheck`      | Verifica os tipos com o TypeScript                   |
| `test`           | Executa os testes unitários e de componente (Vitest) |
| `test:watch`     | Testes em modo watch                                 |
| `test:e2e`       | Reseta o banco E2E e executa os testes Playwright    |
| `test:e2e:ui`    | Testes E2E com interface gráfica                     |
| `test:e2e:headed`| Testes E2E com navegador visível                     |

### Server (`server/`)

| Comando            | Descrição                                                          |
| ------------------ | ------------------------------------------------------------------ |
| `dev`              | Inicia o servidor em modo watch (`tsx watch`)                      |
| `dev:e2e`          | Inicia o servidor para os testes E2E                               |
| `db:e2e:reset`     | Recria o banco de testes E2E e aplica as migrations                |
| `build`            | Compila para JavaScript (`tsc`)                                    |
| `start`            | Inicia o servidor compilado                                        |
| `lint`             | Executa o ESLint                                                   |
| `typecheck`        | Verifica os tipos com o TypeScript                                 |
| `test`             | Executa os testes unitários (Vitest)                               |
| `test:integration` | Executa os testes de integração (requer MySQL com banco migrado)   |
| `test:watch`       | Testes em modo watch                                               |

## Próximos passos

- [ ] Adicionar o link da demonstração e as capturas de tela (Preview)
- [ ] Configurar CI (lint, typecheck e testes automatizados)
- [ ] Deploy de produção (client, API e MySQL)
