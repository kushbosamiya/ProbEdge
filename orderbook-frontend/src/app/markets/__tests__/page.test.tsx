import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MarketsPage } from "../page";

vi.mock("../../../hooks/useMarkets", () => ({
  useMarkets: vi.fn(),
}));

vi.mock("../../../components/YellowAuthButton", () => ({
  YellowAuthButton: () => <div data-testid="yellow-auth-button" />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useMarkets } from "../../../hooks/useMarkets";

describe("markets page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("TestMarketsPage_ShowsMarketCards", () => {
    const mockMarkets = [
      {
        id: "BTC-USD",
        name: "BTC-USD",
        description: "Bitcoin",
        expiry: "2026-12-31",
        midPrice: 50000,
        volume: 1000000,
      },
      {
        id: "ETH-USD",
        name: "ETH-USD",
        description: "Ethereum",
        expiry: "2026-12-31",
        midPrice: 3000,
        volume: 500000,
      },
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

  it("TestMarketsPage_ShowsSkeletonWhileLoading", () => {
    vi.mocked(useMarkets).mockReturnValue({
      markets: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<MarketsPage />);

    const skeletons = screen.getAllByTestId("market-skeleton");
    expect(skeletons.length).toBe(3);
  });

  it("TestMarketsPage_ShowsEmptyState", () => {
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
