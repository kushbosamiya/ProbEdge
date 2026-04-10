import type { FC } from "react";
import { useMemo } from "react";
import { useOrderBookWS } from "../hooks/useOrderBookWS";

export const OrderBookDepth: FC<{ marketID: string }> = ({ marketID }) => {
  const { bids, asks, spread } = useOrderBookWS(marketID);

  const bestBid = bids[0]?.price ?? null;
  const bestAsk = asks[0]?.price ?? null;
  const mid = useMemo(() => {
    if (bestBid == null || bestAsk == null) return null;
    return (bestBid + bestAsk) / 2;
  }, [bestBid, bestAsk]);

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-neutral-100">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Order Book</div>
        <div className="text-xs text-neutral-400">{marketID}</div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <table className="w-full text-xs">
          <thead className="text-neutral-400">
            <tr>
              <th className="py-1 text-left">Price</th>
              <th className="py-1 text-right">Qty</th>
              <th className="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {[...asks].slice(0, 10).reverse().map((l) => (
              <tr key={`ask-${l.price}`} className="text-red-400">
                <td className="py-1 font-mono">{l.price.toFixed(2)}</td>
                <td className="py-1 text-right font-mono">{l.qty.toFixed(4)}</td>
                <td className="py-1 text-right font-mono">{l.total.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between rounded bg-neutral-900 px-3 py-2 text-xs">
          <div className="text-neutral-400">Mid</div>
          <div className="font-mono">{mid == null ? "—" : mid.toFixed(2)}</div>
          <div className="text-neutral-400">Spread</div>
          <div className="font-mono">{spread == null ? "—" : spread.toFixed(2)}</div>
        </div>

        <table className="w-full text-xs">
          <thead className="text-neutral-400">
            <tr>
              <th className="py-1 text-left">Price</th>
              <th className="py-1 text-right">Qty</th>
              <th className="py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {bids.slice(0, 10).map((l) => (
              <tr key={`bid-${l.price}`} className="text-green-400">
                <td className="py-1 font-mono">{l.price.toFixed(2)}</td>
                <td className="py-1 text-right font-mono">{l.qty.toFixed(4)}</td>
                <td className="py-1 text-right font-mono">{l.total.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

