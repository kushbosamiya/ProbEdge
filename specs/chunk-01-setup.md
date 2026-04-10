# OrderbookTrade-Yellow — Chunk 1: Project Scaffold

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create full project scaffold with folder structure, CLAUDE.md, AGENTS.md, docker-compose, .env.example, and initialized Go/Next.js modules.

**Architecture:** Multi-repo monorepo with frontend (Next.js), backend (Go), contracts (Solidity), SDK wrapper, specs, and docs.

**Tech Stack:** Next.js 16, TypeScript, Go 1.22, viem 2, wagmi 2, Nitrolite, Docker

---

## 1. Full Folder Tree

```
orderbooktrade-yellow/
├── orderbook-frontend/           # Next.js 16 + React + TypeScript + wagmi/viem
│   ├── src/
│   │   ├── app/                   # Next.js App Router
│   │   ├── components/            # React components (shadcn)
│   │   ├── hooks/                 # Custom React hooks (useWallet, useSession)
│   │   ├── lib/                   # Utilities (nitrolite client, ws client)
│   │   └── types/                 # TypeScript type definitions
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── tailwind.config.ts
├── orderbook-backend/             # Go 1.22 CLOB engine + WebSocket server
│   ├── cmd/
│   │   └── server/
│   │       └── main.go            # Entry point
│   ├── internal/
│   │   ├── engine/                # CLOB matching engine (heap-based)
│   │   ├── market/                # Market management
│   │   ├── order/                 # Order types and validation
│   │   ├── session/               # Session management (JWT validation)
│   │   ├── ws/                    # WebSocket handlers (per-market rooms)
│   │   └── config/                # Configuration
│   ├── pkg/
│   │   └── yellow/                # Yellow Nitrolite SDK wrapper
│   ├── go.mod
│   └── go.sum
├── contracts/                     # Solidity contracts (Nitrolite-based)
│   ├── contracts/
│   │   └── YellowChannel.sol      # State channel contract
│   ├── scripts/                   # Deployment scripts
│   ├── test/                      # Forge tests
│   ├── foundry.toml
│   └── remappings.txt
├── yellow-client/                 # SDK testing / wrapper
│   ├── go.mod
│   └── test/
├── specs/                         # Chunk specs (this file lives here)
│   └── chunk-01-setup.md         # This file
├── docs/                          # Project documentation
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-04-09-orderbooktrade-brainstorm.md
│       └── plans/
├── .env.example                   # Environment variables template
├── docker-compose.yml             # Full stack orchestration
├── CLAUDE.md                      # Agent memory file
├── AGENTS.md                      # Sub-agent personas
└── README.md
```

---

## 2. CLAUDE.md Content

```markdown
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
```

---

## 3. AGENTS.md Content

```markdown
# OrderbookTrade-Yellow — Agent Personas

## Go Engineer

**Persona**: Senior Go backend developer with experience in high-frequency trading systems.

**Ownership**: 
- `orderbook-backend/` — All Go code
- `contracts/` — Deployment scripts
- `docker-compose.yml` — Backend services

**Specializations**:
- CLOB matching engine design
- WebSocket server architecture
- JWT authentication and validation
- PostgreSQL and Redis data handling
- Nitrolite state channel integration

**Commands**:
- `go test ./internal/engine/... -v` — Run engine tests
- `go build -o bin/server ./cmd/server` — Build backend
- `docker compose up --build` — Rebuild stack

---

## TypeScript Engineer

**Persona**: Full-stack TypeScript developer specializing in Web3 and real-time UIs.

**Ownership**:
- `orderbook-frontend/` — All frontend code
- `yellow-client/` — TypeScript SDK wrapper

**Specializations**:
- Next.js App Router and SSR
- wagmi/viem wallet integration
- Nitrolite TypeScript SDK
- WebSocket client implementation
- Zustand state management

**Commands**:
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint

---

## Solidity Engineer

**Persona**: Smart contract developer with experience in state channels and Layer 2.

**Ownership**:
- `contracts/` — Solidity contracts
- Deployment and test scripts

**Specializations**:
- ERC-7824 Nitrolite contracts
- Foundry testing framework
- On-chain settlement logic
- Oracle integration

**Commands**:
- `forge build` — Compile contracts
- `forge test` — Run tests
- `forge deploy --verify` — Deploy to Sepolia

---

## DevOps Engineer

**Persona**: Infrastructure and CI/CD specialist.

**Ownership**:
- `docker-compose.yml` — Full stack orchestration
- `.env.example` — Environment configuration
- CI/CD pipelines

**Specializations**:
- Docker multi-stage builds
- PostgreSQL and Redis setup
- Health checks and monitoring
- Environment variable management

**Commands**:
- `docker compose up -d` — Start stack
- `docker compose down` — Stop stack
- `docker compose ps` — Check status
```

---

## 4. Go Backend Init Commands

```bash
# Initialize Go module
cd orderbook-backend
go mod init orderbook-backend

# Core dependencies
go get github.com/erc7824/nitrolite@v1.1.1
go get github.com/coder/websocket@v1.8.14
go get github.com/gorilla/mux@v1.8.1

# Database
go get github.com/lib/pq@v1.10.9
go get github.com/redis/go-redis/v9@v9.5.1

# JWT
go get github.com/golang-jwt/jwt/v5@v5.2.0

# Configuration
go get github.com/joho/godotenv@v1.5.1

# Testing
go get github.com/stretchr/testify@v1.9.0
go get github.com/onsi/ginkgo/v2@v2.17.1

# Code generation
go install golang.org/x/tools/cmd/goimports@latest

# Verify
go mod tidy
go build ./...
```

---

## 5. Next.js Frontend Init Commands

```bash
# Create Next.js app
npx create-next-app@latest orderbook-frontend \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack \
  --yes

cd orderbook-frontend

# Web3 dependencies
npm install viem@2 wagmi@2 @tanstack/react-query@5

# State management
npm install zustand@5

# UI components (shadcn)
npx shadcn@latest init -d

# Utility
npm install clsx tailwind-merge

# WebSocket client
npm install isomorphic-ws

# Types
npm install -D @types/node @types/react @types/react-dom

# Verify
npm run build
```

---

## 6. docker-compose.yml Full Content

```yaml
version: '3.9'

services:
  backend:
    build:
      context: ./orderbook-backend
      dockerfile: Dockerfile
    container_name: orderbook-backend
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - DATABASE_URL=postgres://postgres:postgres@postgres:5432/orderbook?sslmode=disable
      - REDIS_URL=redis://redis:6379
      - JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY}
      - YELLOW_CLEARNODE_WS=${YELLOW_CLEARNODE_WS}
      - LOG_LEVEL=debug
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  frontend:
    build:
      context: ./orderbook-frontend
      dockerfile: Dockerfile
    container_name: orderbook-frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
      - NEXT_PUBLIC_RPC_URL=${SEPOLIA_RPC_URL}
      - NEXT_PUBLIC_YELLOW_WS=${YELLOW_CLEARNODE_WS}
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    container_name: orderbook-postgres
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=orderbook
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: orderbook-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

---

## 7. .env.example Full Content

```bash
# ===========================================
# OrderbookTrade-Yellow Environment Variables
# ===========================================
# Copy to .env and fill in values

# -------------------------------------------
# Backend Configuration
# -------------------------------------------
PORT=8080

# Database (PostgreSQL)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/orderbook?sslmode=disable

# Cache (Redis)
REDIS_URL=redis://localhost:6379

# JWT Public Key (PEM format, multiline with \n)
# Get this from Yellow ClearNode documentation
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"

# Yellow ClearNode WebSocket Endpoint
YELLOW_CLEARNODE_WS=wss://clearnode.yellow.org/ws

# Logging
LOG_LEVEL=debug

# -------------------------------------------
# Frontend Configuration
# -------------------------------------------
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# Sepolia RPC (choose one)
# Option 1: Ankr (free, no key required)
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia
# Option 2: Alchemy (requires key)
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Yellow ClearNode for frontend
NEXT_PUBLIC_YELLOW_WS=wss://clearnode.yellow.org/ws

# -------------------------------------------
# Smart Contracts (for deployment)
# -------------------------------------------
# Deployer private key (DO NOT COMMIT - use secrets manager)
DEPLOYER_PRIVATE_KEY=0x...

# Etherscan/Blockscout API (for verification)
ETHERSCAN_API_KEY=your_etherscan_key

# -------------------------------------------
# Optional: Monitoring
# -------------------------------------------
# SENTRY_DSN=https://...@sentry.io/...
```

---

## 8. Commit Gate

```bash
# This command MUST pass before Chunk 1 is considered complete
# Run from project root

# Verify Go backend compiles
cd orderbook-backend && go build ./... && cd ..

# Verify Next.js frontend builds
cd orderbook-frontend && npm run build && cd ..

# Verify docker-compose is valid
docker compose config --quiet

# All three must succeed
echo "✅ Chunk 1 scaffold verified"
```

---

## Task Checklist

- [ ] Create folder structure
- [ ] Write CLAUDE.md
- [ ] Write AGENTS.md
- [ ] Initialize Go module and deps
- [ ] Initialize Next.js app and deps
- [ ] Write docker-compose.yml
- [ ] Write .env.example
- [ ] Run commit gate verification
