# Structural Audit — Chunk 1 Scaffold (OrderbookTrade-Yellow)

Date: 2026-04-09

This audit reviews the Chunk 1 scaffold outputs and flags structural/config issues that can block future chunks (2–8).

Each item is reported as: **Problem → Root Cause → Fix Command/Content**.

---

## 1) Folder Structure

### Frontend tree mismatch (`app/` vs `src/`)
- **Problem:** Next.js app router was generated in `orderbook-frontend/app/` while the intended tree expects `orderbook-frontend/src/app/` and related `src/*` directories.
- **Root Cause:** `create-next-app` was run without `--src-dir`.
- **Fix Command/Content:**
  - Move app router into `src/`:
    - `cd orderbook-frontend && rm -rf src/app && mv app src/app`

### Missing Dockerfiles referenced by Compose
- **Problem:** `docker-compose.yml` references `orderbook-backend/Dockerfile` and `orderbook-frontend/Dockerfile`, but they were missing.
- **Root Cause:** Compose file was scaffolded without service Dockerfiles.
- **Fix Command/Content:**
  - Add `orderbook-backend/Dockerfile` (Go 1.25 multi-stage build)
  - Add `orderbook-frontend/Dockerfile` (Node 20 multi-stage build)

### Contracts scaffold too thin for Foundry-based chunks
- **Problem:** `contracts/` lacked baseline Foundry config and placeholder contract file.
- **Root Cause:** Only directories were created.
- **Fix Command/Content:**
  - Add `contracts/foundry.toml` with:
    - `[profile.default]` config (src/out/libs/test/script/solc_version)
  - Add `contracts/remappings.txt` (empty placeholder)
  - Add `contracts/contracts/YellowChannel.sol` placeholder contract
  - Add `contracts/test/.gitkeep` and `contracts/scripts/.gitkeep`

---

## 2) docker-compose.yml — Health/Readiness

### Backend healthcheck fails before backend exists
- **Problem:** Backend healthcheck attempted `curl http://localhost:8080/health` even before a real service is guaranteed.
- **Root Cause:** Healthcheck assumed a future HTTP server + `curl` presence in image.
- **Fix Command/Content:**
  - Remove backend `healthcheck:` block entirely.
  - Keep `depends_on` health ordering on Postgres/Redis.
  - Change backend restart policy to:
    - `restart: on-failure`

### Frontend healthcheck uses `curl` (not guaranteed in image)
- **Problem:** Frontend healthcheck runs `curl http://localhost:3000`, but the frontend Dockerfile uses `node:20-alpine` and does not install `curl`.
- **Root Cause:** Healthcheck assumes `curl` exists inside the container.
- **Fix Command/Content:**
  - Option A: install `curl` in `orderbook-frontend/Dockerfile` runner stage.
  - Option B: remove frontend healthcheck until a lightweight probe is chosen.

### Postgres healthcheck command form
- **Problem:** Postgres healthcheck used `CMD-SHELL` string.
- **Root Cause:** Less explicit than exec-form; also harder to reason about.
- **Fix Command/Content:**
  - Use exec-form:
    - `test: ["CMD", "pg_isready", "-U", "${POSTGRES_USER}"]`

### Redis readiness
- **Problem:** None (already correct).
- **Root Cause:** —
- **Fix Command/Content:**
  - Keep:
    - `test: ["CMD", "redis-cli", "ping"]`

---

## 3) .env.example — Yellow Auth + Session Vars

### Missing JWT validation metadata
- **Problem:** Only `JWT_PUBLIC_KEY` existed, but local JWT validation typically also constrains issuer/audience and clock skew.
- **Root Cause:** Template focused on key only.
- **Fix Command/Content:**
  - Add:
    - `JWT_ISSUER=yellow-clearnode`
    - `JWT_AUDIENCE=orderbooktrade`
    - `JWT_CLOCK_SKEW_SECONDS=30`

### Missing session/challenge TTL knobs
- **Problem:** Ephemeral session keys and auth challenges need TTL knobs for predictable behavior.
- **Root Cause:** Template didn’t include lifecycle settings.
- **Fix Command/Content:**
  - Add:
    - `SESSION_KEY_TTL_SECONDS=3600`
    - `AUTH_CHALLENGE_TTL_SECONDS=300`
    - `JWT_TTL_SECONDS=86400`

### Missing Yellow app identity
- **Problem:** No explicit app name to tag/identify the client (useful for logs / ClearNode policies).
- **Root Cause:** Not included in template.
- **Fix Command/Content:**
  - Add:
    - `YELLOW_APP_NAME=orderbooktrade-yellow`

---

## 4) Go Module Path + Dependency Pinning

### Module path mismatch (`/backend` suffix)
- **Problem:** Module path included `/backend`, which would leak into all import paths.
- **Root Cause:** `go mod init` used a suffixed module name.
- **Fix Command/Content:**
  - `cd orderbook-backend && /usr/local/go/bin/go mod edit -module github.com/kushbosamiya/orderbooktrade-yellow`

### Deps pruned by tidy on empty module
- **Problem:** `go mod tidy` can drop requirements if no packages import them.
- **Root Cause:** No importing package existed initially.
- **Fix Command/Content:**
  - Add `orderbook-backend/internal/deps/deps.go` with blank imports to pin modules.
  - Run:
    - `/usr/local/go/bin/go mod tidy`

---

## 5) Next.js/WebSocket Client Readiness

### Tailwind v4 vs required Tailwind v3
- **Problem:** Frontend scaffold installed Tailwind v4, but stack conventions require v3 (shadcn compatibility).
- **Root Cause:** `create-next-app` defaults to Tailwind v4.
- **Fix Command/Content:**
  - `npm uninstall tailwindcss @tailwindcss/postcss`
  - `npm install --save-exact tailwindcss@3.4.17 autoprefixer@10.4.20 postcss@8.5.3`
  - Replace `postcss.config.mjs` with Tailwind v3 plugin config
  - Add `tailwind.config.ts`
  - Update `src/app/globals.css` to `@tailwind base/components/utilities`

### Pin core Web3 deps to exact versions
- **Problem:** Caret ranges can drift over time.
- **Root Cause:** Default npm semver ranges.
- **Fix Command/Content:**
  - `npm install --save-exact viem@2.47.6 wagmi@2.14.15 zustand@5.0.3 @erc7824/nitrolite@0.5.3 @tanstack/react-query@5.74.4`

---

## 6) CLAUDE.md Conventions Gaps (Chunk 2)

### CLOB engine numeric + determinism rules missing
- **Problem:** Core engine constraints (no floats, deterministic FIFO) weren’t explicit.
- **Root Cause:** Conventions were high-level.
- **Fix Command/Content:**
  - Append “Go CLOB Engine Rules (Chunk 2+)” section (int64-only, monotonic seq, deterministic behavior).
