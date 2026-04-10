# Seed — Chunk 09 (E2E Integration + Ralph Loop)

## State after Chunks 1-8

**Backend:**
- CLOB engine ✅ (89.6% coverage)
- WebSocket + REST API ✅
- Yellow auth + UpdateState ✅

**Frontend:**
- Wallet auth + Yellow session ✅
- OrderBook UI components ✅
- Real WS wiring + pages ✅

**Contracts:**
- YellowChannel.sol ✅ (7 tests, 184K-225K gas)
- forge build ✅, forge test ✅

**What still needs:**
- Deployment to Sepolia (needs ETH + private key)
- CloseSession() wired to contract

## Chunk 09 target

### E2E Integration
1. Wire CloseSession() in Go backend to on-chain YellowChannel
2. Full trade flow: wallet → auth → order → match → state update → settle

### Ralph Loop (if available)
- Start backend + frontend
- Run full user flow:
  - POST /market → subscribe → place_order → match → updateState → close
- Auto-fix any failures
- Loop until zero failures

### Pre-Ralph checklist
- [ ] SEPOLIA_RPC_URL set in .env
- [ ] DEPLOYER_PRIVATE_KEY set in .env
- [ ] Contract address in deployments/sepolia.json
- [ ] Go backend compiles with ethclient added

## Files to create/update
- `orderbook-backend/internal/yellow/session.go` (wire CloseSession)
- `orderbook-backend/internal/eth/client.go` (ethclient wrapper)
- `contracts/scripts/Deploy.s.sol` (deployment script)
- `contracts/deployments/sepolia.json` (deployed addresses)

## Commit gate for Chunk 09
```bash
cd orderbook-backend && go build ./...
cd orderbook-frontend && npm run build
cd contracts && forge test
```

All must pass.

## Agent for Chunk 09
Superpowers (E2E wiring needs iteration) or Ralph (if available for autonomous overnight loop)
