import { useCallback, useEffect, useRef, useState } from "react";
import { useBackendWS } from "./useBackendWS";
import type { Order } from "../types/orderbook";

type OrderAck = {
  orderID?: string;
  status: string;
  reason?: string;
};

type OrderAckMessage = {
  type: "order_ack";
  payload?: OrderAck;
};

export function useOrderSubmit() {
  const { send, lastMessage } = useBackendWS();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ack, setAck] = useState<OrderAck | null>(null);
  const pendingRef = useRef<{ resolve: (a: OrderAck) => void; reject: (e: Error) => void } | null>(null);

  useEffect(() => {
    const msg = lastMessage as OrderAckMessage | null;
    if (!msg || msg.type !== "order_ack" || !msg.payload) return;
    setAck(msg.payload);
    setLoading(false);
    setError(null);
    pendingRef.current?.resolve(msg.payload);
    pendingRef.current = null;
  }, [lastMessage]);

  const submitOrder = useCallback(
    async (order: Order) => {
      setLoading(true);
      setError(null);
      setAck(null);

      send({ type: "place_order", data: order } as any);

      return await new Promise<OrderAck>((resolve, reject) => {
        pendingRef.current = { resolve, reject };
        setTimeout(() => {
          if (!pendingRef.current) return;
          pendingRef.current = null;
          setLoading(false);
          setError("timeout");
          reject(new Error("timeout"));
        }, 5000);
      });
    },
    [send]
  );

  return { submitOrder, loading, error, ack };
}

