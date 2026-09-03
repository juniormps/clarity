# Modelo de Autenticação e Usuários

Este documento registra o modelo arquitetural atual de usuários,
autenticação, sessões e propriedade de tarefas no Clarity.

É um contrato arquitetural, não uma especificação de implementação.

---

## Relação fundamental

```text
User 1 ─────────── N Task
```

- um usuário pode possuir várias tarefas;
- cada tarefa pertence a exatamente um usuário;
- uma tarefa não existe sem proprietário.

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

A tabela é definida pela migration `database/migrations/002_create_users.sql`.

---

## Regras do usuário

### FirstName

- obrigatório;
- deve ser uma string;
- recebe `trim()` antes da persistência;
- possui no máximo 120 caracteres;
- preserva maiúsculas/minúsculas.

### LastName

- obrigatório;
- deve ser uma string;
- recebe `trim()` antes da persistência;
- possui no máximo 120 caracteres;
- preserva maiúsculas/minúsculas;
- o valor é o sobrenome completo informado pelo usuário, sem separação
  interna.

### Email

- obrigatório;
- normalizado pela aplicação antes da persistência;
- `trim` aplicado;
- armazenado em lowercase;
- deve possuir formato válido;
- possui no máximo 255 caracteres;
- único.

Exemplo conceitual:

```text
"  User@Example.COM  "
        ↓
"user@example.com"
```

A aplicação trata email duplicado adequadamente, mas a proteção final
também existe no banco através de `UNIQUE`. A unicidade não depende apenas de
uma consulta prévia.

### Password

A senha em texto puro:

- possui entre 8 e 128 caracteres;
- não pode ser composta apenas por espaços;
- exige confirmação obrigatória que corresponda exatamente à senha;
- nunca é persistida;
- nunca aparece no modelo `User` retornado pela aplicação;
- nunca é incluída em respostas da API;
- existe apenas durante o processamento necessário para
  criação/autenticação.

O projeto usa Argon2id e o banco armazena somente `password_hash`.

- Não existe coluna `password`.
- Não existe coluna separada de `salt`.
- O formato completo produzido pelo algoritmo de hash é armazenado em
  `password_hash`.

---

## Modelo da tabela `tasks`

```text
tasks
├── id
├── user_id
├── title
├── completed
├── created_at
└── updated_at
```

`user_id` é obrigatório e possui o seguinte tipo:

```sql
user_id BIGINT UNSIGNED NOT NULL
```

O índice `idx_tasks_user_id` atende às consultas por usuário. A chave
estrangeira estabelece a relação:

```text
tasks.user_id → users.id (ON DELETE CASCADE)
```

Relação:

```text
users.id 1 ─────────── N tasks.user_id
```

Toda tarefa pertence obrigatoriamente a um usuário. A migration
`database/migrations/004_add_user_id_to_tasks.sql` materializa a coluna, o
índice e a chave estrangeira.

---

## Tarefas vinculadas ao usuário autenticado

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

- o frontend não informa a propriedade da tarefa; `userId` não é aceito
  de `req.body`, `req.params`, query string ou headers;
- o isolamento é aplicado diretamente no SQL, com `WHERE user_id = ?`
  na listagem e `WHERE id = ? AND user_id = ?` nas atualizações e
  exclusões individuais;
- a criação associa automaticamente a tarefa ao usuário autenticado via
  `INSERT INTO tasks (user_id, title) VALUES (?, ?)`;
- tentativas de editar/excluir tarefas de outro usuário resultam em
  `404 Task not found.`, indistinguíveis de tarefas inexistentes.

---

## Regra de propriedade

O `user_id` de uma tarefa não é aceito como autoridade enviada pelo cliente.

O servidor obtém o `userId` a partir da sessão autenticada e limita todas as
operações de tarefas a esse usuário:

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

Exemplos conceituais:

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

O frontend não pode escolher arbitrariamente `{ "userId": 123 }` para
definir o proprietário da tarefa. A identidade usada nas operações de
tarefas vem da autenticação validada pelo servidor.

---

## Relação e exclusão do usuário

```sql
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
```

Justificativa:

- tarefas são dados pertencentes ao usuário;
- quando um usuário é removido do sistema, suas tarefas também são removidas
  e não permanecem órfãs.

---

## Modelo de domínio `User`

`User` é a representação segura de um usuário dentro da aplicação:

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

`UserAuthenticationRecord` é a representação interna usada na autenticação e
inclui `passwordHash`. `password` e `passwordHash` nunca fazem parte da
resposta pública enviada ao frontend.

Esses tipos estão definidos em `server/src/modules/users/user.types.ts`.

---

## Autenticação

A autenticação segue este fluxo:

```text
email + senha
    ↓
validação
    ↓
busca do usuário
    ↓
verificação Argon2id
    ↓
criação de sessão server-side
    ↓
cookie HttpOnly sid
```

- apenas o hash da senha é persistido;
- a identidade autenticada é determinada pelo servidor;
- rotas protegidas obtêm o usuário da sessão;
- credenciais ou `userId` enviados pelo frontend não determinam a
  propriedade de recursos.

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

Resumo das decisões:

- tabela `sessions` armazena apenas o hash SHA-256 do token;
- o token real existe somente no cookie `sid`;
- duração server-side da sessão: 24 horas (86400 segundos);
- cookie com `Max-Age` alinhado à duração da sessão (24 horas), a partir de
  uma única fonte de verdade (`SESSION_TTL_MS`);
- uma sessão só autentica enquanto `expires_at > CURRENT_TIMESTAMP`;
- endpoints: `POST /api/auth/login`, `GET /api/auth/me` e
  `POST /api/auth/logout`.

### Política de cookie

O cookie de sessão `sid` é configurado da seguinte forma, tanto em
desenvolvimento quanto em produção:

- `HttpOnly` — o identificador não é acessível via JavaScript;
- `SameSite=Lax` — o navegador envia o cookie no mesmo site;
- `Path=/`;
- `Secure=true` em produção (exige HTTPS);
- `Secure=false` fora de produção.

Em produção, frontend e API são acessados pela mesma origem
(`https://appclarity.vercel.app`): o client usa caminhos relativos `/api` e a
Vercel encaminha essas requisições para o Render via proxy. O cookie é,
portanto, first-party — não há envio cross-site entre Vercel e Render a partir
do navegador.

```text
Browser
    ↓
Vercel
    ↓ /api proxy
Render
```

### Criação e limpeza de sessões

O login segue a ordem:

```text
validar payload
    ↓
buscar usuário
    ↓
verificar senha com Argon2id
    ↓
credenciais válidas
    ↓
remover sessões expiradas
    ↓
gerar novo token
    ↓
persistir hash da nova sessão
    ↓
enviar cookie HttpOnly
```

A limpeza de sessões expiradas executa, conceitualmente:

```sql
DELETE FROM sessions
WHERE expires_at <= CURRENT_TIMESTAMP;
```

Ela ocorre somente após credenciais válidas e antes de criar a nova sessão.
Tentativas inválidas de login não executam a limpeza.

### Múltiplas sessões

O modelo permite, intencionalmente:

```text
User 1 ─────── N Sessions
```

Um mesmo usuário pode possuir várias sessões válidas simultaneamente (ex.:
Chrome desktop, Firefox, celular). Não existe restrição `UNIQUE(user_id)`. A
limpeza de sessões expiradas depende exclusivamente de `expires_at`, e não do
`user_id` — um novo login não invalida as demais sessões válidas do mesmo
usuário.

### Logout

O logout remove apenas a sessão correspondente ao token atual:

```sql
DELETE FROM sessions
WHERE token_hash = ?;
```

Portanto, a sessão A é removida no logout, enquanto uma sessão B do mesmo
usuário permanece válida.

### Sessões abandonadas e expiração

Se o navegador perde o cookie sem executar logout — por exemplo, fechamento de
janela anônima, cookies apagados ou remoção do perfil do navegador — o backend
não recebe automaticamente uma notificação de encerramento:

```text
navegador perde sid
    ↓
registro permanece em sessions
    ↓
chega a expires_at
    ↓
torna-se expirado
    ↓
próximo login válido executa cleanup
    ↓
registro é removido
```

Há uma diferença entre "sessão não expirada" e "navegador efetivamente ainda
utilizando aquela sessão": o servidor conhece `expires_at`, mas não sabe de
imediato se o navegador descartou o cookie. Registros temporariamente
expirados ou com cookie abandonado podem permanecer na tabela até o próximo
cleanup — por isso a tabela é descrita como "sessões server-side dos usuários"
e não apenas como "sessões ativas".

`expires_at` é comparado com `CURRENT_TIMESTAMP`. Como a conexão MySQL não
fixa explicitamente o timezone da sessão, este documento não estabelece UTC
como uma garantia da aplicação.

---

## Middleware de autenticação

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
- `/api/tasks` exige autenticação em todas as rotas do módulo;
- as operações de tarefas usam `req.auth.userId` para manter o isolamento por
  usuário.
