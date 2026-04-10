# Chunk 08 — Solidity Nitrolite Adjudicator (YellowChannel)

Reference previous outputs in this session before proceeding.

## 1) Install Foundry (if not present)

```bash
curl -L https://foundry.paradigm.xyz | bash
source ~/.zshenv
foundryup
forge --version
```

## 2) Files to Create/Update

- `contracts/contracts/YellowChannel.sol` (replace placeholder)
- `contracts/test/YellowChannel.t.sol`
- `contracts/scripts/Deploy.s.sol`
- `contracts/lib/` (forge install dependencies)
- `contracts/remappings.txt` (updated)
- `contracts/deployments/sepolia.json` (written by deploy script)

## 3) Dependency install

From `contracts/`:

```bash
forge install erc7824/nitrolite --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit
```

Update `contracts/remappings.txt`:

```
@nitrolite/=lib/nitrolite/
@openzeppelin/=lib/openzeppelin-contracts/
```

## 4) `YellowChannel.sol` spec

Implements a basic state-channel lifecycle suitable for Chunk 9 backend integration.

### Data model

```solidity
struct ChannelState {
  uint256 channelID;
  uint256 version;
  address[] participants;
  uint256[] allocations; // zero-sum balances (denominated in wei for this scaffold)
  bytes appData;         // encoded trade data
}
```

### Required methods

- `openChannel(address[] participants, ChannelState initialState) external payable`
- `updateState(uint256 channelID, ChannelState state, bytes[] signatures) external`
- `closeChannel(uint256 channelID, ChannelState finalState, bytes[] signatures) external`
- `disputeChannel(uint256 channelID, ChannelState state, bytes[] signatures) external`

### Required events

- `ChannelOpened(uint256 channelID, address[] participants)`
- `StateUpdated(uint256 channelID, uint256 version)`
- `ChannelClosed(uint256 channelID, uint256 version)`
- `DisputeRaised(uint256 channelID, uint256 version)`

### Rules (minimal but safe)

- **EIP-712** signing for `ChannelState` updates.
- **Signature verification**: every participant must sign the exact same state digest.
- **Version monotonicity**:
  - `updateState`: `state.version == currentVersion + 1`
  - `disputeChannel`: `state.version > currentVersion` (stale states revert)
- **Zero-sum allocation check**: sum allocations must equal locked value at open (wei-denominated).
- **Reentrancy guard** on `closeChannel`.

## 5) Test spec (`YellowChannel.t.sol`)

Tests must be written first (red), then contract implemented (green).

- `testOpenChannel`
- `testUpdateState_IncrementsVersion`
- `testUpdateState_ZeroSumAllocations`
- `testCloseChannel_ReleaseFunds`
- `testDispute_RevertsOnStaleState`
- `testDispute_RevertsOnInvalidSignature`

## 6) Deploy script (`Deploy.s.sol`)

- Deploys `YellowChannel` to Sepolia
- Logs contract address
- Writes `contracts/deployments/sepolia.json` with deployed address

## 7) Commit gate

```bash
cd contracts
forge build --no-cache
forge test -vvv
```

Both must pass.

