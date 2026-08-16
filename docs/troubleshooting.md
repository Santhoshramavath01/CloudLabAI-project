# CloudLab-AI — Troubleshooting

### Backend fails to start with "Invalid environment configuration"

You haven't copied `.env.example` to `.env`, or `JWT_SECRET`/
`JWT_REFRESH_SECRET` are shorter than 16 characters. Generate long random
values and re-run.

### `npm run dev:backend` can't reach Postgres/Redis

Make sure `docker compose up -d postgres redis` is running and that
`DATABASE_URL`/`REDIS_URL` in `.env` point at `localhost` (not `postgres`/
`redis` hostnames — those only resolve inside the Compose network).

### `/health` returns `"database": "error"`

Run `npx prisma migrate dev` inside `apps/backend` to ensure the schema is
applied to a fresh database.
