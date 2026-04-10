import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MarketsPage } from "../page";

vi.mock("../useMarkets", () => ({
  useMarkets: vi.fn(),
}));

import { useMarkets } from "../useMarkets";

describe("markets page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TestMarketsPage_ShowsMarketCards", async () => {
    const mockMarkets = [
      { id: "BTC-USD", name: "BTC-USD", description: "Bitcoin", expiry: "2026-12-31", midPrice: 50000, volume: 1000000 },
      { id: "ETH-USD", name: "ETH-USD", description: "Ethereum", expiry: "2026-12-31", midPrice: 3000, volume: 500000 },
    ];

    vi.mocked(useMarkets).mockReturnValue({
      markets: mockMarkets,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MarketsPage />);

    expect(screen.getByText("BTC-USD")).toBeInTheDocument();
    expect(screen.getByText("ETH-USD")).toBeInTheDocument();
  });

  it("TestMarketsPage_ShowsSkeletonWhileLoading", async () => {
    vi.mocked(useMarkets).mockReturnValue({
      markets: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<MarketsPage />);

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("TestMarketsPage_ShowsEmptyState", async () => {
    vi.mocked(useMarkets).mockReturnValue({
      markets: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<MarketsPage />);

    expect(screen.getByText(/no markets yet/i)).toBeInTheDocument();
  });
});
