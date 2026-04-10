# Chunk 6 Seed: OrderBook UI Components

**Planted**: 2026-04-09  
**Trigger**: After Chunk 5 complete

---

## State After Chunk 5

1. **Wallet connection**: useWallet hook ✅ (wagmi + MetaMask)
2. **Yellow auth**: useYellowSession hook ✅ (WS flow, mock JWT)
3. **Backend WS**: useBackendWS hook ✅ (auto-reconnect)
4. **State store**: sessionStore ✅ (persist:false, memory-only)
5. **UI**: YellowAuthButton component ✅
6. **TypeScript**: tsc passes ✅

---

## What Chunk 6 Builds On

| From Chunk 5 | Chunk 6 Usage |
|--------------|---------------|
| useBackendWS.send() | Submit place_order, cancel_order |
| useBackendWS.lastMessage | Receive orderbook snapshots |
| useBackendWS.connected | Gate trading UI |
| sessionStore.status | Show connection state |

---

## Chunk 6 Target Files

```
orderbook-frontend/src/
├── components/
│   ├── OrderBookDepth.tsx    # Bids/Asks table
│   ├── TradeTicker.tsx       # Recent trades ticker
│   ├── OrderForm.tsx         # Limit/Market order input
│   └── RecentTrades.tsx      # Trade history
├── hooks/
│   ├── useOrderBookWS.ts     # Subscribe to market orderbook
│   ├── useTradeStream.ts    # Subscribe to trades
│   └── useOrderSubmit.ts     # Submit orders via WS
```

---

## Commit Gate for Chunk 6

```bash
cd orderbook-frontend
npx tsc --noEmit
npm run build
```

Both must pass with zero errors.

---

## Agent for Chunk 6

OpenCode + Minimax M2 (interactive)
- UI components — simpler than backend, less strict TDD needed
- Can use Vitest for hook testing if time permits

---

## Design Notes

- Use Tailwind CSS (dark mode default)
- OrderBookDepth: show top 10 bids/asks with depth bars
- TradeTicker: scrolling list of last 20 trades
- OrderForm: price, quantity, side (buy/sell), order type (limit/market)
- Real-time updates from WS, not polling