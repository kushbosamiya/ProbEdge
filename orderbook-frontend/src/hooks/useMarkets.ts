import { useQuery } from "@tanstack/react-query";
import type { Market } from "../types/orderbook";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface BackendMarket {
  id: string;
  name: string;
  base: string;
  quote: string;
}

interface MarketsResponse {
  markets: BackendMarket[];
}

function mapBackendMarket(m: BackendMarket): Market {
  return {
    id: m.id,
    name: m.name,
    description: `${m.base}/${m.quote}`,
    expiry: "2026-12-31",
    midPrice: 0,
    volume: 0,
  };
}

export function useMarkets() {
  const { data, isLoading, error, refetch } = useQuery<Market[]>({
    queryKey: ["markets"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/markets`);
      if (!res.ok) {
        throw new Error(`Failed to fetch markets: ${res.status}`);
      }
      const json: MarketsResponse = await res.json();
      return json.markets.map(mapBackendMarket);
    },
  });

  return {
    markets: data ?? [],
    isLoading,
    error: error ? error.message : null,
    refetch,
  };
}
