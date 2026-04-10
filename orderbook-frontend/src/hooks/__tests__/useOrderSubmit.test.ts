import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({
  lastMessage: null as any,
  sendSpy: vi.fn(),
}));

vi.mock("../useBackendWS", () => ({
  useBackendWS: () => ({
    lastMessage: backend.lastMessage,
    send: backend.sendSpy,
    connected: true,
    reconnect: vi.fn(),
  }),
}));

import { useOrderSubmit } from "../useOrderSubmit";

describe("useOrderSubmit", () => {
  beforeEach(() => {
    backend.lastMessage = null;
    backend.sendSpy.mockClear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("TestOrderSubmit_SuccessAck", async () => {
    const { result, rerender } = renderHook(() => useOrderSubmit());

    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current.submitOrder({
        marketID: "BTC-USD",
        side: "buy",
        type: "limit",
        price: 100,
        qty: 1,
      });
    });

    act(() => {
      backend.lastMessage = { type: "order_ack", payload: { status: "filled" } };
      rerender();
    });

    await expect(promise).resolves.toBeDefined();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.ack?.status).toBe("filled");
      expect(result.current.error).toBeNull();
    });
  }, 10000);

  it("TestOrderSubmit_TimeoutAfter5s", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useOrderSubmit());

    let promise!: Promise<unknown>;
    act(() => {
      promise = result.current.submitOrder({
        marketID: "BTC-USD",
        side: "buy",
        type: "market",
        qty: 1,
      });
    });

    const rejection = expect(promise).rejects.toThrow("timeout");

    await act(async () => {
      vi.advanceTimersByTime(5000);
      await vi.runOnlyPendingTimersAsync();
    });

    await rejection;
    expect(result.current.error).toBe("timeout");
  });
});
