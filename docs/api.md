# CloudLab-AI — API Conventions

All endpoints are prefixed `/api/v1`. The health check lives outside this
prefix at `/health` for infra tooling.

## Response envelope

Success:
```json
{ "success": true, "data": {} }
```

Error:
```json
{ "success": false, "error": { "code": "RESOURCE_NOT_FOUND", "message": "..." } }
```

## Current endpoints (Phase 1)

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness + DB/Redis connectivity check |
| GET | `/api/v1` | API root/status |

Each subsequent phase appends its new routes to this table.
