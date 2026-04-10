# OrderbookTrade-Yellow — Chunk 5: Frontend Wallet + Yellow Auth

Reference previous outputs in this session before proceeding.

**Goal (Chunk 5):** Implement and test the frontend wallet connection + Yellow ClearNode auth flow, and then authenticate with the backend WS using `yellow_auth { jwt_token, session_key }` (per `p-2.md` Section 4).

**Repo context (verified):**
- Frontend: Next.js `16.2.3`, React `19.2.4`, TypeScript `5.x`
- Web3: `viem@2.47.6`, `wagmi@2.14.15`
- Yellow TS SDK: `@erc7824/nitrolite@0.5.3`
- State: `zustand@5.0.3` (**persist: false**, memory-only)
- Frontend App Router path: `orderbook-frontend/src/app/`

---

## 1) Files to Create

Core implementation:
- `orderbook-frontend/src/hooks/useWallet.ts`
- `orderbook-frontend/src/hooks/useYellowSession.ts`
- `orderbook-frontend/src/hooks/useBackendWS.ts`
- `orderbook-frontend/src/store/sessionStore.ts` (Zustand, `persist:false`)
- `orderbook-frontend/src/components/YellowAuthButton.tsx`
- `orderbook-frontend/src/lib/yellow.ts` (SDK helpers)
- `orderbook-frontend/src/types/session.ts`

Tests (Vitest):
- `orderbook-frontend/src/hooks/__tests__/useWallet.test.ts`
- `orderbook-frontend/src/hooks/__tests__/useYellowSession.test.ts`
- `orderbook-frontend/src/store/__tests__/sessionStore.test.ts`

Test harness/config (required for unit tests):
- `orderbook-frontend/vitest.config.ts`
- `orderbook-frontend/src/test/setup.ts`

---

## 2) Exact Flow (from `p-2.md` Section 4)

### Step 1: Wallet connection (`useWallet`)
Use wagmi:
- `useAccount()` for `address`, `isConnected`
- `useConnect()` with MetaMask connector
- `useDisconnect()`

Returns:
```ts
{
  address: `0x${string}` | undefined
  isConnected: boolean
  connect: () => Promise<void> | void
  disconnect: () => void
}
```

Behavior:
- On wallet disconnect: clear Yellow session state (`sessionStore.clear()`).

### Step 2: Yellow session auth (`useYellowSession`)
Orchestrates the ClearNode flow:

2a. Generate ephemeral session keypair:
- Use `viem/accounts` to generate a private key and derive a public key/address as needed for ClearNode `session_key`.
- Store session key in Zustand (memory only).

2b. Connect to Yellow ClearNode WS:
- WS URL from `NEXT_PUBLIC_YELLOW_WS` (fallback to `YELLOW_CLEARNODE_WS` only if explicitly set on frontend; prefer NEXT_PUBLIC).

2c. Send `auth_request`:
Payload (shape depends on ClearNode; match `p-2.md` intent):
- `address`
- `session_key`
- `allowances` (MVP: empty array or minimal default)
- `expires_at` (unix seconds, now + TTL)

2d. Receive `auth_challenge { challenge_message }`

2e. EIP-712 sign with MetaMask (NOT `eth_sign`):
- Use `@erc7824/nitrolite` helpers (preferred) or hand-built typed data.

2f. Send `auth_verify` and receive `jwt_token { session_key, jwt_token, expires_at }`

2g. Store `jwt_token` in Zustand (never localStorage/sessionStorage):
- `sessionStore.setJWT(jwtToken)`
- Update status to `connected`

2h. Connect backend WS and send `yellow_auth`:
- Backend WS URL from `NEXT_PUBLIC_WS_URL` (default: `ws://localhost:8080/ws`)
- Send: `{ type: "yellow_auth", payload: { jwt_token, session_key } }`
- Expect: `yellow_auth_success` (store `session_id` if returned)

### Step 3: UI (`YellowAuthButton`)
States (derived from hooks/store):
- disconnected: “Connect Wallet”
- wallet connected, yellow disconnected: “Connect Yellow”
- connecting: disabled button + spinner (“Connecting…”)
- connected: green indicator + “Connected”

---

## 3) Security Rules (Non-Negotiable)

- **Session keys in memory only** (Zustand store, no persist).
- **JWT never written to** `localStorage` / `sessionStorage`.
- EIP-712 typed-data signing only (no `personal_sign`, no `eth_sign`).
- Session cleared on wallet disconnect.
- Backend WS messages must use in-memory JWT only (read from store at send-time).

---

## 4) Test Requirements (Vitest; unit tests only)

### Tooling
Add dev deps (exact versions may be pinned during implementation):
- `vitest`
- `@vitest/coverage-v8`
- `jsdom`
- `@testing-library/react`
- `@testing-library/jest-dom`

Add scripts (implementation step):
- `"test": "vitest"`
- `"test:run": "vitest run"`
- `"test:coverage": "vitest run --coverage"`

### Hook tests (mocking approach)

`useWallet` tests mock wagmi hooks (no real wallet needed):
- `TestWallet_ConnectsMetaMask`
- `TestWallet_DisconnectedState`

`useYellowSession` tests mock WebSocket traffic:
- `TestYellowSession_GeneratesSessionKeypair` (assert 64-char hex private key or a stable derived form)
- `TestYellowSession_StoresJWTInZustand`
  - Simulate WS challenge/verify response returning `jwt_token`
  - Assert store contains `jwt`
  - Spy on `localStorage.setItem` (and `sessionStorage.setItem`) and assert **never called**
- `TestYellowSession_ClearsOnDisconnect`

`sessionStore` tests:
- `TestSessionStore_InitialState`
- `TestSessionStore_NeverPersists` (assert no persist middleware used; memory-only store)

WS mocking:
- Provide a small in-test `MockWebSocket` implementation or inject a `WebSocket` factory into hooks to avoid global patching.

---

## 5) Commit Gate

Run from `orderbook-frontend/`:

```bash
npx tsc --noEmit
npx vitest run
```

Both must pass with zero errors.

