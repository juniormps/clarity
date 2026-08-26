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

<!--
![Landing Page](docs/images/landing-page.png)

![Área de tarefas](docs/images/tasks-page.png)

![Login](docs/images/login.png)
-->

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
