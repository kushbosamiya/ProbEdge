# Chunk 2 Seed: OrderbookTrade-Yellow CLOB Engine

**Planted**: 2026-04-09  
**Trigger**: After Chunk 1 scaffold is complete and verified

---

## What Was Built (State Summary)

1. **Dependency audit** — Resolved exact versions for viem 2.47.6, wagmi 2, Nitrolite Go/TS, coder/websocket
2. **Architecture decisions** — Backend validates JWT, heap-based CLOB, per-trade state updates, admin resolution, Zustand (no persist), per-market WS
3. **Scaffold spec** — Full folder tree, CLAUDE.md, AGENTS.md, docker-compose, .env.example
4. **Go module initialized** — All deps pinned
5. **Next.js app initialized** — All deps pinned

---

## Key Decisions Made (from brainstorm-decisions.md)

| Decision | Value |
|----------|-------|
| JWT validation | Backend validates locally (not forwarded) |
| CLOB data structure | Min/Max heap (O(log N) insert/peek) |
| State updates | Per-trade (real-time accuracy) |
| Market resolution | Admin wallet (MVP) |
| Frontend state | Zustand with `persist: false` |
| WebSocket | Per-market rooms |

---

## What Chunk 2 Needs to Implement

### Go CLOB Matching Engine

**File**: `orderbook-backend/internal/engine/engine.go`

**Features**:
- FIFO price-time priority matching
- Limit order placement (bid/ask)
- Market orders (execute at best price)
- Order cancellation
- Order amendment
- Trade execution with fill records

**TDD Approach**:
1. Write failing test for order matching
2. Run test → verify failure
3. Implement minimal code
4. Run test → verify pass
5. Commit

**Agent**: Superpowers with spec-driven-development

---

## Files to Read Before Starting

1. `orderbook-backend/internal/engine/engine.go` (will be created)
2. `orderbook-backend/internal/order/order.go` (will be created)
3. `specs/chunk-01-setup.md` (scaffold spec)
4. `brainstorm-decisions.md` (architecture decisions)
5. `CLAUDE.md` (Go conventions)

---

## Commit Gate for Chunk 2

```bash
go test ./internal/engine/... -v
```

**Expected**: All engine tests pass

---

## Notes

- ⚠️ Nitrolite Go requires Go 1.25 — may need to use older Nitrolite version or upgrade Go
- ⚠️ JWT public key needed for full session validation — placeholder works for now
- 📋 Yellow ClearNode WS endpoint is placeholder — will need real URL
