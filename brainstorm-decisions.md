# OrderbookTrade-Yellow — Architecture Brainstorm Decisions

**Date**: 2026-04-09  
**Context**: CLOB Matching Engine + Yellow Nitrolite State Channels

---

## 1. Yellow ClearNode Auth

**Decision**: Backend validates JWT locally  
**Rationale**: More secure — backend never forwards JWT to ClearNode, requires ClearNode public key embedded in backend config.

---

## 2. CLOB Engine Data Structure

**Decision**: Min/Max Heap  
**Rationale**: O(log N) insert/peek, O(1) removal by handle. Best for high-frequency FIFO price-time priority matching.

---

## 3. State Channel Update Strategy

**Decision**: Per-trade updates  
**Rationale**: Yellow SDK supports per-trade UpdateState calls. Trade-off: higher gas on settlement, but ensures real-time state accuracy and simplifies dispute resolution.

---

## 4. Market Resolution

**Decision**: Admin wallet  
**Rationale**: Simple to implement, works for MVP. Can upgrade to oracle/vote later if needed.

---

## 5. Frontend State

**Decision**: Zustand with memory-only persistence  
**Rationale**: Better devtools, faster. Must explicitly disable persist to localStorage (`persist: false`).

---

## 6. WebSocket Architecture

**Decision**: Per-market WS  
**Rationale**: Better isolation and scaling. Each market has its own connection pool, failure in one market doesn't affect others.

---

## Flagged Items

| Item | Status |
|------|--------|
| Nitrolite Go version (requires Go 1.25) | ⚠️ May need Go upgrade |
| Tailwind v4 + shadcn | ⚠️ Not stable together |
| Sepolia RPC | 📋 Need API key (Ankr free for dev) |
