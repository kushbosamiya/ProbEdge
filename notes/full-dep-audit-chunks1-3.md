# Full Dependency Audit — Chunks 1–3

Reference: current workspace state (as of 2026-04-09).

Format: ✅ / ⚠️ / ❌ per checklist item.

---

## Backend (`orderbook-backend/go.mod`)

1. ✅ Module path exactly `github.com/kushbosamiya/orderbooktrade-yellow`
   - Verified: `head -1 orderbook-backend/go.mod`

2. ⚠️/❌ Required deps present with expected versions
   - ✅ `github.com/erc7824/nitrolite v1.1.1` (present)
   - ⚠️ `github.com/coder/websocket (latest)` (pinned to `v1.8.14`, not `@latest`)
   - ❌ `github.com/gin-gonic/gin (latest)` (missing)
   - ❌ `github.com/go-redis/redis/v8` (missing; repo currently uses `github.com/redis/go-redis/v9 v9.5.1`)
   - ✅ `github.com/lib/pq` (present, pinned to `v1.10.9`)

3. ✅ `go.sum` non-empty after Nitrolite fix
   - Verified: `orderbook-backend/go.sum` has 270 lines

4. ✅ `internal/deps/deps.go` exists to prevent `go mod tidy` pruning
   - Verified: `orderbook-backend/internal/deps/deps.go`

---

## Frontend (`orderbook-frontend/package.json`)

5. ✅ Exact pins (no `^` or `~`)
   - ✅ `viem@2.47.6`
   - ✅ `wagmi@2.14.15`
   - ✅ `zustand@5.0.3`
   - ✅ `@erc7824/nitrolite@0.5.3`
   - ✅ `tailwindcss@3.4.17`

6. ✅ No peer dependency conflicts (current `npm ls` is clean)
   - Note: earlier installs emitted `ERESOLVE overriding peer dependency`, but the current tree reports no `npm ls` peer/invalid errors.

