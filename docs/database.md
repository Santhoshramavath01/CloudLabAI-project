# CloudLab-AI — Database

Phase 1 shipped a minimal `User` model purely to prove the Prisma +
PostgreSQL connection end to end.

Phase 2 (Authentication) adds `RefreshToken`:

- **User** — unchanged from Phase 1, now has a `refreshTokens` relation.
- **RefreshToken** — one row per issued refresh token / session. Only a
  SHA-256 hash of the JWT is stored (`tokenHash`, unique), never the raw
  token. `id` doubles as the token's `jti` claim for O(1) lookup on
  refresh. Indexed on `userId`; cascades on user deletion.

A separate `Session` table was intentionally **not** added — a
RefreshToken row already models one authenticated session (issued,
revocable, expirable) and a second table would just duplicate it.

Run `npx prisma migrate dev --name add_refresh_tokens` locally (against a
running Postgres) to generate and apply the migration — it isn't
pre-generated in this repo since Prisma migration history must be created
by the CLI against a real database connection, not authored by hand.

Phase 2.7 (Workspace foundation) adds `Workspace`:

- **Workspace** — the database-level entity only; no container, resource-
  limit, or template fields yet, since Docker provisioning is a later
  phase. `status` (`WorkspaceStatus`, mirrored in
  `packages/shared/src/types/common.ts`) defaults to `STOPPED` rather than
  `CREATING`/`STARTING` — nothing is actually being provisioned yet, so
  `STOPPED` ("exists, nothing running") is the honest default. Owned via
  `ownerId` → `User`, cascades on user deletion, unique on
  `(ownerId, name)` so one user can't have two workspaces with the same
  name, indexed on `ownerId` for the list-by-owner query.

No `WorkspaceMember` table yet — collaboration/multi-user workspace access
is out of scope until the Collaboration phase; today a workspace has
exactly one owner and the service layer enforces that only the owner can
read or modify it (see docs/security.md).

Run `npx prisma migrate dev --name add_workspaces` locally to generate and
apply this migration too.

Phase 2.11/2.12 (Docker service layer + workspace lifecycle) add two
nullable columns to `Workspace`:

- **containerId** — the dockerode container ID once a workspace has been
  started at least once; `null` until then.
- **containerImage** — the image it was provisioned from. Still no
  per-workspace template/resource fields — every workspace is provisioned
  from `WORKSPACE_DEFAULT_IMAGE` with the CPU/memory limits from env, since
  the wizard's template-selection and resource-allocation steps aren't
  built yet.

Still no separate `Container` table: a workspace has exactly one
container today, so `containerId` on `Workspace` doesn't yet need its own
table the way `RefreshToken` needed one for `User`. That changes once a
workspace can run more than one container (Docker management phase).

Run `npx prisma migrate dev --name add_workspace_container_fields`
locally to generate and apply this migration.

The remaining schema (Container as its own table, TerminalSession, File,
GitRepository, Conversation/Message, Metric, Alert, Notification,
ActivityLog, and WorkspaceMember) is introduced incrementally through
Phase 14 (Collaboration/RBAC).
