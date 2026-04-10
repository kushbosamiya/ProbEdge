# Feature Audit — Chunks 1–3 vs `p-2.md`

Source of truth: `/home/kshl/shl/new_ubuntu_window/Recovered/new-lapto-pedning_/Projects/analysis/GSOC/Personal projects/ref-docs/p-2.md`

Format per item: ✅ Implemented / ⚠️ Partial / ❌ Missing  
Anything ❌ is a **BLOCKER** for Chunk 4.

---

## CHUNK 1 — Scaffold

✅ Repo contains the major top-level areas from `p-2.md`:
- `orderbook-frontend/`
- `orderbook-backend/`
- `contracts/`
- `yellow-client/`

⚠️ Folder structure match “exactly”
- `p-2.md` expects `orderbook-frontend/app/` (App Router at repo-root level inside frontend)
- Current state is `orderbook-frontend/src/app/` (App Router moved under `src/`)

⚠️ `p-2.md` expects doc `assets/` tree
- `assets/` is currently missing from repo root

✅ `CLAUDE.md` covers key patterns from `p-2.md`
- Yellow auth flow (ClearNode challenge → JWT → backend validation)
- Per-trade state update rule (conceptual)
- CLOB FIFO price-time priority

✅ `.env.example` contains required baseline vars
- `YELLOW_CLEARNODE_WS`
- `JWT_PUBLIC_KEY`

---

## CHUNK 2 — CLOB Engine

✅ FIFO price-time priority implemented
- Verified by tests in `orderbook-backend/internal/engine/engine_test.go`
- Coverage: `89.6%` (`go test ./internal/engine -cover`)

✅ Supports required order ops
- Limit order placement ✅
- Market order execution ✅
- Cancel ✅
- Amend ✅

✅ Trades returned after every match
- `PlaceLimitOrder` returns `[]Trade`
- `PlaceMarketOrder` returns `[]Trade`

---

## CHUNK 3 — WebSocket + REST

⚠️ WS hub supports “rooms” (per-market capable), but not wired end-to-end
- `orderbook-backend/internal/ws/hub.go` has room join/leave + membership checks
- No actual websocket server accepting client connections yet (hub exists, transport not implemented)

❌ place_order routes to engine
- Current: `Hub.HandleMessage` logs “Chunk 4 pending”
- No call into `internal/engine`

❌ cancel_order routes to engine
- Current: log only (“Chunk 4 pending”)

⚠️ yellow_auth message handler present (stub only)
- Current: `case "yellow_auth": log.Printf(...)`
- Missing: token validation + session creation + response message

❌ After every match: `session.UpdateState()` called
- No `internal/yellow` package yet
- No `updateYellowSession(ctx, marketID, ...)` in server
- Engine matching does not trigger any session update hooks

---

## BLOCKERS for Chunk 4

1. ❌ `internal/yellow/*` does not exist yet (client/session/types stubs needed)
2. ❌ `yellow_auth` must route to `yellow.ValidateJWT(...)` and create/store a session
3. ❌ Engine match results must be surfaced to WS layer + `UpdateState(...)` hook (stub OK, wiring required)

