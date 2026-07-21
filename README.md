# DevFolio — Portfolio Platform (MVP)

A production-grade evolution of a static portfolio into a **scalable full-stack
platform**. Instead of hand-editing HTML, the owner logs into an admin dashboard to
manage **Projects** and **Blog Posts**, and reads **Contact Messages** from visitors —
all served by a typed REST API backed by PostgreSQL.

Built by / for **Akor Innocent Oboche** — DevOps Engineer.

---

## Table of contents

1. [Architecture](#1-architecture)
2. [Tech stack](#2-tech-stack)
3. [File structure](#3-file-structure)
4. [Database schema](#4-database-schema)
5. [API endpoints](#5-api-endpoints)
6. [UI architecture](#6-ui-architecture)
7. [Running locally](#7-running-locally)
8. [Deployment & scaling](#8-deployment--scaling)

---

## 1. Architecture

A classic **3-tier** architecture with a clean, layered backend. Full detail in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│  React SPA   │  JSON  │  Express API │ Prisma │ PostgreSQL   │
│ public+admin │ ─────▶ │  (layered)   │ ─────▶ │   database   │
└──────────────┘        └──────────────┘        └──────────────┘
        ▲                       │
        └─── Nginx (static + /api reverse-proxy) ───┘
```

**Backend request flow (single responsibility per layer):**

```
Router → Middleware (auth · validate · rate-limit) → Controller → Service → Repository → DB
```

- **Routers** map HTTP to handlers and attach middleware.
- **Controllers** parse requests / shape responses only.
- **Services** hold business rules and authorization.
- **Repositories** are the only code that touches Prisma — the DB seam for
  caching / read-replicas later.

This keeps the MVP small but lets it scale: the API is **stateless** (JWT auth),
so you run N replicas behind a load balancer without sticky sessions.

## 2. Tech stack

| Layer     | Tech                                                        |
| --------- | ----------------------------------------------------------- |
| Frontend  | React 18, Vite, React Router, TypeScript, CSS design tokens |
| Backend   | Node 20, Express, TypeScript, Zod, JWT, bcrypt              |
| Data      | PostgreSQL 16, Prisma ORM                                   |
| Security  | Helmet, CORS allow-list, rate limiting, input validation    |
| DevOps    | Docker, docker-compose, GitHub Actions CI, Nginx, Kubernetes |

## 3. File structure

```
My-Portfolio/
├── docker-compose.yml         # Full local stack: db + api + web
├── docs/ARCHITECTURE.md       # Deep-dive architecture doc
├── .github/workflows/ci.yml   # Lint / typecheck / test / build
│
├── apps/
│   ├── api/                    # Backend REST API
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Data model
│   │   │   └── seed.ts         # Admin + starter content
│   │   ├── src/
│   │   │   ├── config/env.ts           # Validated env
│   │   │   ├── lib/                     # prisma client, logger
│   │   │   ├── utils/                   # errors, jwt, password, slug
│   │   │   ├── middleware/              # auth, validate, error handler
│   │   │   ├── modules/                 # Feature modules (vertical slices)
│   │   │   │   ├── auth/                #   routes·controller·service·schema
│   │   │   │   ├── projects/            #   + repository
│   │   │   │   ├── posts/
│   │   │   │   └── messages/
│   │   │   ├── routes/index.ts          # API v1 router
│   │   │   ├── app.ts                    # Express app (testable)
│   │   │   └── server.ts                 # Boot + graceful shutdown
│   │   ├── tests/                        # Vitest + supertest
│   │   └── Dockerfile
│   │
│   └── web/                    # Frontend SPA
│       ├── src/
│       │   ├── api/            # Typed API client + resources + types
│       │   ├── context/        # AuthContext (JWT session)
│       │   ├── components/     # RequireAuth, SiteNav, useAsync
│       │   ├── pages/          # HomePage, PostPage, LoginPage
│       │   │   └── admin/      # Layout, Dashboard, Projects, Posts, Messages
│       │   └── styles/global.css
│       ├── nginx.conf          # SPA + /api proxy
│       └── Dockerfile
│
├── Dockerfile · Jenkinsfile · deployment.yaml   # Legacy static-site pipeline
└── index.html                                    # Original static portfolio
```

Each backend **module** is a vertical slice (`routes → controller → service →
repository → schema`), so adding a new resource (e.g. `testimonials`) is a
copy-paste of one folder + one line in `routes/index.ts`.

## 4. Database schema

Defined in [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma).

```
┌────────────────────┐        ┌──────────────────────┐
│ User               │        │ Project              │
│────────────────────│        │──────────────────────│
│ id            PK    │──┐     │ id            PK      │
│ email       unique │  │ 1  * │ slug        unique    │
│ passwordHash       │  ├─────▶│ title, summary, ...   │
│ name               │  │      │ techStack   text[]    │
│ role   ADMIN|EDITOR│  │      │ featured, published   │
│ createdAt          │  │      │ authorId      FK ─────┘
└────────────────────┘  │      └──────────────────────┘
                        │      ┌──────────────────────┐
                        │ 1  * │ Post                 │
                        └─────▶│ id PK · slug unique   │
                               │ title, excerpt, body  │
                               │ tags text[]·published │
                               │ publishedAt·authorId  │
                               └──────────────────────┘
┌────────────────────┐
│ Message            │   (no relation — public inbound)
│────────────────────│
│ id PK · name·email │
│ subject · body     │
│ isRead · createdAt │
└────────────────────┘
```

Indexes back the hot query paths: `Project(published, featured)`,
`Post(published, publishedAt)`, `Message(isRead, createdAt)`.

## 5. API endpoints

Base URL: `/api/v1`. Errors share one shape: `{ "error": { code, message, details? } }`.

### Public

| Method | Path                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| GET    | `/health`           | Liveness + DB check                  |
| GET    | `/projects`         | List **published** projects          |
| GET    | `/projects/:slug`   | Get one published project            |
| GET    | `/posts`            | List **published** posts (`?tag=`)   |
| GET    | `/posts/:slug`      | Get one published post               |
| POST   | `/messages`         | Submit contact form (rate-limited)   |

### Auth

| Method | Path           | Description                         |
| ------ | -------------- | ----------------------------------- |
| POST   | `/auth/login`  | Email+password → `{ token, user }`  |
| GET    | `/auth/me`     | Current user (Bearer token)         |

### Admin (require `Authorization: Bearer <jwt>`)

| Method | Path                    | Description                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/admin/projects`       | List all (incl. drafts)        |
| POST   | `/admin/projects`       | Create project                 |
| PATCH  | `/admin/projects/:id`   | Update project                 |
| DELETE | `/admin/projects/:id`   | Delete project                 |
| GET    | `/admin/posts`          | List all posts                 |
| POST   | `/admin/posts`          | Create post                    |
| PATCH  | `/admin/posts/:id`      | Update post                    |
| DELETE | `/admin/posts/:id`      | Delete post                    |
| GET    | `/admin/messages`       | Inbox (with unread count)      |
| PATCH  | `/admin/messages/:id`   | Mark read / unread             |
| DELETE | `/admin/messages/:id`   | Delete message                 |

Example:

```bash
# Log in
curl -s localhost:4000/api/v1/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"akorinnocent2@gmail.com","password":"ChangeMe123!"}'

# Use the token
curl -s localhost:4000/api/v1/admin/projects -H "authorization: Bearer $TOKEN"
```

## 6. UI architecture

Single React SPA serving two experiences behind one router (`src/App.tsx`):

- **Public site** (`/`) — hero, projects grid, writing, and a contact form, all
  fed by the public API. Blog posts at `/blog/:slug`.
- **Admin dashboard** (`/admin/*`) — gated by `<RequireAuth>`; sidebar layout with
  Dashboard, Projects, Posts, Messages. CRUD via modal forms.

State & data:

- **AuthContext** stores the JWT (localStorage) and rehydrates the session via
  `/auth/me` on load.
- **`api/client.ts`** is a typed fetch wrapper: attaches the token, normalizes
  errors into `ApiError`, and auto-clears the token on 401.
- **`useAsync`** hook standardizes `{ data, loading, error, reload }` for every
  data-driven view.

Styling uses CSS custom properties (design tokens) matching the original site's
dark, accent-glow aesthetic — zero CSS dependencies.

## 7. Running locally

### Option A — Docker (everything, one command)

```bash
docker compose up --build
# Web  → http://localhost:8080
# API  → http://localhost:4000/api/v1/health
# Admin login: akorinnocent2@gmail.com / ChangeMe123!  (change these!)
```

### Option B — Dev servers (hot reload)

```bash
# 1. Start Postgres (or use compose just for db):
docker compose up -d db

# 2. API
cd apps/api
cp .env.example .env            # then edit secrets
npm install
npx prisma migrate dev          # create schema
npm run db:seed                 # admin + starter content
npm run dev                     # http://localhost:4000

# 3. Web (new terminal)
cd apps/web
npm install
npm run dev                     # http://localhost:5173 (proxies /api → :4000)
```

Run backend tests: `cd apps/api && npm test`.

## 8. Deployment & scaling

- **Containers**: `apps/api/Dockerfile` (multi-stage → tiny runtime, runs
  migrations on start) and `apps/web/Dockerfile` (Vite build → Nginx).
- **CI**: `.github/workflows/ci.yml` typechecks + tests the API against a real
  Postgres and builds the web bundle on every push.
- **Kubernetes**: the existing `deployment.yaml` models replica-based scaling; the
  stateless JWT API scales horizontally behind a `Service`/LoadBalancer.
- **Growth path** (see architecture doc): Redis cache on read-heavy public
  endpoints, Postgres read replicas, object storage + CDN for images, and a queue
  for message notifications.

---

> The original static site (`index.html`) and its Jenkins/Docker/K8s pipeline are
> preserved at the repo root for reference; DevFolio is the platform it grows into.
