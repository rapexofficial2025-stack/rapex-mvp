/** Deterministic decorative stats for the Merchant Headquarters dashboard -- mock-only, no backend. */
function seedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 100000;
  return hash;
}

export type StoreHeadlineStats = {
  followers: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  liveVisitors: number;
  revenueToday: number;
  ordersToday: number;
  totalSold: number;
  savedByCustomers: number;
};

export function getStoreStats(storeId: string): StoreHeadlineStats {
  const seed = seedFromId(storeId);
  return {
    followers: 800 + (seed % 900),
    viewsToday: 120 + (seed % 300),
    viewsThisWeek: 900 + (seed % 1500),
    viewsThisMonth: 4200 + (seed % 6000),
    liveVisitors: 3 + (seed % 12),
    revenueToday: 15000 + (seed % 20000),
    ordersToday: 8 + (seed % 30),
    totalSold: 4000 + (seed % 9000),
    savedByCustomers: 200 + (seed % 400),
  };
}
