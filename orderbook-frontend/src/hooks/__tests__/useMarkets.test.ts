import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement } from "react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useMarkets } from "../useMarkets";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  // eslint-disable-next-line react/display-name
  return ({ children }: PropsWithChildren) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useMarkets", () => {
  const fetchSpy = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchSpy);
    fetchSpy.mockReset();
    process.env.NEXT_PUBLIC_API_URL = "http://example.test";
  });

  it("TestUseMarkets_FetchesFromAPI", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        markets: [{ id: "m1", name: "Market 1", base: "BTC", quote: "USD" }],
      }),
    } as Response);

    const { result } = renderHook(() => useMarkets(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.markets.length).toBe(1));
    expect(fetchSpy).toHaveBeenCalledWith("http://example.test/markets");
    expect(result.current.markets[0].id).toBe("m1");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("TestUseMarkets_HandlesError", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useMarkets(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.markets).toHaveLength(0);
  });

  it("TestUseMarkets_LoadingState", async () => {
    let resolveFetch!: (value: unknown) => void;
    const slowPromise = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    fetchSpy.mockReturnValueOnce(slowPromise as Promise<Response>);

    const { result } = renderHook(() => useMarkets(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.markets).toHaveLength(0);

    resolveFetch({
      ok: true,
      json: async () => ({ markets: [] }),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});
