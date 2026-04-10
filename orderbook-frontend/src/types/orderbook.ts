export type Side = "buy" | "sell";
export type OrderType = "limit" | "market";

export interface Level {
  price: number;
  qty: number;
  total: number;
}

export interface Trade {
  id: string;
  price: number;
  qty: number;
  side: Side;
  timestamp: number;
  marketID: string;
}

export interface Market {
  id: string;
  name: string;
  description: string;
  expiry: string;
  midPrice: number;
  volume: number;
}

export interface Order {
  marketID: string;
  side: Side;
  type: OrderType;
  price?: number;
  qty: number;
}

