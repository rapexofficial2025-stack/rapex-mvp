import type { OrderSummary } from "../types";

export const MOCK_ORDERS: OrderSummary[] = [
  {
    id: "order-1001",
    storeName: "Amy's Carinderia",
    status: "completed",
    total: 268,
    placedAt: "2026-07-30T11:20:00.000Z",
    itemCount: 2,
  },
  {
    id: "order-1002",
    storeName: "Lancaster Fresh Mart",
    status: "delivering",
    total: 430,
    placedAt: "2026-08-01T08:05:00.000Z",
    itemCount: 3,
  },
  {
    id: "order-1003",
    storeName: "Kawit Hardware Supply",
    status: "pending",
    total: 320,
    placedAt: "2026-08-01T09:40:00.000Z",
    itemCount: 1,
  },
];
