# Clarity

Aplicação full stack de gerenciamento de tarefas desenvolvida como projeto de estudo e portfólio.

O Clarity permite que usuários criem uma conta, façam login e gerenciem suas próprias tarefas em uma área protegida. Cada tarefa pertence exclusivamente ao usuário autenticado, com isolamento garantido pela API e validado por testes automatizados.

O projeto foi desenvolvido incrementalmente, com foco em arquitetura, separação de responsabilidades, autenticação, segurança, responsividade, acessibilidade e testes.

## Funcionalidades

- Cadastro de usuários
- Login e logout
- Sessão baseada em cookie HttpOnly
- Restauração da sessão ao recarregar a aplicação
- Rotas públicas e protegidas
- Criação de tarefas
- Edição do título de tarefas
- Conclusão e reabertura de tarefas
- Exclusão individual de tarefas
- Exclusão de todas as tarefas concluídas
- Filtros por status
- Busca por título
- Resumo de tarefas pendentes e concluídas
- Indicador visual de progresso
- Isolamento de dados entre usuários
- Estados de carregamento, erro e lista vazia
- Interface responsiva com abordagem Mobile First
- Recursos de acessibilidade, incluindo labels, atributos ARIA, gerenciamento de foco e skip link

## Tecnologias

### Front-end

- React
- TypeScript
- Vite
- React Router DOM
- Redux Toolkit
- React Redux
- CSS Modules
- Vitest
- Testing Library
- Playwright

### Back-end

- Node.js
- Express
- TypeScript
- MySQL
- mysql2

### Autenticação e segurança

- Argon2id para hash de senhas
- Cookies HttpOnly para gerenciamento de sessão
- cookie-parser
- Helmet
- Rate limiting com express-rate-limit
- Validação de dados de entrada
- Middleware de autenticação
- Tratamento centralizado de erros

## Arquitetura

O projeto é organizado como uma aplicação full stack:

```text
clarity/
├── client/          # Aplicação React
├── server/          # API REST
├── database/        # Migrations e scripts do banco
├── docs/            # Documentação complementar
├── .env.example
├── AGENTS.md
└── README.md
```

No back-end, as funcionalidades seguem uma separação de responsabilidades baseada no fluxo:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
MySQL
```

Essa organização mantém as responsabilidades separadas entre:

- **Routes:** definição dos endpoints
- **Controllers:** comunicação HTTP
- **Services:** regras de negócio
- **Repositories:** acesso e persistência dos dados
- **Database:** armazenamento dos dados

## Modelo de dados

A aplicação possui uma relação de um para muitos entre usuários e tarefas:

```text
User
  │
  │ 1
  │
  └────────── N
              │
             Task
```

Cada tarefa pertence a um único usuário.

O `userId` utilizado nas operações de tarefas não é enviado pelo front-end como uma informação confiável. O servidor identifica o usuário autenticado a partir da sessão e utiliza essa informação para consultar ou modificar apenas os recursos pertencentes a ele.

Isso impede, por exemplo, que um usuário acesse, edite ou exclua tarefas pertencentes a outro usuário apenas manipulando URLs ou payloads.

## Autenticação

O Clarity utiliza autenticação baseada em sessão com cookie HttpOnly.

O fluxo geral é:

```text
Usuário
  ↓
Login
  ↓
Servidor valida as credenciais
  ↓
Senha verificada com Argon2
  ↓
Sessão criada no servidor
  ↓
Cookie HttpOnly enviado ao navegador
  ↓
Requisições autenticadas
```

Como o cookie é HttpOnly, o identificador da sessão não precisa ser acessado diretamente pelo JavaScript da aplicação.

As rotas protegidas passam pelo middleware de autenticação antes de chegar aos controllers.

```text
Request
  ↓
Auth Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
MySQL
```

## Rotas da aplicação

### Front-end

| Rota        | Descrição                                  |
| ----------- | ------------------------------------------ |
| `/`         | Landing page pública                       |
| `/login`    | Página de login                            |
| `/register` | Página de cadastro                         |
| `/app`      | Área protegida de gerenciamento de tarefas |

Usuários não autenticados que tentam acessar `/app` são redirecionados para a área de autenticação.

## API

### Autenticação

| Método | Endpoint             | Descrição                     |
| ------ | -------------------- | ----------------------------- |
| `POST` | `/api/auth/register` | Cria um novo usuário          |
| `POST` | `/api/auth/login`    | Autentica o usuário           |
| `GET`  | `/api/auth/me`       | Retorna o usuário autenticado |
| `POST` | `/api/auth/logout`   | Encerra a sessão              |

### Tarefas

As rotas de tarefas exigem autenticação.

| Método   | Endpoint               | Descrição                                     |
| -------- | ---------------------- | --------------------------------------------- |
| `GET`    | `/api/tasks`           | Lista as tarefas do usuário autenticado       |
| `POST`   | `/api/tasks`           | Cria uma nova tarefa                          |
| `PATCH`  | `/api/tasks/:id`       | Altera o status de conclusão                  |
| `PATCH`  | `/api/tasks/:id/title` | Altera o título                               |
| `DELETE` | `/api/tasks/:id`       | Remove uma tarefa                             |
| `DELETE` | `/api/tasks/completed` | Remove todas as tarefas concluídas do usuário |

Também existe um endpoint de health check para verificar a disponibilidade da aplicação e da conexão com o banco de dados.

## Banco de dados e migrations

O projeto utiliza MySQL e SQL puro, sem ORM.

As migrations são responsáveis por criar e evoluir a estrutura do banco de dados, incluindo:

- tabela de usuários;
- tabela de tarefas;
- relação entre usuários e tarefas;
- tabela de sessões.

A relação entre `users` e `tasks` utiliza chave estrangeira, garantindo que cada tarefa esteja vinculada a um usuário.

## Instalação

### Pré-requisitos

Para executar o projeto localmente, você precisa ter instalado:

- Node.js
- npm
- MySQL

### 1. Clone o repositório

```bash
git clone https://github.com/juniormps/clarity.git
```

Entre no diretório:

```bash
cd clarity
```

### 2. Configure as variáveis de ambiente

Crie o arquivo `.env` com base no arquivo `.env.example`.

Configure as informações necessárias para conexão com o MySQL e demais variáveis utilizadas pela aplicação.

### 3. Instale as dependências

#### Front-end

```bash
cd client
npm install
```

#### Back-end

Em outro terminal:

```bash
cd server
npm install
```

### 4. Execute as migrations

Configure o banco de dados conforme as migrations disponíveis no diretório `database/`.

### 5. Inicie o back-end

Dentro de `server/`:

```bash
npm run dev
```

### 6. Inicie o front-end

Dentro de `client/`:

```bash
npm run dev
```

A aplicação ficará disponível no endereço informado pelo Vite.

## Scripts disponíveis

### Client

| Comando                   | Descrição                                                |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | Inicia o ambiente de desenvolvimento                     |
| `npm run build`           | Gera a build de produção                                 |
| `npm run preview`         | Visualiza a build localmente                             |
| `npm run lint`            | Executa o ESLint                                         |
| `npm run typecheck`       | Executa a verificação de tipos                           |
| `npm test`                | Executa os testes unitários e de integração do front-end |
| `npm run test:watch`      | Executa os testes em modo watch                          |
| `npm run test:e2e`        | Executa os testes end-to-end                             |
| `npm run test:e2e:ui`     | Executa os testes E2E com interface do Playwright        |
| `npm run test:e2e:headed` | Executa os testes E2E com navegador visível              |

### Server

| Comando                    | Descrição                                    |
| -------------------------- | -------------------------------------------- |
| `npm run dev`              | Inicia o servidor em modo de desenvolvimento |
| `npm run build`            | Compila o TypeScript                         |
| `npm start`                | Inicia a versão compilada                    |
| `npm run lint`             | Executa o ESLint                             |
| `npm run typecheck`        | Executa a verificação de tipos               |
| `npm test`                 | Executa os testes                            |
| `npm run test:integration` | Executa os testes de integração              |
| `npm run test:watch`       | Executa os testes em modo watch              |

## Testes

O projeto possui diferentes níveis de testes.

### Front-end

Os testes do front-end utilizam:

- Vitest
- Testing Library

Eles cobrem componentes, comportamentos e fluxos importantes da interface.

### Back-end

O back-end possui testes para validações, regras de negócio, autenticação, middlewares, controllers e integração com a API.

### End-to-end

Os testes E2E utilizam Playwright e validam fluxos completos da aplicação.

Entre os cenários cobertos estão:

```text
cadastro
  ↓
login
  ↓
criação de tarefa
  ↓
edição
  ↓
conclusão
  ↓
busca e filtros
  ↓
logout
```

Também existem testes específicos para verificar o isolamento entre usuários:

```text
Usuário A
  ↓
cria tarefas
  ↓
logout
  ↓
Usuário B
  ↓
não visualiza as tarefas do usuário A
```

Além disso, são testados comportamentos relacionados à expiração de sessão.

## Interface

A interface foi construída com abordagem **Mobile First**.

A base dos estilos prioriza telas menores e o layout é expandido progressivamente para tablets, notebooks e desktops.

O projeto também considera aspectos de acessibilidade, incluindo:

- navegação por teclado;
- gerenciamento de foco;
- labels para campos de formulário;
- atributos `aria-*`;
- mensagens de erro acessíveis;
- skip link para navegação direta ao conteúdo principal;
- áreas clicáveis adequadas para dispositivos touch;
- atenção ao contraste visual;
- suporte a preferências de redução de movimento.

## Decisões técnicas

### SQL puro sem ORM

O acesso ao banco é feito com `mysql2`, utilizando SQL diretamente.

A decisão permite praticar consultas SQL, relacionamentos, migrations e a separação entre regras de negócio e persistência sem introduzir uma camada adicional de abstração.

### Redux apenas para autenticação

O Redux Toolkit é utilizado para o estado global relacionado à autenticação.

As tarefas permanecem sob responsabilidade do fluxo e das abstrações específicas desse domínio, evitando centralizar todo o estado da aplicação no Redux sem necessidade.

### Sessão com cookie HttpOnly

A autenticação utiliza cookies HttpOnly para evitar que o identificador da sessão precise ficar diretamente disponível para o JavaScript da aplicação.

### Arquitetura em camadas

O back-end utiliza a separação:

```text
Route → Controller → Service → Repository
```

Essa estrutura facilita a organização do código, os testes e a evolução das funcionalidades.

### Desenvolvimento incremental

O projeto foi construído em etapas pequenas e progressivas.

Cada funcionalidade foi implementada sobre uma base já existente, priorizando validação contínua, refatoração quando necessária e testes dos fluxos críticos.

## Próximos passos

Os próximos passos planejados para o projeto incluem:

- configuração de integração contínua;
- automação de lint, typecheck e testes com GitHub Actions;
- deploy do front-end e da API;
- configuração do banco de dados em produção;
- definição das variáveis de ambiente de produção;
- ajustes de CORS e cookies conforme a arquitetura de deploy;
- execução das migrations em produção.

## Status

O Clarity está em desenvolvimento ativo.

Atualmente, a aplicação já possui uma base full stack funcional com autenticação, gerenciamento isolado de tarefas por usuário, testes automatizados, testes end-to-end, responsividade, acessibilidade e medidas de segurança e robustez preparadas antes da etapa de deploy.

---

Desenvolvido como projeto de estudo para aprofundamento em desenvolvimento full stack com React, Node.js, TypeScript e MySQL.
