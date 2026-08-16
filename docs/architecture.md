# CloudLab-AI — Architecture

This document is the canonical architecture reference and grows with each
phase. Phase 1 establishes:

- Monorepo layout (`apps/frontend`, `apps/backend`, `packages/shared`)
- Backend layering: routes → controllers → services → repositories → Prisma
- Config loading via a validated `env` object (`apps/backend/src/config/env.ts`)
- Standard API envelope: `{ success, data }` / `{ success: false, error }`
- Central error handling via `AppError` + `errorHandler` middleware
- Health check endpoint verifying DB + Redis connectivity

Subsequent phases extend this file with: auth flow diagrams, workspace
lifecycle state machine, Docker architecture, WebSocket namespace map, and
AI provider abstraction details, as each is implemented.
