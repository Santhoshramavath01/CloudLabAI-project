# CloudLab-AI — Security Model

Phase 1 baseline:

- `helmet` for secure HTTP headers
- CORS locked to `FRONTEND_URL`
- All secrets loaded from environment variables via a validated schema
  (`apps/backend/src/config/env.ts`) — the process refuses to start with
  missing/invalid secrets rather than booting insecurely
- No Docker socket, database, or AI credentials are ever sent to the
  frontend

Phase 2 (Authentication) adds:

- **Password hashing**: Argon2id (`apps/backend/src/utils/password.ts`)
- **Access tokens**: short-lived JWT (`JWT_ACCESS_EXPIRES_IN`, default
  15m), returned in the response body only and kept in memory on the
  frontend (never `localStorage`) — sent as `Authorization: Bearer <token>`
- **Refresh tokens**: longer-lived JWT (`JWT_REFRESH_EXPIRES_IN`, default
  30d), delivered only via an `httpOnly`, `sameSite=lax` cookie scoped to
  `/api/v1/auth`, `secure` in production. Only a SHA-256 hash is persisted
  server-side; the raw token never touches the database
- **Rotation**: every `/auth/refresh` call revokes the presented refresh
  token and issues a new pair — a replayed/stolen token stops working the
  moment the legitimate client refreshes
- **Rate limiting**: `express-rate-limit` — a baseline limiter on all of
  `/api/v1`, and a stricter one on `/auth/login` + `/auth/register`
- **Validation**: all auth request bodies validated with Zod
  (`apps/backend/src/validators/auth.validator.ts`) before touching a
  controller

Phase 2.7 (Workspace foundation) adds the first piece of **authorization**
(distinct from authentication above — this is *what a logged-in user is
allowed to touch*, not just *who they are*):

- Every `/api/v1/workspaces/*` route requires a valid access token
  (`authenticate` middleware)
- `workspace.service.ts` enforces ownership on every read/write: a
  workspace lookup that doesn't belong to the requesting user returns
  `404` (not `403`) so the existence of other users' workspaces isn't
  leaked by a different status code
- Create/update bodies are Zod-validated
  (`apps/backend/src/validators/workspace.validator.ts`) the same way auth
  is

Full RBAC (roles beyond single-owner, e.g. the `WorkspaceRole` enum
already defined in `packages/shared`) arrives with the Collaboration
phase, once a `WorkspaceMember` table exists to hang roles off of.
Path-traversal protection for the file explorer and Docker input
validation are implemented in their respective later phases and
documented here as they land.

Phase 2.11/2.12 (Docker service layer + workspace lifecycle) add:

- **No direct Docker access from the frontend or controllers** —
  `modules/docker/docker.service.ts` is the only code that imports the
  dockerode client for lifecycle operations; `workspace.service.ts` is
  its only caller. This matches the Browser → Frontend → Backend API →
  Docker Service → Docker Engine chain in the architecture doc.
- **Container isolation via CPU/memory limits** — every container is
  created with `NanoCpus`/`Memory` set from
  `WORKSPACE_CONTAINER_CPU_LIMIT`/`WORKSPACE_CONTAINER_MEMORY_MB`, so a
  single workspace can't starve the host.
- **Ownership is re-checked on every lifecycle call** — start/stop/restart
  all go through the same `getOwnedWorkspaceOrThrow` used by
  read/update/delete, so a user can no more start someone else's
  container than they can read someone else's workspace.
- **State-machine guard against concurrent operations** — a
  start/stop/restart already in flight (workspace status `CREATING`,
  `STARTING`, `STOPPING`, or `DELETING`) rejects a second call with `409`
  rather than racing two Docker operations against the same container.
- **Command execution inside containers is still not implemented** —
  containers are provisioned to stay alive (`tail -f /dev/null`) but
  nothing can exec into them yet; that's the browser Terminal phase, which
  will add its own authorization layer restricting exec to the requesting
  user's own workspace container.
