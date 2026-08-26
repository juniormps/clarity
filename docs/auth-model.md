# Modelo de Autenticação e Usuários

Este documento registra as decisões de modelagem que orientarão a
implementação de usuários e autenticação no Clarity.

É um contrato arquitetural, não uma especificação de implementação.

---

## Relação fundamental

```text
User 1 ─────────── N Task
```

- um usuário pode possuir várias tarefas;
- cada tarefa pertence a exatamente um usuário;
- no modelo final, uma tarefa não existe sem proprietário.

---

## Modelo da tabela `users`

```text
users
├── id
├── first_name
├── last_name
├── email
├── password_hash
├── created_at
└── updated_at
```

Tipos conceituais para MySQL:

```sql
id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
first_name    VARCHAR(120) NOT NULL
last_name     VARCHAR(120) NOT NULL
email         VARCHAR(255) NOT NULL
password_hash VARCHAR(255) NOT NULL
created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

O e-mail possui restrição de unicidade:

```sql
UNIQUE (email)
```

A migration será criada no Passo 25.

---

## Regras do usuário

### FirstName

- obrigatório;
- armazenado sem espaços desnecessários nas extremidades;
- limite máximo compatível com `VARCHAR(120)`;
- preserva maiúsculas/minúsculas.

### LastName

- obrigatório;
- armazenado sem espaços desnecessários nas extremidades;
- limite máximo compatível com `VARCHAR(120)`;
- preserva maiúsculas/minúsculas;
- o valor é o sobrenome completo informado pelo usuário, sem separação
  interna.

A validação exata será implementada no Passo 25.

### Email

- obrigatório;
- normalizado pela aplicação antes da persistência;
- `trim` aplicado;
- armazenado em lowercase;
- único.

Exemplo conceitual:

```text
"  User@Example.COM  "
        ↓
"user@example.com"
```

A aplicação tratará email duplicado adequadamente, mas a proteção final
também deve existir no banco através de `UNIQUE`. A unicidade não deve
depender apenas de uma consulta prévia.

### Password

A senha em texto puro:

- nunca deve ser persistida;
- nunca deve aparecer no modelo `User` retornado pela aplicação;
- nunca deve ser incluída em respostas da API;
- deve existir apenas durante o processamento necessário para
  criação/autenticação.

O banco armazenará somente `password_hash`.

- Não haverá coluna `password`.
- Não haverá coluna separada de `salt` neste momento.
- O formato completo produzido pelo algoritmo de hash será armazenado
  em `password_hash`.

A escolha/instalação da biblioteca de hash pertence ao Passo 25.

---

## Modelo alvo de `tasks`

Tabela atual:

```text
tasks
├── id
├── title
├── completed
├── created_at
└── updated_at
```

Modelo final:

```text
tasks
├── id
├── user_id
├── title
├── completed
├── created_at
└── updated_at
```

Conceitualmente:

```sql
user_id BIGINT UNSIGNED NOT NULL
```

Com chave estrangeira:

```text
tasks.user_id → users.id
```

Relação final:

```text
users.id 1 ─────────── N tasks.user_id
```

`user_id` deve possuir índice apropriado para as consultas por usuário.

A tabela `tasks` não será alterada neste passo.

---

## Passo 28 — Tarefas vinculadas ao usuário autenticado (concretizado)

A relação foi materializada no banco:

```text
User 1 ─────── N Task

tasks.user_id
      ↓
users.id
```

- migration `004_add_user_id_to_tasks.sql` adiciona `user_id` com
  `BIGINT UNSIGNED NOT NULL`, índice `idx_tasks_user_id` e foreign key
  `tasks.user_id → users.id` com `ON DELETE CASCADE`;
- as tarefas legadas (pré-sistema de usuários) foram descartadas durante
  a migration, pois nenhuma tarefa anônima deveria ser preservada ou
  atribuída artificialmente a um usuário;
- `user_id` é obrigatório: nenhuma tarefa existe sem proprietário.

A identidade usada nas operações de tarefas flui exclusivamente a partir
da sessão:

```text
cookie sid
   ↓
requireAuth
   ↓
req.auth.userId
   ↓
controller
   ↓
service
   ↓
repository
   ↓
WHERE user_id = ?
```

- o frontend não informa a propriedade da tarefa; `userId` nunca é aceito
  de `req.body`, `req.params`, query string ou headers;
- o isolamento é aplicado diretamente no SQL, com `WHERE user_id = ?`
  na listagem e `WHERE id = ? AND user_id = ?` nas atualizações e
  exclusões individuais;
- a criação associa automaticamente a tarefa ao usuário autenticado via
  `INSERT INTO tasks (user_id, title) VALUES (?, ?)`;
- tentativas de editar/excluir tarefas de outro usuário resultam em
  `404 Task not found.`, indistinguíveis de tarefas inexistentes;
- os testes completos de isolamento entre contas pertencem ao Passo 29.

---

## Regra de propriedade

O `user_id` de uma tarefa **não será fornecido pelo cliente** como
autoridade sobre a propriedade.

Fluxo no modelo final:

```text
requisição autenticada
        ↓
servidor identifica o usuário da sessão
        ↓
userId autenticado
        ↓
service/repository
        ↓
query limitada ao usuário
```

Exemplos conceituais futuros:

```sql
SELECT ...
FROM tasks
WHERE user_id = ?
```

```sql
UPDATE tasks
SET ...
WHERE id = ?
  AND user_id = ?
```

O frontend não poderá escolher arbitrariamente `{ "userId": 123 }` para
definir o proprietário da tarefa. A identidade usada nas operações de
tarefas virá da autenticação validada pelo servidor.

A implementação pertence aos Passos 27 e 28.

---

## Relação e exclusão do usuário

```sql
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
```

Justificativa:

- tarefas são dados pertencentes ao usuário;
- se futuramente um usuário for removido do sistema, suas tarefas não
  devem permanecer órfãs.

A exclusão de conta não será implementada neste passo. Apenas o
comportamento referencial do modelo é definido aqui.

---

## Modelo de domínio `User`

Representação segura conceitual de um usuário dentro da aplicação:

```ts
interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}
```

`password` e `passwordHash` não fazem parte do objeto público enviado
ao frontend.

Internamente, o repository poderá precisar de uma representação que
inclua `passwordHash` para autenticação, mas essa estrutura permanecerá
restrita ao backend.

Esses tipos TypeScript ainda não serão criados; serão implementados
quando necessários.

---

## Autenticação: decisões fixadas

- autenticação baseada em email + senha;
- apenas o hash da senha é persistido;
- a identidade autenticada é determinada pelo servidor;
- rotas protegidas obterão `userId` da autenticação;
- credenciais não devem ser usadas como propriedade enviada pelo frontend.

## Sessão

A autenticação usa:

```text
cookie HttpOnly + sessão server-side
```

Fluxo conceitual:

```text
login válido
    ↓
token opaco aleatório
    ↓
SHA-256 do token
    ↓
token original → cookie HttpOnly
hash do token → tabela sessions
```

Resumo das decisões concretizadas:

- tabela `sessions` armazena apenas o hash SHA-256 do token;
- o token real existe somente no cookie `sid`;
- duração server-side da sessão: 24 horas;
- cookie com `Max-Age` alinhado à duração da sessão (24 horas), a partir de
  uma única fonte de verdade (`SESSION_TTL_MS`);
- cookie configurado com `HttpOnly`, `SameSite=Lax`, `Path=/`;
- `Secure` habilitado somente em produção;
- endpoints: `POST /api/auth/login`, `GET /api/auth/me` e
  `POST /api/auth/logout`.

O middleware de autenticação reutilizável pertence ao Passo 27.

---

## Passo 27 — Middleware de autenticação (concretizado)

Fluxo de uma rota protegida:

```text
cookie sid
   ↓
requireAuth
   ↓
sessão válida
   ↓
req.auth.userId
   ↓
rota protegida
```

- `requireAuth` resolve a sessão reutilizando `authService.me()`, sem
  duplicar hash SHA-256, consulta de sessão ou verificação de expiração;
- em sessão válida, disponibiliza `req.auth = { userId: user.id }`;
- em sessão ausente, inválida ou expirada, encaminha `AppError` 401
  (`Authentication required.`) para o `errorHandler`;
- `/api/tasks` agora exige autenticação (todas as rotas do módulo);
- o isolamento das tarefas por `userId` ainda pertence ao Passo 28.

---

## Estratégia para tarefas já existentes

Atualmente há tarefas anônimas no banco, pois `tasks` ainda não possui
`user_id`.

> As tarefas atuais são dados de desenvolvimento anteriores ao sistema
> de usuários. Quando a restrição obrigatória de propriedade
> (`user_id NOT NULL`) for introduzida, essas tarefas legadas deverão
> ser tratadas explicitamente. Como o Clarity ainda está em
> desenvolvimento e não possui dados de produção, elas poderão ser
> descartadas/resetadas durante essa transição, em vez de serem
> atribuídas artificialmente a um usuário.

O reset não será executado agora. A estratégia concreta será aplicada
somente quando `tasks.user_id` for introduzido.

---

## Sequenciamento das próximas etapas

```text
Passo 24
Modelagem e decisões arquiteturais.

Passo 25
Criar users + cadastro + hash de senha.

Passo 26
Login + sessão/autenticação + /me + logout.

Passo 27
Middleware de autenticação.

Passo 28
Adicionar/vincular user_id às tarefas e restringir todas as queries ao usuário autenticado.

Passo 29
Testar isolamento entre usuários.
```

O modelo final é definido agora, mas será implementado incrementalmente.
