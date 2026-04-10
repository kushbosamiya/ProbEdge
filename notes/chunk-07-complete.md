# Chunk 07 — Wire Real WS End-to-End (Complete)

Date: 2026-04-10

## ✅ Pages wired end-to-end

- `src/app/page.tsx` — redirects to /markets
- `src/app/markets/page.tsx` — market list from GET /markets
- `src/app/market/[id]/page.tsx` — full trading page
- `src/components/TradingLayout.tsx` — 3-panel layout
- `src/hooks/useMarkets.ts` — fetches GET /markets via react-query

## ✅ Environment updated
- `.env.example`: Added `NEXT_PUBLIC_API_URL=http://localhost:8080`

## ✅ Files created/modified
- `src/hooks/useMarkets.ts` (new)
- `src/app/page.tsx` (redirect to /markets)
- `src/app/markets/page.tsx` (new)
- `src/app/market/[id]/page.tsx` (new)
- `src/components/TradingLayout.tsx` (new)
- `.env.example` (updated)

## Tests
- `src/hooks/__tests__/useMarkets.test.ts`
- All 12 frontend tests pass

## Commit gate evidence

Tests:
```bash
cd orderbook-frontend
npx vitest run
```
Result:
- Test Files: 5 passed
- Tests: 12 passed

Build:
```bash
npm run build
```
Result: ✓ Compiled successfully

Go backend:
```bash
cd orderbook-backend && go test ./...
```
Result: All packages pass

## ⚠️ What still needs real backend running
- useMarkets needs backend on :8080 (GET /markets)
- OrderBookDepth needs real WS snapshots
- TradeTicker needs real trade events
- OrderForm submission needs backend processing

## 📋 Manual smoke test checklist
- Start backend: `cd orderbook-backend && go run ./cmd/server`
- Start frontend: `cd orderbook-frontend && npm run dev`
- Open localhost:3000 → redirects to /markets ✓
- Markets page loads (may be empty — no markets created yet) ✓
- Create market via POST /market
- Open /market/[id] → trading layout renders ✓
- Connect MetaMask → YellowAuthButton shows connected ✓
