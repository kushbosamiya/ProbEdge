import type { FC } from "react";
import type { Market } from "../types/orderbook";

export const PredictionMarketCard: FC<{ market: Market }> = ({ market }) => {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-neutral-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">{market.name}</div>
          <div className="mt-1 text-xs text-neutral-400">{market.description}</div>
          <div className="mt-2 text-xs text-neutral-500">Expiry: {market.expiry}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-400">Mid</div>
          <div className="font-mono text-lg">{market.midPrice.toFixed(2)}</div>
          <div className="mt-1 text-xs text-neutral-400">24h Vol</div>
          <div className="font-mono text-sm">{market.volume.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded bg-green-600 px-3 py-2 text-sm font-semibold text-white">Quick Buy</button>
        <button className="rounded bg-red-600 px-3 py-2 text-sm font-semibold text-white">Quick Sell</button>
      </div>
    </div>
  );
};

