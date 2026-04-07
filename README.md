# OrderbookTrade-Yellow

> **CLOB Matching Engine on Yellow — Zero-Gas Order Matching via Nitrolite State Channels, On-Chain Settlement**


---

## 1. Introduction

**OrderbookTrade-Yellow** is a **real-time prediction market** built on a **Central Limit Order Book (CLOB)** architecture, powered by **Yellow Network’s Nitrolite state channels**.  

Unlike AMM-based DEXs, which rely on liquidity pools and incur gas costs per trade, OrderbookTrade-Yellow enables **zero-gas trading sessions** with **on-chain settlement only at session closure**.  

###  Key Innovation
- **Single deposit → unlimited trades**  
- **Zero gas fees** during trading sessions  
- **Sub-second latency** via ClearNode WebSocket execution  
- **Trustless settlement** on-chain when closing the session  

This hybrid design combines the **speed of centralized exchanges** with the **security guarantees of blockchain**.

---

## 2. Architecture

![Architecture](assets/architecture.png)

### Components
- **Frontend (Next.js + React)**: Wallet connection, session management, and trading UI.  
- **Backend (Go Engine)**: FIFO price-time priority matching, market management, and Yellow SDK integration.  
- **Yellow ClearNode**: Session authentication, state channel updates, and off-chain trade verification.  
- **Smart Contracts (Nitrolite)**: Adjudication and final settlement on-chain.  

---

## 3. Problem Solving

| AMM-Based DEX              | OrderbookTrade-Yellow                          |
|-----------------------------|-----------------------------------------------|
| Gas fee per trade           | **Zero gas** during session                   |
| 12+ sec confirmation        | **< 1 second** execution (WebSocket-based)    |
| Limited order types         | **CLOB** (limit, market, cancel, amend)       |
| Single trade = 1 tx         | **Unlimited trades** = 1 tx                   |

### Mathematical Comparison

**AMM Pricing (Constant Product):**



$$\[
x \cdot y = k
\]$$



where $$\(x\)$$ and $$\(y\)$$ are token reserves, and $$\(k\)$$ is invariant.  

**CLOB Pricing (Price-Time Priority):**



$$\[
P_{trade} = \min(P_{ask}, P_{bid})
\]$$



Execution priority is determined by **earliest timestamp**:



$$\[
Priority(order) = f(price, time)
\]$$



with $$\(f\)$$ enforcing **best price first, earliest order second**.

---

## 4. Trading Flow

```mermaid
sequenceDiagram
  autonumber
  participant User as User
  participant FE as Frontend
  participant MM as MetaMask
  participant Y as Yellow ClearNode (WS)
  participant BE as Backend (WS)

  User->>FE: Connect wallet
  FE->>MM: Request accounts
  MM-->>FE: Wallet address

  User->>FE: Click "Connect Yellow"
  FE->>FE: Generate session keypair

  FE->>Y: Connect via WebSocket
  FE->>Y: auth_request { address, session_key, allowances, expires_at }
  Y-->>FE: auth_challenge { challenge_message }

  FE->>MM: EIP-712 sign(challenge_message)
  MM-->>FE: signature

  FE->>Y: auth_verify { signature, challenge, address }
  Y-->>FE: jwt_token { session_key, jwt_token, expires_at }

  FE->>BE: Connect via WebSocket (ws://localhost:8080/ws)
  FE->>BE: yellow_auth { jwt_token, session_key }
  BE->>BE: ValidateToken() and create session
  BE-->>FE: yellow_auth_success

  FE-->>User:  Authenticated — can start trading
