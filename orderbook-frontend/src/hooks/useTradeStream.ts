import { useEffect, useRef, useState } from "react";
import { useBackendWS } from "./useBackendWS";
import type { Trade } from "../types/orderbook";

type TradeExecutedMessage = {
  type: "trade_executed";
  payload?: Trade;
};

export function useTradeStream(marketID: string) {
  const { lastMessage } = useBackendWS();
  const bufRef = useRef<Trade[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const msg = lastMessage as TradeExecutedMessage | null;
    if (!msg || msg.type !== "trade_executed") return;
    const t = msg.payload;
    if (!t || t.marketID !== marketID) return;

    const next = [t, ...bufRef.current].slice(0, 50);
    bufRef.current = next;
    setTrades(next);
  }, [lastMessage, marketID]);

  return trades;
}

