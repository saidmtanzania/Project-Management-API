<div align="center">

# Project Management API

Lightweight REST service for creating, tracking, and archiving client projects with PostgreSQL-backed persistence.

</div>

## Overview
- Express 5 server with `helmet` hardening, JSON body parsing, and `morgan` request logging
- Modular routing → controller → service → data-access stack for predictable request handling
- PostgreSQL persistence with UUID primary keys, soft deletes, and enum-backed status transitions
- Safe startup lifecycle that auto-creates the target database and replays SQL migrations before listening

## Quick Start
1. **Install dependencies**
	```bash
	npm install
	```
2. **Configure environment**
	- Copy `example.env` → `.env`
	- Fill in the PostgreSQL connection values (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`)
3. **Run the API**
	```bash
	npm run dev      # hot reload with nodemon
	# or
	npm start        # production-style single run
	```

> Startup automatically runs `database/dbInit.js` (creates the DB if missing) and `database/runMigrations.js` (applies any pending SQL files under `database/migrations`).

## Environment Variables (`.env`)
| Name | Description |
| --- | --- |
| `PORT` | HTTP port (default 3000) |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default 5432) |
| `DB_USER` | PostgreSQL user with create-db + DDL rights |
| `DB_PASSWORD` | Password for the DB user |
| `DB_NAME` | Database name to create/connect |

## Project Architecture
| Layer | Location | Responsibility |
| --- | --- | --- |
| Entry point | [src/app.js](src/app.js) | Loads env vars, bootstraps DB, wires middleware, mounts routes |
| Routing | [src/routes/project.route.js](src/routes/project.route.js) | Declares REST endpoints under `/api/projects` |
| Controllers | [src/controllers/project.controller.js](src/controllers/project.controller.js) | Validates params/payloads, coordinates service calls, shapes HTTP responses |
| Services | [src/services/project.service.js](src/services/project.service.js) | Encapsulates SQL, performs CRUD + soft delete logic |
| Utilities | [src/utils](src/utils) | Shared logger (`winston`), pg `Pool`, and config readers |
| Database scripts | [database/*.js](database) | CLI helpers for migration creation, DB bootstrap, and migration replay |

## Database & Migrations
- Base schema lives in [database/migrations/001_create_projects_table.sql](database/migrations/001_create_projects_table.sql)
- Run `npm run make:migration migrate_name` to create numbered SQL templates
- On startup, every new SQL file executes inside a transaction and is recorded in the `migrations` bookkeeping table
- Projects table highlights:
  - UUID primary keys generated via `pgcrypto`
  - `project_status_enum` type with `active`, `on_hold`, `completed`
  - Soft delete via `deletedAt`, automatic `createdAt`/`updatedAt`

## REST API
| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/projects` | List active (non-deleted) projects, newest first |
| POST | `/api/projects` | Create a project (requires `name`, `clientName`, `startDate`) |
| GET | `/api/projects/:id` | Fetch one project by UUID |
| PATCH | `/api/projects/:id` | Update mutable fields; prevents downgrading a `completed` status |
| DELETE | `/api/projects/:id` | Soft-delete a project (sets `deletedAt`) |

### Project List Query Features
- Optional `status` filter accepts `active`, `on_hold`, or `completed`
- Optional `search` filter performs case-insensitive partial matches on project `name` or `clientName`
- Optional `sort` accepts `createdAt`, `startDate`, or the descending `-createdAt`, `-startDate` forms
- All filters combine with each other and support empty datasets without errors; results always include `{ data, meta }` with pagination info (`page`, `limit`, `total`, `totalPages`)

### Validation & Business Rules
- All IDs must be valid UUID strings (`uuid.validate`)
- `endDate` cannot precede `startDate`
- Once a project is `completed`, its status cannot revert
- All mutations update `updatedAt` server-side

## Logging & Error Handling
- Winston logger configuration lives in [src/utils/logger.js](src/utils/logger.js); console transport with timestamped output
- Process-level guards exit on uncaught exceptions/unhandled rejections to avoid indeterminate state
- Database operations rely on pooled connections from [src/utils/dbPool.js](src/utils/dbPool.js)

## Development Tips
- Use the HTTP request snippets under [docs/api](docs/api) with REST Client

## AI Usage (Mandatory Disclosure)
- **Tools used:** GPT-5.1-Codex via GitHub Copilot Chat inside VS Code
- **Purpose:** Drafted this README structure/content and cross-checked project files to describe architecture, setup, and API behavior accurately
- **Modifications or rejections:** Accepted AI suggestions for section ordering and phrasing; manually adjusted wording for precision (e.g., clarified migration workflow) and rejected generic boilerplate that did not match the existing stack
- **Understanding coverage:** Fully understand the entire codebase, including Express bootstrap, routing/controller/service layers, PostgreSQL pooling, migration utilities, and SQL schema definitions; no partially-understood areas remain, so I can explain every module in the next review round
