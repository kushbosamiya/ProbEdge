# OrderbookTrade-Yellow — Agent Memory

## Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | Next.js | 16 (latest) |
| Frontend | React | 19 |
| Frontend | TypeScript | 5.x |
| Frontend | viem | 2.47.6 |
| Frontend | wagmi | 2.14.15 |
| Frontend | TanStack Query | 5.x |
| Frontend | Zustand | 5.x (no persist) |
| Frontend | Tailwind | 3.x (v4 not stable with shadcn) |
| Frontend | shadcn/ui | latest |
| Backend | Go | 1.22+ |
| Backend | coder/websocket | v1.8.14 |
| Backend | lib/pq | latest |
| Backend | go-redis | v9 |
| Backend | jwt-go | v5 |
| Protocol | Nitrolite (Go) | v1.1.1 |
| Protocol | Nitrolite (TS) | v0.5.3 |
| Chain | EVM | Sepolia |
| RPC | Ankr (dev) / Alchemy (prod) | — |

## Key Patterns

### CLOB Matching (FIFO Price-Time Priority)

- **Data Structure**: Min/Max Heap per price level
- **Priority**: Best price first, then earliest timestamp
- **Matching**: Aggressor (taker) pays price, maker receives
- **Order Types**: limit, market, cancel, amend

### Yellow Auth Flow

1. Frontend generates session keypair (ephemeral)
2. Frontend connects to Yellow ClearNode WS → auth_request
3. ClearNode returns challenge message
4. Frontend signs challenge with wallet (EIP-712)
5. ClearNode validates → returns JWT token
6. Frontend sends JWT to backend via yellow_auth
7. **Backend validates JWT locally** (NOT forwarded to ClearNode)

### State Update Rule

- **Per-trade updates**: Call Nitrolite UpdateState after each match
- **Rationale**: Real-time accuracy, simpler dispute resolution
- **Trade-off**: Higher gas on final settlement

### Anti-Patterns

- ❌ NEVER store session key in localStorage (memory only)
- ❌ NEVER submit per-trade transactions to chain (use state channels)
- ❌ NEVER use global mutable state in Go (pass context)
- ❌ NEVER use gorilla/websocket (deprecated, use coder/websocket)
- ❌ NEVER use Nitrolite Go v1.1.1 with Go <1.25 (or pin older version)

## Conventions

### Go
- **Style**: Idiomatic Go (go fmt, go vet, golint)
- **Structure**: cmd/ → internal/ → pkg/ hierarchy
- **Error handling**: Wrap errors with context, return early
- **Testing**: Table-driven tests, TDD

### TypeScript
- **Strict mode**: `strict: true` in tsconfig
- **Hooks**: Custom hooks for wallet, session, orders
- **State**: Zustand with `persist: false`
- **Components**: shadcn/ui with Tailwind

### Commit Format
- `feat: add order matching engine`
- `fix: resolve JWT validation bug`
- `refactor: restructure websocket handlers`
- `test: add order validation tests`
- `docs: update API documentation`

## Go Engine Conventions

### Go CLOB Engine Rules
- Use int64 for ALL price and quantity — never float32/float64
- Deterministic FIFO: uint64 monotonic sequence counter, never time.Now()
- Engine runs in single goroutine via channel — no mutex in core loop
- No global mutable state — engine is self-contained and testable
- Run go mod tidy AFTER first .go file that imports a dep, never before
