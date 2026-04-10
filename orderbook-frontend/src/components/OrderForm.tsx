import type { FC, FormEvent } from "react";
import { useMemo, useState } from "react";
import { useSessionStore } from "../store/sessionStore";
import { useOrderSubmit } from "../hooks/useOrderSubmit";
import type { OrderType, Side } from "../types/orderbook";

export const OrderForm: FC<{ marketID: string }> = ({ marketID }) => {
  const status = useSessionStore((s) => s.status);
  const canTrade = status === "connected";

  const { submitOrder, loading, error, ack } = useOrderSubmit();

  const [type, setType] = useState<OrderType>("limit");
  const [side, setSide] = useState<Side>("buy");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");

  const parsed = useMemo(() => {
    const qtyNum = Number(qty);
    const priceNum = Number(price);
    return { qtyNum, priceNum };
  }, [qty, price]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canTrade) return;
    if (!Number.isFinite(parsed.qtyNum) || parsed.qtyNum <= 0) return;
    if (type === "limit" && (!Number.isFinite(parsed.priceNum) || parsed.priceNum <= 0)) return;

    await submitOrder({
      marketID,
      side,
      type,
      qty: parsed.qtyNum,
      price: type === "limit" ? parsed.priceNum : undefined,
    });
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 text-neutral-100">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Order</div>
        <div className="text-xs text-neutral-400">{marketID}</div>
      </div>

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setType("limit")}
          className={`rounded px-3 py-1 text-xs ${type === "limit" ? "bg-neutral-800" : "bg-neutral-900 text-neutral-400"}`}
        >
          Limit
        </button>
        <button
          type="button"
          onClick={() => setType("market")}
          className={`rounded px-3 py-1 text-xs ${type === "market" ? "bg-neutral-800" : "bg-neutral-900 text-neutral-400"}`}
        >
          Market
        </button>
      </div>

      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`flex-1 rounded px-3 py-2 text-sm ${side === "buy" ? "bg-green-600 text-white" : "bg-neutral-900 text-neutral-300"}`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`flex-1 rounded px-3 py-2 text-sm ${side === "sell" ? "bg-red-600 text-white" : "bg-neutral-900 text-neutral-300"}`}
        >
          Sell
        </button>
      </div>

      <form onSubmit={onSubmit} className="grid gap-2">
        {type === "limit" ? (
          <label className="grid gap-1 text-xs text-neutral-400">
            Price
            <input
              className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              disabled={!canTrade || loading}
            />
          </label>
        ) : null}

        <label className="grid gap-1 text-xs text-neutral-400">
          Quantity
          <input
            className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            disabled={!canTrade || loading}
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-50"
          disabled={!canTrade || loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {!canTrade ? (
        <div className="mt-3 text-xs text-yellow-400">Connect Yellow to trade.</div>
      ) : null}
      {error ? <div className="mt-3 text-xs text-red-400">Error: {error}</div> : null}
      {ack ? (
        <div className="mt-3 text-xs text-green-400">
          Ack: {ack.status}
          {ack.reason ? ` (${ack.reason})` : ""}
        </div>
      ) : null}
    </div>
  );
};

