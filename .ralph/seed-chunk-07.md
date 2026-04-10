# Seed — Chunk 07 (Wire Real WS Data End-to-End)

## State after Chunks 1–6
- Backend: Go CLOB engine + WS API + Yellow auth wired (Chunk 4 complete).
- Frontend: wallet + Yellow auth flow (Chunk 5) and OrderBook UI components + hooks (Chunk 6).
- Current gap: Chunk 6 hooks/components are tested with mocked WS messages; end-to-end WS data is not yet flowing into the UI.

## Chunk 07 target
- Wire `orderbook-frontend` pages to real backend WS data:
  - `OrderBookDepth` consumes real `orderbook_snapshot` events.
  - `TradeTicker` consumes real `trade_executed` events.
  - `OrderForm` submits real `place_order` and renders real `order_ack`.
- Pull a real market list from `GET /markets` and route into a dedicated market trading page.

## Target files (frontend)
- `orderbook-frontend/src/app/market/[id]/page.tsx` (trading page)
- `orderbook-frontend/src/app/markets/page.tsx` (market list)
- `orderbook-frontend/src/components/TradingLayout.tsx`
- Update `orderbook-frontend/src/app/page.tsx` (landing → markets list)

## Commit gate for Chunk 07
```bash
cd orderbook-frontend
npx tsc --noEmit
npx vitest run
```

## Agent recommendation
- Superpowers (wiring + protocol contracts benefit from TDD / iteration).

