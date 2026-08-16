# CloudLab-AI

CloudLab-AI is a browser-based cloud development platform: isolated cloud
workspaces, Docker container management, a browser terminal, an in-browser
file editor, GitHub integration, live monitoring, and an integrated AI
development assistant.

This repository is being built in phases (see `docs/architecture.md`).
**Phase 1 (Foundation) is complete.**

## Monorepo layout

```
CloudLab-AI/
├── apps/
│   ├── frontend/   # React + Vite + TS + Tailwind
│   └── backend/    # Express + TS + Prisma + Socket.IO
├── packages/
│   └── shared/     # Shared types/schemas used by both apps
├── infra/
│   ├── docker/     # Dockerfiles
│   ├── nginx/      # Reverse proxy config (added in Phase 18)
│   └── scripts/    # Setup/seed/deploy scripts
└── docs/           # Architecture, database, API, security docs
```

## Prerequisites

- Node.js 20+
- Docker + Docker Compose
- npm 10+

## Local setup (Phase 1)

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

   At minimum, set real values for `JWT_SECRET` and `JWT_REFRESH_SECRET`
   (any random 32+ character string works for local dev).

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start Postgres + Redis (and optionally frontend/backend) via Docker
   Compose:

   ```bash
   docker compose up -d postgres redis
   ```

4. Generate the Prisma client and run the initial migration:

   ```bash
   npm run build:shared
   cd apps/backend
   npx prisma generate
   npx prisma migrate dev --name init
   cd ../..
   ```

5. Run the backend and frontend in dev mode (separate terminals):

   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

6. Verify:

   - Backend health check: http://localhost:4000/health
   - Backend API root: http://localhost:4000/api/v1
   - Frontend: http://localhost:5173

### Or run everything via Docker Compose

```bash
docker compose up --build
```

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — full system architecture
- [`docs/database.md`](docs/database.md) — schema design (grows each phase)
- [`docs/api.md`](docs/api.md) — API conventions and endpoints
- [`docs/setup.md`](docs/setup.md) — detailed local development setup
- [`docs/security.md`](docs/security.md) — security model
- [`docs/troubleshooting.md`](docs/troubleshooting.md) — common issues

## Roadmap

Phase 1 (Foundation) ✅ → Phase 2 (Design system) → Phase 3 (Authentication)
→ ... → Phase 20 (Final optimization & documentation).

See `docs/architecture.md` for the complete 20-phase roadmap.
