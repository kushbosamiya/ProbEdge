# Seed — Chunk 08 (Solidity Nitrolite Adjudicator)

## State after Chunks 1-7

**Backend:**
- CLOB engine ✅ (89.6% coverage)
- WebSocket + REST API ✅
- Yellow auth + UpdateState ✅

**Frontend:**
- Wallet auth + Yellow session ✅
- OrderBook UI components ✅
- Real WS wiring + pages ✅

**What still needs real backend:**
- Markets list (GET /markets returns empty until POST /market)
- OrderBook snapshots (engine has no orders yet)
- Trade ticker (no trades until users place orders)

## Chunk 08 target

Implement Solidity Nitrolite adjudicator for state channel settlement.

### Files
- `contracts/contracts/YellowChannel.sol` (replace placeholder)
- `contracts/test/YellowChannel.t.sol` (Foundry test)
- `contracts/scripts/Deploy.s.sol` (deployment script)

### Requirements
1. Inherit from Nitrolite adjudicator (if available)
2. Handle on-chain dispute resolution
3. Implement Challenge/Response pattern
4. Support off-chain state updates

### Key question
Does Nitrolite provide base adjudicator to inherit?
- Check: yellow-client/ for existing contract examples
- Fallback: implement custom adjudicator following ERC-7824

## Commit gate for Chunk 08
```bash
cd contracts
forge test
forge build
```

Both must pass.

## Agent for Chunk 08
Superpowers (Solidity needs TDD — forge test red→green)
