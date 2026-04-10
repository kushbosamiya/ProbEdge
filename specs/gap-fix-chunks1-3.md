# Gap Fix Spec — Chunks 1–3 (pre-Chunk 4)

Source of truth: `p-2.md`  
Inputs:
- `notes/full-dep-audit-chunks1-3.md`
- `notes/feature-audit-chunks1-3.md`

Goal: enumerate what must be fixed (or stubbed) so Chunk 4 (Yellow SDK integration) can start cleanly.

---

## Section 1: BLOCKERS (must fix before Chunk 4)

### ❌ Missing `internal/yellow` package (Chunk 4 prerequisite)
- **File(s) to create:**  
  - `orderbook-backend/internal/yellow/client.go`  
  - `orderbook-backend/internal/yellow/session.go`  
  - `orderbook-backend/internal/yellow/types.go`
- **Exact function signatures needed:**
  - `func (c *Client) ValidateJWT(token, sessionKey string) bool`
  - `func (s *Session) UpdateState(ctx context.Context, marketID string, trades []Trade) error`
  - `func (s *Session) CloseSession(ctx context.Context) error`
- **Minimal implementation:** stub bodies returning `false` / `nil` as appropriate.
- **Test to write (stub-level OK):**
  - `go test ./internal/yellow/... -v` compiles and runs (tests can be added in Chunk 4 when behavior is known).

### ❌ WS `yellow_auth` must route to Yellow client
- **File to modify:** `orderbook-backend/internal/ws/hub.go`
- **Exact wiring needed:**
  - Ensure router has a `case "yellow_auth": ...`
  - In Chunk 4 it must call `yellowClient.ValidateJWT(token, sessionKey)` and reply `yellow_auth_success` on success.
- **Minimal implementation:** log-only stub in the message router (no business logic yet).
- **Test to write (stub-level OK):**
  - Hub test that `HandleMessage` does not panic on `"yellow_auth"`.

### ❌ Engine trades must be surfaced to session state update hook
- **File to create/modify:** a server layer (proposed: `orderbook-backend/internal/api/server.go` or `cmd/server/main.go`)
- **Exact function signature needed (stub acceptable):**
  - `func updateYellowSession(ctx context.Context, marketID string, trades []yellow.Trade) error`
- **Minimal implementation:** stub that returns `nil` and logs.
- **Test to write:** compile gate only until Chunk 4 introduces real behavior.

---

## Section 2: WARNINGS (fix before ETHGlobal demo)

### ⚠️ Backend deps mismatch vs “expected list”
- **Missing vs prompt expectations:**
  - `github.com/gin-gonic/gin` (not present)
  - `github.com/go-redis/redis/v8` (not present; using `github.com/redis/go-redis/v9`)
  - `github.com/coder/websocket` is pinned (not `@latest`)
- **Exact fix options:**
  - If `p-2.md` does not mandate gin/redis-v8 specifically, update the “expected list” to match chosen libs (recommended).
  - If gin is required, add it and migrate HTTP handlers to it later.
- **Owner chunk:** Chunk 4+ (dependency + transport decisions affect auth flow and WS server).

### ⚠️ Frontend structure mismatch vs `p-2.md` snippet
- **Missing vs `p-2.md`:**
  - `p-2.md` shows `orderbook-frontend/app/` directly under frontend root.
  - Current repo uses `orderbook-frontend/src/app/`.
- **Exact fix:**
  - Either move back to `orderbook-frontend/app/` or update the documentation to match `src/app`.
- **Owner chunk:** Chunk 4 or “docs cleanup” before demo.

### ⚠️ `docker-compose` tooling brittle on Python 3.12
- **Missing vs intended dev UX:**
  - System `docker-compose` (v1) fails without distutils shim.
- **Exact fix:** install Compose v2 plugin and migrate commands to `docker compose`.
- **Owner chunk:** Infra/DevOps cleanup (before demo).

---

## Section 3: Chunk 4 Prerequisites (stubs that MUST exist)

These must exist *before* Chunk 4 implementation work starts:

1. `orderbook-backend/internal/yellow/client.go` (interface/stub only)
2. `orderbook-backend/internal/yellow/session.go` (interface/stub only)
3. `orderbook-backend/internal/yellow/types.go` (Trade type for state updates)
4. WS message router entry for `yellow_auth` (stub) in `orderbook-backend/internal/ws/hub.go`
5. `updateYellowSession(...)` stub reachable from the server layer (location TBD, but must compile)

---

## Section 4: Updated commit message

Single commit message that matches current state:

`feat: scaffold backend/frontend, add CLOB engine + WS/API stubs`

