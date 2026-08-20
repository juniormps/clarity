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
├── name
├── email
├── password_hash
├── created_at
└── updated_at
```

Tipos conceituais para MySQL:

```sql
id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
name          VARCHAR(120) NOT NULL
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

### Name

- obrigatório;
- armazenado sem espaços desnecessários nas extremidades;
- limite máximo compatível com `VARCHAR(120)`.

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
    name: string;
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

O mecanismo de sessão não será detalhado ainda. A decisão concreta de
implementação pertence ao Passo 26. O planejamento atual prevê
preferência por `cookie HttpOnly`.

Não serão criados, neste passo:

- biblioteca de sessão;
- JWT;
- cookies;
- tokens;
- tabela de sessões;
- middleware de autenticação.

Esses assuntos pertencem aos próximos passos.

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
