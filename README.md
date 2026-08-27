# ✨ Clarity

> Organize hoje. Respire amanhã.

Uma aplicação **full stack de gerenciamento de tarefas**, desenvolvida com foco em arquitetura, autenticação, segurança, responsividade, acessibilidade e testes automatizados.

O Clarity permite que cada usuário crie sua própria conta e gerencie suas tarefas em um ambiente protegido. Cada tarefa pertence exclusivamente ao usuário autenticado, garantindo o isolamento dos dados tanto na interface quanto na API.

O projeto foi desenvolvido de forma incremental, priorizando funcionalidades pequenas, responsabilidades bem definidas, commits coerentes e evolução progressiva da arquitetura.

---

## 🚀 Demonstração

🔗 **Acesse a aplicação:** [Em breve](#)

> O link da demonstração será adicionado após o deploy da aplicação.

---

## 📸 Preview

As imagens da aplicação serão adicionadas após a finalização do deploy e captura das telas principais.

_\<!--_

_![Landing Page](docs/images/landing-page.png)_

_![Área de tarefas](docs/images/tasks-page.png)_

_![Login](docs/images/login.png)_

_-->_

---

# 📋 Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Modelo de dados](#-modelo-de-dados)
- [Autenticação](#-autenticação)
- [Rotas](#-rotas)
- [API](#-api)
- [Banco de dados e migrations](#-banco-de-dados-e-migrations)
- [Testes](#-testes)
- [Responsividade e acessibilidade](#-responsividade-e-acessibilidade)
- [Segurança](#-segurança)
- [Decisões técnicas](#-decisões-técnicas)
- [Instalação](#-instalação)
- [Scripts disponíveis](#-scripts-disponíveis)
- [Próximos passos](#-próximos-passos)

---

# 💡 Sobre o projeto

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

---

# ✨ Funcionalidades

## 👤 Autenticação

- Cadastro de novos usuários
- Login
- Logout
- Recuperação da sessão atual
- Restauração da sessão ao recarregar a página
- Rotas públicas
- Rotas protegidas
- Redirecionamento de usuários não autenticados
- Expiração e invalidação de sessão

---

## ✅ Gerenciamento de tarefas

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

---

## 🧑‍💻 Experiência do usuário

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

---

# 🛠 Tecnologias

## Front-end

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

---

## Back-end

| Tecnologia     | Utilização                |
| -------------- | ------------------------- |
| **Node.js**    | Ambiente de execução      |
| **Express**    | API HTTP                  |
| **TypeScript** | Tipagem estática          |
| **MySQL**      | Banco de dados relacional |
| **mysql2**     | Comunicação com o MySQL   |

---

## Autenticação e segurança

| Tecnologia             | Utilização              |
| ---------------------- | ----------------------- |
| **Argon2id**           | Hash de senhas          |
| **Cookies HttpOnly**   | Gerenciamento de sessão |
| **cookie-parser**      | Leitura de cookies      |
| **Helmet**             | Headers de segurança    |
| **express-rate-limit** | Rate limiting           |
| **dotenv**             | Variáveis de ambiente   |

---

# 🏗 Arquitetura

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

```mermaid
flowchart LR
    A[React] --> B[Service]
    B --> C[API]
    C --> D[Route]
    D --> E[Controller]
    E --> F[Service]
    F --> G[Repository]
    G --> H[(MySQL)]
    H --> G
    G --> F
    F --> E
    E --> C
    C --> B
    B --> A
```

No back-end, o código segue a direção de dependência **route → controller → service → repository → banco**:

- **Routes** — definem os endpoints e conectam middlewares e controllers (sem regra de negócio ou SQL);
- **Controllers** — tratam de preocupações HTTP (dados da requisição, resposta e status);
- **Services** — contêm as regras de negócio e não dependem de `Request`/`Response` do Express;
- **Repositories** — concentram todo o acesso ao banco e o SQL (sempre parametrizado).

---

# 📁 Estrutura do projeto

```text
clarity/
│
├── client/                         # Front-end (React + Vite)
│   │
│   ├── e2e/                        # Testes end-to-end (Playwright)
│   │   ├── helpers/
│   │   ├── critical-flow.spec.ts
│   │   ├── session-expiry.spec.ts
│   │   └── user-isolation.spec.ts
│   │
│   ├── src/
│   │   ├── app/                    # Store Redux e hooks
│   │   │   ├── hooks.ts
│   │   │   └── store.ts
│   │   │
│   │   ├── components/             # Componentes reutilizáveis
|   |   ├── features/               # Recursos por domínio (ex.: auth)
│   │   ├── hooks/                  # Hooks customizados (ex.: useTasks)
│   │   ├── layouts/                # PublicLayout e AppLayout
│   │   ├── pages/                  # Páginas da aplicação
│   │   ├── services/               # Comunicação HTTP com a API
│   │   ├── types/                  # Tipos de domínio
│   │   └── utils/                  # Funções utilitárias
│   │
│   └── package.json
│
├── server/                         # Back-end (Node + Express)
│   │
│   ├── src/
│   │   ├── config/                 # Variáveis de ambiente
│   │   ├── database/               # Pool de conexões MySQL
|   |   ├── errors/                 # AppError e tratamento de erros
│   │   ├── middlewares/            # requireAuth, rate limiters, errorHandler
│   │   ├── modules/                # users, auth e tasks (route → controller → service → repository)
│   │   │   ├── auth/
│   │   │   ├── tasks/
|   |   |   └── users/
│   │   ├── types/                  # Tipos globais
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   │   └── integration/            # Testes de integração da API
│   │
│   └── package.json
│
├── database/
│   └── migrations/                 # Migrations SQL
│
├── docs/                           # Documentação complementar
│
├── .env.example
├── AGENTS.md
└── README.md
```

A organização busca manter responsabilidades separadas e facilitar a manutenção e os testes.

---

# 🔄 Arquitetura do back-end

O back-end utiliza uma arquitetura em camadas:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Database
```

## Responsabilidades

| Camada         | Responsabilidade                            |
| -------------- | ------------------------------------------- |
| **Route**      | Define os endpoints e middlewares           |
| **Controller** | Recebe a requisição e envia a resposta HTTP |
| **Service**    | Contém regras de negócio                    |
| **Repository** | Executa operações de persistência           |
| **Database**   | Armazena os dados                           |

Essa separação evita que regras de negócio fiquem diretamente nos controllers ou que detalhes de SQL se espalhem pela aplicação.

---

# 🗄 Modelo de dados

O banco possui três tabelas:

| Tabela       | Descrição                                        |
| ------------ | ------------------------------------------------ |
| **users**    | Contas de usuário (nome, e-mail e hash de senha) |
| **tasks**    | Tarefas, cada uma vinculada a um usuário         |
| **sessions** | Sessões ativas (hash do token por usuário)       |

```mermaid
erDiagram
    USERS ||--o{ TASKS : possui
    USERS ||--o{ SESSIONS : possui
    USERS {
        int id PK
        string first_name
        string last_name
        string email
        string password_hash
        datetime created_at
        datetime updated_at
    }
    TASKS {
        int id PK
        int user_id FK
        string title
        boolean completed
        datetime created_at
        datetime updated_at
    }
    SESSIONS {
        int id PK
        int user_id FK
        string token_hash
        datetime expires_at
        datetime created_at
    }
```

A relação principal é:

```text
User
  │
  │ 1
  │
  └────────────── N
                  │
                 Task
```

- um usuário pode possuir várias tarefas;
- cada tarefa pertence a exatamente um usuário (`tasks.user_id` com `NOT NULL`);
- exclusão de usuário propaga a remoção de suas tarefas e sessões (`ON DELETE CASCADE`);
- o detalhamento do modelo está registrado em [`docs/auth-model.md`](docs/auth-model.md).

---

# 🔐 Autenticação

- autenticação por **e-mail + senha**;
- a senha nunca é armazenada em texto puro — apenas o hash gerado com **Argon2id**;
- sessão baseada em **cookie HttpOnly** (`sid`) combinada com **sessão server-side**;
- apenas o **hash SHA-256** do token é persistido na tabela `sessions`;
- duração da sessão: **24 horas** (`expires_at` no banco e `Max-Age` do cookie alinhados a uma única fonte de verdade);
- cookie configurado com `HttpOnly`, `SameSite=Lax` e `Path=/`; `Secure` habilitado somente em produção;
- endpoints de sessão: `POST /api/auth/login`, `GET /api/auth/me` e `POST /api/auth/logout`.

Fluxo de login:

```mermaid
sequenceDiagram
    participant U as Usuário
    participant C as Client
    participant A as API
    participant DB as MySQL
    U->>C: Informa email e senha
    C->>A: POST /api/auth/login
    A->>DB: Busca usuário
    DB-->>A: Dados do usuário
    A->>A: Verifica senha com Argon2
    alt Credenciais válidas
        A->>DB: Cria sessão
        A-->>C: Cookie HttpOnly
        C-->>U: Usuário autenticado
    else Credenciais inválidas
        A-->>C: Erro de autenticação
        C-->>U: Exibe mensagem
    end
```

Após a autenticação:

```text
Browser
    │
    │ Cookie HttpOnly
    ▼
API
    │
    ▼
Middleware de autenticação
    │
    ├── Sessão válida
    │       ↓
    │    Usuário autenticado
    │       ↓
    │    Controller
    │
    └── Sessão inválida
            ↓
          401
```

A documentação completa do modelo está em [`docs/auth-model.md`](docs/auth-model.md).

---

# 🔒 Isolamento entre usuários

O `userId` nunca é tratado como uma informação confiável enviada pelo cliente. Em vez disso, o servidor identifica o usuário através da sessão e usa esse contexto em todas as operações do domínio:

O fluxo pode ser representado assim:

```mermaid
flowchart TD
    A[Usuário autenticado] --> B[Cookie de sessão]
    B --> C[Middleware requireAuth]
    C --> D[Identifica usuário]
    D --> E[Controller]
    E --> F[Service]
    F --> G[Repository]
    G --> H[(MySQL)]
    H --> I{Tarefa pertence<br/>ao usuário?}
    I -->|Sim| J[Operação permitida]
    I -->|Não| K[Recurso não encontrado]
```

---

# 🧭 Rotas da aplicação

## Front-end

| Rota        | Tipo      | Descrição                        |
| ----------- | --------- | -------------------------------- |
| `/`         | Pública   | Landing page                     |
| `/login`    | Pública   | Login                            |
| `/register` | Pública   | Cadastro                         |
| `/app`      | Protegida | Área de gerenciamento de tarefas |
| `*`         | Pública   | NotFoundPage                     |

A aplicação diferencia rotas públicas e protegidas.

Usuários não autenticados não podem acessar diretamente a área de tarefas.

---

# 🔌 API

Todas as rotas da API usam o prefixo `/api`. Respostas de sucesso seguem o formato `{ "data": ... }`; erros seguem `{ "error": "mensagem" }`.

## Health check

| Método | Endpoint  | Descrição                                                  | Autenticação | Corpo | Sucesso      |
| ------ | --------- | ---------------------------------------------------------- | ------------ | ----- | ------------ |
| `GET`  | `/health` | Verifica a disponibilidade da API e da conexão com o banco | Não          | -     | `200`/ `503` |

---

## Autenticação

| Método | Endpoint           | Descrição                     | Autenticação     | Corpo                                                            | Sucesso |
| ------ | ------------------ | ----------------------------- | ---------------- | ---------------------------------------------------------------- | ------- |
| `POST` | `/api/users`       | Cria um novo usuário          | Não (rate limit) | `{ firstName, lastName, email, password, passwordConfirmation }` | `201`   |
| `POST` | `/api/auth/login`  | Autentica o usuário           | Não (rate limit) | `{ email, password }`                                            | `200`   |
| `GET`  | `/api/auth/me`     | Retorna o usuário autenticado | Cookie           | -                                                                | `200`   |
| `POST` | `/api/auth/logout` | Encerra a sessão              | Cookie           | -                                                                | `204`   |

---

## Tarefas

Todas as rotas abaixo exigem autenticação.

| Método   | Endpoint               | Descrição                          | Autenticação | Corpo                    | Sucesso |
| -------- | ---------------------- | ---------------------------------- | ------------ | ------------------------ | ------- |
| `GET`    | `/api/tasks`           | Lista as tarefas do usuário        | Sim          | -                        | `200`   |
| `POST`   | `/api/tasks`           | Cria uma tarefa                    | Sim          | `{ title }`              | `201`   |
| `PATCH`  | `/api/tasks/:id`       | Altera o status de conclusão       | Sim          | `{ completed: boolean }` | `200`   |
| `PATCH`  | `/api/tasks/:id/title` | Edita o título                     | Sim          | `{ title }`              | `200`   |
| `DELETE` | `/api/tasks/:id`       | Remove uma tarefa                  | Sim          | -                        | `204`   |
| `DELETE` | `/api/tasks/completed` | Remove todas as tarefas concluídas | Sim          | -                        | `204`   |

---

# 🗃 Banco de dados e migrations

O projeto utiliza:

- MySQL;
- SQL puro;
- `mysql2`;
- migrations versionadas.

Não é utilizado ORM.

As migrations são responsáveis pela evolução da estrutura do banco de dados.

Entre as principais estruturas criadas estão:

- `tasks`;
- `users`;
- `sessions`;
- relacionamento entre usuários e tarefas.

A tabela de tarefas possui uma chave estrangeira para o usuário proprietário.

Conceitualmente:

```text
users
  │
  └── id
       │
       │ FK
       ▼
tasks.user_id
```

---

# 🧪 Testes

O projeto utiliza diferentes níveis de testes.

```text
        /\
       /E2E\
      /------\
     /        \
    /Integração\
   /------------\
  /              \
 /   Unitários    \
/------------------\
```

---

## Testes unitários

Os testes unitários cobrem partes isoladas da aplicação.

Entre os elementos testados estão:

- validações;
- componentes;
- filtros;
- comportamentos de interface;
- regras de negócio;
- tratamento de erros.

---

## Testes de integração

Os testes de integração validam a comunicação entre partes da API.

São utilizados para verificar fluxos como:

- autenticação;
- proteção de rotas;
- operações relacionadas a tarefas;
- respostas HTTP;
- integração entre camadas.

---

## Testes end-to-end

Os testes E2E utilizam **Playwright**.

Eles simulam fluxos completos da aplicação.

### Fluxo crítico

```text
Cadastro
    ↓
Login
    ↓
Criar tarefa
    ↓
Editar tarefa
    ↓
Concluir tarefa
    ↓
Buscar
    ↓
Filtrar
    ↓
Logout
```

### Isolamento entre usuários

```text
Usuário A
    ↓
Cria tarefas
    ↓
Logout
    ↓
Usuário B
    ↓
Login
    ↓
Não visualiza as tarefas do Usuário A
```

### Expiração de sessão

Também existem testes para validar o comportamento da aplicação quando uma sessão deixa de ser válida.

---

# 📱 Responsividade

A interface foi desenvolvida seguindo a abordagem **Mobile First**.

O desenvolvimento começa considerando telas menores e o layout é progressivamente adaptado para:

- dispositivos móveis;
- celulares maiores;
- tablets;
- notebooks;
- desktops.

A responsividade não é tratada apenas como uma adaptação visual, mas também considera:

- áreas de toque;
- ausência de hover em dispositivos touch;
- reorganização de componentes;
- legibilidade;
- comportamento de formulários;
- navegação.

---

# ♿ Acessibilidade

O projeto considera diferentes aspectos de acessibilidade.

Entre eles:

- navegação por teclado;
- foco visível;
- gerenciamento de foco;
- labels associadas aos campos;
- atributos `aria-*`;
- mensagens de erro acessíveis;
- skip links;
- áreas clicáveis adequadas;
- suporte a `prefers-reduced-motion`;
- atenção ao contraste visual.

---

# 🛡 Segurança

Antes da etapa de deploy, foram adicionadas medidas voltadas à segurança e robustez da aplicação.

Entre elas:

- hash de senha com Argon2id;
- autenticação baseada em sessão;
- cookies HttpOnly;
- validação de dados de entrada;
- queries parametrizadas;
- middleware de autenticação;
- tratamento centralizado de erros;
- Helmet;
- rate limiting em rotas sensíveis;
- variáveis de ambiente para informações sensíveis;
- tratamento de sessão expirada.

---

# 🧠 Decisões técnicas

## SQL puro em vez de ORM

O projeto utiliza SQL diretamente através do `mysql2`.

A decisão foi tomada para permitir uma compreensão mais próxima de:

- consultas SQL;
- joins;
- chaves estrangeiras;
- migrations;
- persistência;
- relacionamento entre entidades.

Além disso, a camada de repository mantém os detalhes de acesso ao banco separados das regras de negócio.

---

## Redux Toolkit apenas para estado global necessário

O Redux Toolkit é utilizado para o estado global relacionado à autenticação.

Nem todo estado da aplicação foi colocado no Redux.

Estados específicos do domínio de tarefas permanecem próximos da funcionalidade responsável por eles.

A intenção é evitar transformar o Redux em um armazenamento global para qualquer estado da aplicação.

---

## Sessão com cookie HttpOnly

A autenticação não depende de armazenar tokens diretamente em `localStorage`.

O identificador da sessão é enviado através de um cookie HttpOnly.

Isso reduz a necessidade de expor o identificador da sessão ao JavaScript da aplicação.

---

## Arquitetura em camadas no back-end

A separação:

```text
Route
↓
Controller
↓
Service
↓
Repository
```

permite que cada camada tenha uma responsabilidade específica.

Isso facilita:

- manutenção;
- testes;
- evolução das regras de negócio;
- substituição de detalhes de persistência;
- organização do código.

---

## Desenvolvimento incremental

O Clarity foi desenvolvido passo a passo.

A evolução do projeto priorizou:

```text
Funcionalidade pequena
        ↓
Implementação
        ↓
Testes
        ↓
Validação
        ↓
Refatoração quando necessária
        ↓
Commit coerente
```

Essa abordagem permitiu que a arquitetura evoluísse junto com a complexidade da aplicação.

---

# 💻 Instalação

## Pré-requisitos

Antes de começar, é necessário ter instalado:

- Node.js
- npm
- MySQL

---

## 1. Clone o repositório

```bash
git clone https://github.com/juniormps/clarity.git
```

Entre no diretório:

```bash
cd clarity
```

---

## 2. Configure as variáveis de ambiente

Utilize o arquivo `.env.example` como referência para criar os arquivos de ambiente necessários.

Configure as informações relacionadas a:

- banco de dados;
- ambiente de execução;
- sessão;
- demais variáveis utilizadas pela aplicação.

> ⚠️ Nunca envie arquivos `.env` com informações sensíveis para o repositório.

---

## 3. Instale as dependências

### Client

```bash
cd client
npm install
```

### Server

Em outro terminal:

```bash
cd server
npm install
```

---

## 4. Configure o banco de dados

Crie o banco de dados e execute as migrations localizadas em:

```text
database/migrations/
```

---

## 5. Inicie o servidor

Dentro de `server/`:

```bash
npm run dev
```

---

## 6. Inicie o client

Dentro de `client/`:

```bash
npm run dev
```

A aplicação ficará disponível no endereço informado pelo Vite.

---

# 📜 Scripts disponíveis

## Client

| Comando                   | Descrição                                   |
| ------------------------- | ------------------------------------------- |
| `npm run dev`             | Inicia o ambiente de desenvolvimento        |
| `npm run build`           | Gera a build de produção                    |
| `npm run preview`         | Visualiza a build localmente                |
| `npm run lint`            | Executa o ESLint                            |
| `npm run typecheck`       | Executa a verificação de tipos              |
| `npm test`                | Executa os testes                           |
| `npm run test:watch`      | Executa os testes em modo watch             |
| `npm run test:e2e`        | Executa os testes end-to-end                |
| `npm run test:e2e:ui`     | Executa os testes E2E com interface         |
| `npm run test:e2e:headed` | Executa os testes E2E com navegador visível |

## Server

| Comando                    | Descrição                            |
| -------------------------- | ------------------------------------ |
| `npm run dev`              | Inicia o servidor em desenvolvimento |
| `npm run build`            | Compila o TypeScript                 |
| `npm start`                | Inicia a aplicação compilada         |
| `npm run lint`             | Executa o ESLint                     |
| `npm run typecheck`        | Executa a verificação de tipos       |
| `npm test`                 | Executa os testes                    |
| `npm run test:integration` | Executa os testes de integração      |
| `npm run test:watch`       | Executa os testes em modo watch      |

---

# 🔜 Próximos passos

As próximas etapas planejadas para o projeto são:

- [ ] Configurar integração contínua
- [ ] Criar pipeline com GitHub Actions
- [ ] Executar lint automaticamente
- [ ] Executar typecheck automaticamente
- [ ] Executar testes automaticamente
- [ ] Configurar ambiente de produção
- [ ] Fazer deploy do front-end
- [ ] Fazer deploy da API
- [ ] Configurar banco de dados em produção
- [ ] Configurar variáveis de ambiente
- [ ] Ajustar CORS para produção
- [ ] Configurar cookies conforme a topologia de deploy
- [ ] Executar migrations em produção
- [ ] Adicionar link da demonstração
- [ ] Adicionar screenshots da aplicação

---

# 📌 Status

🚧 **Em desenvolvimento**

A aplicação já possui uma base full stack funcional, incluindo:

- autenticação;
- gerenciamento de sessão;
- CRUD de tarefas;
- isolamento de dados entre usuários;
- banco de dados relacional;
- arquitetura em camadas;
- validações;
- tratamento centralizado de erros;
- testes automatizados;
- testes end-to-end;
- responsividade;
- acessibilidade;
- medidas de segurança e robustez.

As próximas etapas concentram-se principalmente em **CI/CD e deploy**.

---

<p align="center">

Feito com atenção aos detalhes. ✨

**Clarity — Organize hoje. Respire amanhã.**

</p>
