# OrderbookTrade-Yellow Dependency Audit

**Date**: 2026-04-09  
**Context**: Stack — Frontend (Next.js 16, React, TypeScript, viem, wagmi), Backend (Go 1.22, WebSocket, CLOB), Protocol (Yellow Nitrolite), Chain (EVM, Sepolia)

---

## 1. @erc7824/nitrolite — Go SDK and TypeScript SDK

| Language | Package | Latest Stable | Go/Node Version |
|----------|---------|---------------|-----------------|
| Go | `github.com/erc7824/nitrolite` | **v1.1.1** | Go 1.25.0 |
| TypeScript | `@erc7824/nitrolite` | **v0.5.3** | Node 18+ |

**Finding**: **BOTH Go and TypeScript SDKs exist.** The Go SDK is the primary implementation (57.2% of repo), TypeScript SDK is for frontend integration.

**Breaking Changes**: v0.5.x → v1.x may have breaking changes. Pin to v0.5.x for stability until v1.0 is stable.

---

## 2. viem + wagmi — Latest Stable Versions

| Package | Latest Stable | Notes |
|---------|---------------|-------|
| `viem` | **2.47.6** | Active development, frequent patches |
| `wagmi` | **2.14.15** (v2) or **3.5.0** (v3) | wagmi v3 is latest but v2 is more widely tested with Next.js 16 |

**Breaking Changes**: 
- wagmi v1 → v2: Major API redesign to use viem + TanStack Query
- wagmi v2 → v3: Less breaking, mostly additive
- **Recommendation**: Use wagmi v2.14.x with viem 2.x for maximum stability with Next.js 16 App Router

**Conflict Workaround**: If using RainbowKit with Next.js 16, ensure wagmi/viem versions are compatible. RainbowKit latest versions support wagmi v2.

---

## 3. Go WebSocket Libraries — gorilla vs nhooyr (now coder)

| Library | Status | Stars | Maintenance |
|---------|--------|-------|-------------|
| `github.com/gorilla/websocket` | **Abandoned** | 5.4k | No updates since 2023 |
| `github.com/nhooyr/websocket` | **Migrated** | — | Merged into coder/websocket |
| `github.com/coder/websocket` | **Active** | 5.1k | Active development, Go 1.23+ |

**Recommendation**: Use **`github.com/coder/websocket` v1.8.14+** for Go 1.22. It:
- Is actively maintained (Coder company backing)
- Has better performance than Gorilla
- Supports HTTP/2 and permessage-deflate
-ISC licensed (permissive)

**Import path change**: `nhooyr.io/websocket` → `github.com/coder/websocket`

---

## 4. Next.js 16 App Router + wagmi v2 Compatibility

**Status**: Compatible.

Wagmi v2 was designed for Next.js App Router (SSR support, cookie-based storage). Next.js 16 (when released) should maintain backward compatibility.

**Required packages**:
```bash
npm install wagmi@2 viem@2 @tanstack/react-query
```

**Configuration**: Use `WagmiProvider` with `config` prop. For SSR, use `cookieToInitialState` from wagmi.

---

## 5. Sepolia RPC — Public vs Private

| Provider | Type | URL | Requires Key |
|----------|------|-----|--------------|
| Public (Cloudflare) | HTTP | `https://sepolia.infura.io/v3/YOUR_PROJECT_ID` | Yes (free tier) |
| Public (Ankr) | HTTP | `https://rpc.ankr.com/eth_sepolia` | No |
| Alchemy | HTTP | `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY` | Yes (free tier) |
| Infura | HTTP/WSS | `https://sepolia.infura.io/v3/YOUR_PROJECT_ID` | Yes (free tier) |

**Recommendation**: 
- **Dev**: Use Ankr public endpoint for quick prototyping (`https://rpc.ankr.com/eth_sepolia`)
- **Prod/Staging**: Get free Alchemy or Infura key (rate limits, reliability)

---

## 6. ShadCN + Tailwind v4 + Next.js 16

**Status**: Works with caveats.

**Known Issues**:
- Tailwind v4 removed `tailwind.config.js` in favor of CSS-based config
- ShadCN expects Tailwind v3-style configuration
- Some component style conflicts reported

**Workaround**:
1. Use Next.js 16 with Tailwind v4's new CSS-only config
2. Install shadcn after Tailwind v4 setup
3. If conflicts occur, use `@shadcn/ui` components directly with custom CSS variables

**Alternative**: Stay on Tailwind v3 until shadcn officially supports v4 (as of Apr 2026, not yet stable).

---

## Summary — Exact Versions to Use

### Frontend (Next.js 16 / TypeScript)

```bash
npx create-next-app@latest orderbook-frontend --typescript --tailwind --eslint
npm install viem@2 wagmi@2 @tanstack/react-query @erc7824/nitrolite
# Optional: @radix-ui/react-* (shadcn dependencies)
```

### Backend (Go 1.22)

```bash
go mod init orderbook-backend
go get github.com/erc7824/nitrolite@v1.1.1
go get github.com/coder/websocket@v1.8.14
go get github.com/lib/pq  # PostgreSQL client
go get github.com/redis/go-redis/v9  # Redis client
go get github.com/golang-jwt/jwt/v5  # JWT validation
go get github.com/jackc/pgx/v5  # Alternative PostgreSQL (pure Go)
```

### docker-compose

```yaml
services:
  backend:
    build: ./orderbook-backend
    ports:
      - "8080:8080"
  frontend:
    build: ./orderbook-frontend
    ports:
      - "3000:3000"
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## Missing / Flagged Items

1. **Go Nitrolite v1.1.1 requires Go 1.25.0** — Current backend spec says Go 1.22. Either:
   - Upgrade to Go 1.25 when released, or
   - Use older Nitrolite version compatible with Go 1.22

2. **Tailwind v4 + shadcn** — Not yet stable together. Recommend Tailwind v3 for stability.

3. **No local Nitrolite testing** — Need testnet deployment or local Yellow Network node for integration testing.
