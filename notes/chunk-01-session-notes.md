# OrderbookTrade-Yellow — Chunk 1 Session Notes

**Date**: 2026-04-09

---

## ❓ Open Questions (Not Yet Resolved)

1. **Go version for Nitrolite** — Nitrolite Go v1.1.1 requires Go 1.25. Current spec says Go 1.22. Need to either upgrade Go or pin older Nitrolite version. Not resolved yet.

2. **Tailwind version** — v4 + shadcn not stable. Currently spec says use v3. Could be resolved by waiting for official shadcn v4 support.

3. **JWT public key acquisition** — Where does the backend get the Yellow ClearNode public key? Need documentation from Yellow or embed placeholder.

---

## ⚠️ Decisions That Could Change Later

1. **Per-trade vs batch state updates** — Chose per-trade for real-time accuracy. If gas costs become prohibitive, can switch to batching.

2. **Admin wallet for market resolution** — MVP choice. Could upgrade to Chainlink oracle or community vote later.

3. **Per-market WebSocket** — Better isolation now, but adds complexity. Single hub could work for small market count.

4. **Zustand for frontend state** — If persist accidentally enabled, session keys leak. Must enforce `persist: false`.

---

## 📋 External Dependencies / Signups Needed Before Coding

1. **Sepolia RPC** — Ankr public endpoint works for dev, but for prod need Alchemy or Infura free tier key.

2. **Yellow ClearNode access** — Need WebSocket endpoint and JWT public key from Yellow Network.

3. **NPM packages** — All available, no special access needed.

4. **Docker** — Local development needs Docker Desktop.

---

## 🚧 Blockers for GSD Autonomous to Run Scaffold

1. **Go version incompatibility** — Nitrolite Go v1.1.1 requires Go 1.25. Need Go upgrade or older Nitrolite version.

2. **Missing JWT public key** — Cannot fully implement backend session validation without ClearNode public key.

3. **Yellow ClearNode endpoint** — Need actual WebSocket URL for ClearNode (currently placeholder).

---

## ✅ Completed

- dependency-audit.md — Resolved dependency versions
- brainstorm-decisions.md — Architecture decisions made
- specs/chunk-01-setup.md — Full scaffold specification
- Notes captured
