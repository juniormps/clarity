# AGENTS.md

## Project Overview

Clarity is a full-stack task management application developed for
learning and portfolio purposes.

The project must prioritize:

- clear architecture;
- maintainability;
- readability;
- type safety;
- incremental development;
- explicit SQL;
- educational value.

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- CSS Modules
- React Router DOM
- Redux Toolkit when global state is genuinely required

### Backend

- Node.js
- Express
- TypeScript

### Database

- MySQL
- mysql2/promise
- raw SQL only

ORMs and query builders are not allowed.

---

## Development Philosophy

This project must be developed incrementally.

Do not implement features that were not explicitly requested.

Prefer small and coherent changes over large implementations.

Each development step should leave the application in a valid state
whenever possible.

After the initial infrastructure is ready, features should preferably
be implemented vertically:

database
→ repository
→ service
→ controller
→ route
→ frontend service
→ hook/state
→ UI

---

## Scope Control

Before modifying the project:

1. inspect the existing implementation;
2. understand the current architecture;
3. identify the minimum files required;
4. provide a short implementation plan;
5. avoid unrelated changes.

Do not:

- redesign unrelated parts of the application;
- introduce new libraries without a clear need;
- implement future features preemptively;
- change the architecture without explaining why;
- generate abstractions for hypothetical future requirements.

---

## TypeScript

Use TypeScript throughout both frontend and backend.

Avoid `any`.

Use `unknown` when dealing with untrusted values.

Prefer explicit domain types when they improve clarity.

Do not add unnecessary explicit annotations when TypeScript inference
already provides a clear and safe type.

---

## Backend Architecture

Backend feature code should follow this dependency direction:

route
→ controller
→ service
→ repository
→ database

### Routes

Routes define endpoints and connect middleware and controllers.

Routes must not contain business logic or SQL.

### Controllers

Controllers deal with HTTP concerns:

- request data;
- response data;
- HTTP status codes.

Controllers must not contain SQL.

### Services

Services contain application and business rules.

Services must not depend directly on Express Request or Response objects.

### Repositories

Repositories contain database access and SQL.

SQL must not appear in controllers or routes.

Use parameterized queries for all dynamic values.

---

## Database

Use MySQL through `mysql2/promise`.

Use a connection pool.

Do not use an ORM or query builder.

Database credentials must come from environment variables.

Never commit real credentials.

Schema changes must be represented by SQL migration files.

Use snake_case for database identifiers.

Example:

created_at
updated_at
user_id

---

## API

Use REST conventions where practical.

Use `/api` as the API prefix.

Return consistent JSON structures.

Use appropriate HTTP status codes.

Validate all data received from clients.

Do not expose internal database errors or stack traces to API consumers.

---

## Frontend Architecture

Components should primarily handle rendering and user interaction.

HTTP communication must be isolated from presentation components.

Use a service layer for API requests.

Example:

src/services/taskService.ts

Custom hooks may coordinate:

- remote data;
- loading state;
- error state;
- application actions.

Avoid calling `fetch` directly from multiple visual components.

---

## Frontend Routing

Use React Router DOM when client-side routing is required.

Keep routing configuration centralized.

Authentication-protected pages must use the project's established
route protection mechanism.

Do not create a custom routing solution when React Router DOM already
provides the required behavior.

---

## State Management

Prefer local React state for component-specific state.

Use Redux Toolkit only for state that genuinely needs to be shared
across unrelated parts of the application.

Redux Toolkit is the project's chosen global state management solution.

Do not introduce alternative global state libraries.

Do not move local UI state into Redux without a clear reason.

---

## CSS

Use CSS Modules for component-specific styles.

Global styles should contain only genuinely global concerns such as:

- reset;
- typography;
- root variables;
- shared design tokens.

Do not place component-specific styles in global stylesheets.

---

## Validation

Task titles:

- must be strings;
- must be trimmed;
- cannot be empty;
- cannot exceed 140 characters.

Frontend validation improves user experience.

Backend validation is mandatory and authoritative.

---

## Authentication

Authentication will be introduced incrementally after the initial
task CRUD is functional.

Passwords must never be stored in plain text.

Authentication and authorization must be enforced by the backend.

The frontend must never be treated as a security boundary.

Authenticated resources must be scoped to the authenticated user.

Never expose:

- password hashes;
- authentication secrets;
- tokens unnecessarily;
- internal authentication errors.

---

## Security

Never hardcode secrets.

Never commit `.env`.

Use parameterized SQL queries.

Treat all client input as untrusted.

Do not expose internal stack traces or database details.

---

## Accessibility

Preserve semantic HTML and accessibility behavior.

Interactive controls must be keyboard accessible.

Icon-only buttons must have accessible labels.

Maintain visible focus states.

Use ARIA only when native HTML semantics are insufficient.

---

## Dependencies

Do not install a dependency when the requirement can reasonably be
implemented using the platform or dependencies already present.

Before adding a package:

1. verify whether an equivalent dependency already exists;
2. explain why the new dependency is necessary.

---

## Testing and Verification

After meaningful changes, run the relevant available commands, such as:

- lint;
- typecheck;
- tests;
- build.

Do not claim that verification succeeded unless the command was
actually executed.

---

## Git

Do not commit automatically unless explicitly requested.

Do not push automatically unless explicitly requested.

Never use force push.

Keep changes focused so they can form meaningful Conventional Commits.

Do not mix unrelated refactors and features in the same change.

---

## AI Workflow

For every requested implementation:

1. read this AGENTS.md;
2. inspect relevant existing files;
3. identify the affected layers;
4. provide a short implementation plan;
5. implement only the requested scope;
6. verify the result;
7. summarize the files changed and relevant decisions.

If a request conflicts with this document, point out the conflict before
making a significant architectural change.

When requirements are genuinely ambiguous and the decision would have
architectural consequences, ask before choosing.