# OrderbookTrade-Yellow — Chunk 6: OrderBook UI Components

Reference previous outputs in this session before proceeding.

Read references:
- `CLAUDE.md`
- `.ralph/seed-chunk-06.md`
- `p-2.md` (orderbook UI expectations implied by “CLOB Full orderbook (limit/market)” + trading flow)
- `orderbook-frontend/package.json` (Tailwind v3, Zustand, viem/wagmi, React Query present)

Goal: Implement core trading UI components + WS-driven hooks (snapshot/trades/submit) with a unit-testable design.

---

## 1) Files to Create

- `orderbook-frontend/src/components/OrderBookDepth.tsx`
- `orderbook-frontend/src/components/TradeTicker.tsx`
- `orderbook-frontend/src/components/OrderForm.tsx`
- `orderbook-frontend/src/components/PredictionMarketCard.tsx`
- `orderbook-frontend/src/hooks/useOrderBookWS.ts`
- `orderbook-frontend/src/hooks/useTradeStream.ts`
- `orderbook-frontend/src/hooks/useOrderSubmit.ts`
- `orderbook-frontend/src/types/orderbook.ts`

---

## 2) Component Specs

### `OrderBookDepth.tsx`
- Bids table (green): price | qty | cumulative total
- Asks table (red): price | qty | cumulative total
- Mid-price + spread display between tables
- Props: `{ marketID: string }`
- Data source: `useOrderBookWS(marketID)`
- Monospace font for all numbers
- Dark mode default (Tailwind)

### `TradeTicker.tsx`
- Recent trades list: price | qty | side | timestamp
- Buy = green, Sell = red
- Last 50 trades (circular buffer in hook)
- Props: `{ marketID: string }`
- Data source: `useTradeStream(marketID)`

### `OrderForm.tsx`
- Tabs: Limit | Market
- Inputs: price (limit only), quantity, side (Buy/Sell)
- Submit → `useOrderSubmit().submitOrder()`
- Loading state during submission
- `order_ack` feedback (success/error inline)
- Props: `{ marketID: string }`
- Gated by `sessionStore.status === 'connected'`

### `PredictionMarketCard.tsx`
- Market name, description, expiry date
- Current mid-price + 24h volume
- Quick Buy/Sell CTA
- Props: `{ market: Market }`

---

## 3) Hook Specs

### `useOrderBookWS(marketID: string)`
- Subscribes to `orderbook_snapshot` WS events (via `useBackendWS`)
- Filters by `marketID`
- Returns: `{ bids: Level[], asks: Level[], spread: number | null }`
- Level: `{ price: number, qty: number, total: number }`
- Computes cumulative totals on each update

### `useTradeStream(marketID: string)`
- Listens to `trade_executed` WS events (via `useBackendWS`)
- Filters by `marketID`
- Circular buffer, last 50 trades (newest first)
- Returns: `Trade[]`

### `useOrderSubmit()`
- Sends `place_order` via `useBackendWS.send()`
- Message: `{ type: "place_order", data: order }`
- Awaits `order_ack` with a 5s timeout
- Returns: `{ submitOrder, loading, error, ack }`

---

## 4) Types (`src/types/orderbook.ts`)

- `Level`: `{ price: number, qty: number, total: number }`
- `Trade`: `{ id: string, price: number, qty: number, side: "buy" | "sell", timestamp: number, marketID: string }`
- `Market`: `{ id: string, name: string, description: string, expiry: string, midPrice: number, volume: number }`
- `Order`: `{ marketID: string, side: "buy" | "sell", type: "limit" | "market", price?: number, qty: number }`

---

## 5) Commit Gate

Run from `orderbook-frontend/`:

```bash
npx tsc --noEmit
npx vitest run
```

Both must pass with zero errors.

