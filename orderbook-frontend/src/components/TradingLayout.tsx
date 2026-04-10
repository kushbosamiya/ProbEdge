"use client";

import type { FC } from "react";
import { useSessionStore } from "../store/sessionStore";
import { YellowAuthButton } from "./YellowAuthButton";
import { OrderBookDepth } from "./OrderBookDepth";
import { OrderForm } from "./OrderForm";
import { TradeTicker } from "./TradeTicker";

interface TradingLayoutProps {
  marketID: string;
  marketName: string;
  expiry?: string;
}

export const TradingLayout: FC<TradingLayoutProps> = ({
  marketID,
  marketName,
  expiry,
}) => {
  const status = useSessionStore((s) => s.status);
  const isConnected = status === "connected";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{marketName}</h1>
          <span className="text-sm text-neutral-400">{marketID}</span>
          {expiry ? (
            <span className="text-sm text-neutral-500">Expiry: {expiry}</span>
          ) : null}
        </div>
        <YellowAuthButton />
      </header>

      {!isConnected && (
        <div className="bg-yellow-900/20 border-b border-yellow-900 px-4 py-2 text-center text-sm text-yellow-400">
          Connect your wallet to start trading
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-5 lg:p-6">
        <div className="lg:col-span-2">
          <OrderBookDepth marketID={marketID} />
        </div>
        <div className="lg:col-span-1">
          <OrderForm marketID={marketID} />
        </div>
        <div className="lg:col-span-2">
          <TradeTicker marketID={marketID} />
        </div>
      </div>
    </div>
  );
};
