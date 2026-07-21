# DevFolio — System Architecture

> A production-grade evolution of the static portfolio into a scalable, self-serve
> portfolio platform: a public site + a headless content API + an admin dashboard.

## 1. Product in one line

A portfolio owner logs into an admin dashboard to manage **Projects** and **Blog
Posts**, and to read **Contact Messages** left by visitors. The public site renders
that content and lets visitors get in touch — all served from one API.

## 2. High-level architecture

```
                    ┌──────────────────────────────────────────────┐
                    │                  Clients                      │
                    │                                               │
   Visitors ───────▶│  Public Site (React SPA)   Admin Dashboard    │
                    │        /                        /admin         │
                    └───────────────┬──────────────────┬────────────┘
                                    │  HTTPS / JSON     │
                                    ▼                   ▼
                         ┌───────────────────────────────────┐
                         │        API Gateway (Nginx)         │  TLS, static, /api proxy
                         └───────────────┬───────────────────┘
                                         │
                         ┌───────────────▼───────────────────┐
                         │      REST API  (Node + Express)    │
                         │                                    │
                         │  routes → controllers → services → repositories
                         │  middleware: auth · validation · rate-limit · errors
                         └───────────────┬───────────────────┘
                                         │  Prisma ORM
                         ┌───────────────▼───────────────────┐
                         │          PostgreSQL 16             │
                         └────────────────────────────────────┘
```

### Layered request flow (backend)

```
HTTP → Router → Middleware (authenticate/validate) → Controller → Service → Repository (Prisma) → DB
                                                          │
                                                          └── returns DTO → Controller → JSON response
```

Each layer has a single responsibility:

| Layer          | Responsibility                                             |
| -------------- | ---------------------------------------------------------- |
| **Router**     | Maps HTTP verbs/paths to controllers, attaches middleware  |
| **Middleware** | Cross-cutting: auth, Zod validation, rate limiting, errors |
| **Controller** | Parses the request, calls a service, shapes the response   |
| **Service**    | Business rules, orchestration, authorization decisions     |
| **Repository** | Data access via Prisma — the only layer that touches the DB|

This separation is what makes the MVP *scalable*: services are transport-agnostic
(easy to expose over gRPC/queues later), and repositories isolate the DB so you can
add caching or sharding without touching business logic.

## 3. Technology choices & why

| Concern        | Choice                        | Why for an MVP                                  |
| -------------- | ----------------------------- | ----------------------------------------------- |
| Language       | TypeScript                    | One language front-to-back, strong typing       |
| API framework  | Express                       | Minimal, ubiquitous, huge ecosystem             |
| ORM            | Prisma                        | Type-safe queries, migrations, easy to reason about |
| Database       | PostgreSQL                    | Relational integrity, JSON columns, scales far  |
| Validation     | Zod                           | Runtime + compile-time safety, shared schemas   |
| Auth           | JWT (access token) + bcrypt   | Stateless, horizontally scalable                |
| Frontend       | React + Vite                  | Fast DX, SPA for both public + admin            |
| Styling        | CSS variables (design tokens) | Matches existing site aesthetic, zero deps      |
| Container      | Docker + docker-compose       | Reproducible local + prod parity                |
| CI             | GitHub Actions                | Lint, typecheck, test, build on every push      |

## 4. Scalability path (what this MVP is designed to grow into)

The MVP runs on a single API instance + Postgres. Because the design is **stateless**
and **layered**, scaling is incremental and non-disruptive:

1. **Vertical first** — bigger Postgres, more API CPU.
2. **Horizontal API** — JWT auth means any instance can serve any request; run N
   replicas behind the load balancer (the K8s `Deployment` already models this).
3. **Read scaling** — add Postgres read replicas; repositories route reads/writes.
4. **Caching** — drop Redis in front of the read-heavy public endpoints (`GET /projects`,
   `GET /posts`) with cache-aside in the repository layer.
5. **Media** — move image uploads to S3/object storage + CDN (schema already stores URLs).
6. **Async** — push email notifications for new messages onto a queue (BullMQ/SQS).

## 5. Security posture

- Passwords hashed with **bcrypt** (cost 12), never stored or logged in plaintext.
- **JWT** signed with a rotating secret; short access-token lifetime.
- **Zod** validates every request body/params/query at the edge.
- **Helmet** sets secure headers; **CORS** restricted to known origins.
- **Rate limiting** on auth + public write endpoints to blunt brute-force/spam.
- Centralized error handler never leaks stack traces in production.
- Secrets injected via environment, never committed (`.env.example` documents them).

## 6. Environments

| Env     | API                  | DB                    | Web                   |
| ------- | -------------------- | --------------------- | --------------------- |
| Local   | `pnpm dev` / compose | Postgres (compose)    | Vite dev server       |
| CI      | ephemeral            | Postgres service      | build only            |
| Prod    | container replicas   | managed Postgres      | static build + CDN    |

See [`../README.md`](../README.md) for run instructions and the API reference.
