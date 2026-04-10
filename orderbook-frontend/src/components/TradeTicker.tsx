import type { FC } from "react";
import { useEffect, useRef } from "react";
import { useTradeStream } from "../hooks/useTradeStream";

export const TradeTicker: FC<{ marketID: string }> = ({ marketID }) => {
  const trades = useTradeStream(marketID);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [trades.length]);

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-neutral-100">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Trades</div>
        <div className="text-xs text-neutral-400">{marketID}</div>
      </div>

      <div ref={scrollRef} className="h-[300px] overflow-y-auto rounded border border-neutral-900">
        <div className="grid grid-cols-4 gap-2 px-3 py-2 text-[11px] text-neutral-400">
          <div>Side</div>
          <div className="text-right">Price</div>
          <div className="text-right">Qty</div>
          <div className="text-right">Time</div>
        </div>
        {trades.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-4 gap-2 border-t border-neutral-900 px-3 py-2 text-xs"
          >
            <div className={t.side === "buy" ? "text-green-400" : "text-red-400"}>{t.side}</div>
            <div className="text-right font-mono">{t.price.toFixed(2)}</div>
            <div className="text-right font-mono">{t.qty.toFixed(4)}</div>
            <div className="text-right font-mono text-neutral-400">{new Date(t.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

