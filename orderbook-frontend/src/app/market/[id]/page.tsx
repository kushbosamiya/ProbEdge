import { TradingLayout } from "../../../components/TradingLayout";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type BackendMarket = {
  id: string;
  name: string;
  base: string;
  quote: string;
};

async function fetchMarket(marketID: string): Promise<BackendMarket | null> {
  const res = await fetch(`${API_URL}/markets/${marketID}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch market: ${res.status}`);
  return (await res.json()) as BackendMarket;
}

export default async function MarketPage({
  params,
}: {
  params: { id: string };
}) {
  const marketID = params.id;
  const m = await fetchMarket(marketID);

  const marketName = m?.name ?? marketID;
  const expiry = "2026-12-31";

  return <TradingLayout marketID={marketID} marketName={marketName} expiry={expiry} />;
}
