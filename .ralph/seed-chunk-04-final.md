# Seed — Chunk 4 Final: Yellow SDK Integration

Date: 2026-04-09

Source of truth: `p-2.md` (Trading Flow + Yellow SDK Integration sections)

---

## Verified State After Chunks 1–3

- Backend module path is canonical: `github.com/kushbosamiya/orderbooktrade-yellow` (no `/backend` suffix) and `go.sum` is non-empty.
- CLOB engine exists, supports limit/market/cancel/amend, returns trades on match, and coverage is ≥80% (currently 89.6%).
- WS hub exists with basic “rooms” structure and a message router (currently stubbed handlers).
- Frontend builds and critical deps are pinned exactly (viem 2.47.6, wagmi 2.14.15, zustand 5.0.3, nitrolite 0.5.3, tailwind 3.4.17).
- Compose file exists and validates with the current environment workaround (`PYTHONPATH=/tmp/distutils_shim docker-compose config --quiet`).

---

## What Was Missing + Fixed

Created Chunk 4 prerequisite stubs (no business logic):

- `orderbook-backend/internal/yellow/client.go` (`ValidateJWT` stub)
- `orderbook-backend/internal/yellow/session.go` (`UpdateState`, `CloseSession` stubs)
- `orderbook-backend/internal/yellow/types.go` (`Trade` type)
- `orderbook-backend/internal/ws/hub.go` includes `case "yellow_auth":` stub log

Gate passed:
- `cd orderbook-backend && /usr/local/go/bin/go build ./...`

---

## Chunk 4 Target: Yellow SDK Integration

Files to implement:
- `orderbook-backend/internal/yellow/client.go` (ValidateJWT + ClearNode connectivity as needed)
- `orderbook-backend/internal/yellow/session.go` (UpdateState + CloseSession using Nitrolite Go SDK)
- `orderbook-backend/internal/ws/hub.go` (wire `yellow_auth` to `ValidateJWT` + create/store session + send `yellow_auth_success`)
- `orderbook-backend/cmd/server/main.go` (wire “after match” hook to `session.UpdateState(...)`)

---

## The Exact Flow to Implement (from p-2.md)

Step 1: FE sends `yellow_auth { jwt_token, session_key }` over WS  
Step 2: BE hub routes to `yellow.ValidateJWT(token, sessionKey)`  
Step 3: If valid → `yellow.CreateSession(address, jwt)` → store in hub  
Step 4: BE sends `yellow_auth_success` back to FE  
Step 5: On every engine match → `session.UpdateState(ctx, marketID, trades)`  
Step 6: On session close → `session.CloseSession(ctx)` → on-chain tx

---

## Yellow SDK Key Question for Chunk 4

Does Nitrolite Go SDK expose JWT validation directly?

Observation (nitrolite@v1.1.1):
- `pkg/rpc/client.go` is an RPC client for Node V1 API methods; it does not appear to provide a JWT validation helper.

Implication:
- Backend JWT validation likely needs to be implemented using the ClearNode-provided public key + issuer/audience checks (and/or an RPC call if ClearNode exposes a validation endpoint).

---

## Commit Gate for Chunk 4

- `go test ./internal/yellow/... -v` passes
- `yellow_auth` flow logged end-to-end in server output

---

## Agent for Chunk 4

OpenCode (Minimax M2) — interactive mode  
NOT autonomous (Yellow SDK integration likely needs real-time debugging)

