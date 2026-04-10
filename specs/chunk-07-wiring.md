# Chunk 07 — Wire Real WS End-to-End

## 1. Files to Create/Update

- `src/app/page.tsx` — redirect to /markets
- `src/app/markets/page.tsx` — market list from GET /markets
- `src/app/market/[id]/page.tsx` — full trading page
- `src/components/TradingLayout.tsx` — assembles all components
- `src/hooks/useMarkets.ts` — fetches GET /markets via react-query
- Update `.env.example` — add NEXT_PUBLIC_API_URL=http://localhost:8080

## 2. Wiring Rules

- OrderBookDepth: receives real marketID from route param
- TradeTicker: receives real marketID from route param
- OrderForm: gated by sessionStore.status === 'connected'
- YellowAuthButton: shown in header on every page
- Market list: fetched from NEXT_PUBLIC_API_URL/markets

## 3. Page Layouts

### markets/page.tsx

- Grid of PredictionMarketCard components
- Fetches from GET /markets via useMarkets hook
- Loading: skeleton cards (3 placeholder cards)
- Empty: "No markets yet" with description
- Error: "Failed to load markets" with retry button

### market/[id]/page.tsx

- Left: OrderBookDepth (40% width)
- Center: OrderForm (20% width)
- Right: TradeTicker (40% width)
- Header: market name + expiry + YellowAuthButton
- Mobile: stacked single column

### TradingLayout.tsx

- Assembles the 3-panel layout
- Passes marketID to all child components
- Shows connection status banner if not authenticated

## 4. Environment

- Add to .env.example: `NEXT_PUBLIC_API_URL=http://localhost:8080`

## 5. Market Type Mapping

Backend returns:
```go
type Market struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
    Base  string `json:"base"`
    Quote string `json:"quote"`
}
```

Frontend expects:
```typescript
type Market = {
    id: string;
    name: string;
    description: string;
    expiry: string;
    midPrice: number;
    volume: number;
}
```

The useMarkets hook should map backend response to frontend type.

## 6. Commit Gate

```bash
cd orderbook-frontend
npx tsc --noEmit
npx vitest run
npm run build
```

All three must pass.
