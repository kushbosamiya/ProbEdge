'use client'

import Link from "next/link";
import { useMarkets } from "../../hooks/useMarkets";
import { PredictionMarketCard } from "../../components/PredictionMarketCard";

export default function MarketsPage() {
  const { markets, isLoading, error, refetch } = useMarkets();

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Markets</h1>
        </header>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-neutral-800 bg-neutral-950 p-4"
            >
              <div className="h-4 w-1/2 rounded bg-neutral-800" />
              <div className="mt-4 h-3 w-3/4 rounded bg-neutral-800" />
              <div className="mt-4 h-8 w-1/4 rounded bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Markets</h1>
        </header>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="text-red-400">Failed to load markets</div>
          <button
            onClick={() => refetch()}
            className="rounded bg-neutral-800 px-4 py-2 text-sm hover:bg-neutral-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="min-h-screen p-8">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Markets</h1>
        </header>
        <div className="flex flex-col items-center justify-center gap-4 pt-16">
          <div className="text-xl text-neutral-400">No markets yet</div>
          <div className="text-sm text-neutral-500">
            Markets will appear here once they are created
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Markets</h1>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((market) => (
          <Link key={market.id} href={`/market/${market.id}`}>
            <PredictionMarketCard market={market} />
          </Link>
        ))}
      </div>
    </div>
  );
}
