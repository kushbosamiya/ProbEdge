import { useEffect, useMemo, useState } from "react";
import { useBackendWS } from "./useBackendWS";
import type { Level } from "../types/orderbook";

type RawLevel = { price: number; qty: number } | [number, number];

type OrderbookSnapshotMessage = {
  type: "orderbook_snapshot";
  payload?: {
    marketID?: string;
    market_id?: string;
    bids?: RawLevel[];
    asks?: RawLevel[];
  };
};

function normalizeLevels(levels: RawLevel[] | undefined): Array<{ price: number; qty: number }> {
  if (!levels) return [];
  return levels
    .map((l) => {
      if (Array.isArray(l)) return { price: l[0], qty: l[1] };
      return { price: l.price, qty: l.qty };
    })
    .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.qty));
}

function withTotals(levels: Array<{ price: number; qty: number }>): Level[] {
  let total = 0;
  return levels.map((l) => {
    total += l.qty;
    return { price: l.price, qty: l.qty, total };
  });
}

export function useOrderBookWS(marketID: string) {
  const { lastMessage } = useBackendWS();
  const [bids, setBids] = useState<Level[]>([]);
  const [asks, setAsks] = useState<Level[]>([]);

  useEffect(() => {
    const msg = lastMessage as OrderbookSnapshotMessage | null;
    if (!msg || msg.type !== "orderbook_snapshot") return;

    const payload = msg.payload;
    const msgMarketID = payload?.marketID ?? payload?.market_id;
    if (!msgMarketID || msgMarketID !== marketID) return;

    const rawBids = normalizeLevels(payload?.bids);
    const rawAsks = normalizeLevels(payload?.asks);

    rawBids.sort((a, b) => b.price - a.price);
    rawAsks.sort((a, b) => a.price - b.price);

    setBids(withTotals(rawBids));
    setAsks(withTotals(rawAsks));
  }, [lastMessage, marketID]);

  const spread = useMemo(() => {
    const bestBid = bids[0]?.price;
    const bestAsk = asks[0]?.price;
    if (bestBid == null || bestAsk == null) return null;
    return bestAsk - bestBid;
  }, [bids, asks]);

  return { bids, asks, spread };
}

