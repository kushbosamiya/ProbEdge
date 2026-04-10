import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useTradeStream } from "../useTradeStream";

let lastMessage: any = null;

vi.mock("../useBackendWS", () => ({
  useBackendWS: () => ({
    lastMessage,
    send: vi.fn(),
    connected: true,
    reconnect: vi.fn(),
  }),
}));

describe("useTradeStream", () => {
  it("TestTradeStream_AddsNewTrade", () => {
    const { result, rerender } = renderHook(() => useTradeStream("BTC-USD"));

    lastMessage = {
      type: "trade_executed",
      payload: {
        id: "t1",
        price: 100,
        qty: 1,
        side: "buy",
        timestamp: Date.now(),
        marketID: "BTC-USD",
      },
    };
    rerender();

    expect(result.current.length).toBe(1);
    expect(result.current[0].id).toBe("t1");
  });

  it("TestTradeStream_CapacityAt50", () => {
    const { result, rerender } = renderHook(() => useTradeStream("BTC-USD"));

    for (let i = 0; i < 51; i++) {
      lastMessage = {
        type: "trade_executed",
        payload: {
          id: `t${i}`,
          price: 100 + i,
          qty: 1,
          side: "buy",
          timestamp: Date.now(),
          marketID: "BTC-USD",
        },
      };
      rerender();
    }

    expect(result.current.length).toBe(50);
    expect(result.current[0].id).toBe("t50");
    expect(result.current[result.current.length - 1].id).toBe("t1");
  });
});

