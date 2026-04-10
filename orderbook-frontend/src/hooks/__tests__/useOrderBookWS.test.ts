import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useOrderBookWS } from "../useOrderBookWS";

let lastMessage: any = null;

vi.mock("../useBackendWS", () => ({
  useBackendWS: () => ({
    lastMessage,
    send: vi.fn(),
    connected: true,
    reconnect: vi.fn(),
  }),
}));

describe("useOrderBookWS", () => {
  it("TestOrderBookWS_ParsesSnapshot", () => {
    lastMessage = {
      type: "orderbook_snapshot",
      payload: {
        marketID: "BTC-USD",
        bids: [
          { price: 100, qty: 1 },
          { price: 101, qty: 2 },
        ],
        asks: [
          { price: 103, qty: 1 },
          { price: 102, qty: 3 },
        ],
      },
    };

    const { result, rerender } = renderHook(() => useOrderBookWS("BTC-USD"));
    rerender();

    expect(result.current.bids.map((l) => l.price)).toEqual([101, 100]);
    expect(result.current.asks.map((l) => l.price)).toEqual([102, 103]);

    expect(result.current.bids.map((l) => l.total)).toEqual([2, 3]);
    expect(result.current.asks.map((l) => l.total)).toEqual([3, 4]);
    expect(result.current.spread).toBe(1);
  });

  it("TestOrderBookWS_IgnoresOtherMarkets", () => {
    lastMessage = {
      type: "orderbook_snapshot",
      payload: {
        marketID: "ETH-USD",
        bids: [{ price: 100, qty: 1 }],
        asks: [{ price: 101, qty: 1 }],
      },
    };

    const { result, rerender } = renderHook(() => useOrderBookWS("BTC-USD"));
    rerender();

    expect(result.current.bids).toEqual([]);
    expect(result.current.asks).toEqual([]);
    expect(result.current.spread).toBeNull();
  });
});

