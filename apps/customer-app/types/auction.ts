/**
 * UI-only types for the Auction preview screens -- no bidding engine, no
 * timers, no wallet holds, no realtime. Mock data only, for UX study.
 */

export type AuctionCategory = "Electronics" | "Collectibles" | "Fashion" | "Home & Living" | "Vehicles" | "Other";

export type AuctionStatus = "live" | "ending-soon" | "ended";

export type AuctionListing = {
  id: string;
  title: string;
  category: AuctionCategory;
  sellerName: string;
  currentBid: number;
  minIncrement: number;
  endsInLabel: string;
  bidderCount: number;
  status: AuctionStatus;
  isWatchlisted: boolean;
};

export type BidHistoryEntry = {
  id: string;
  bidderName: string;
  amount: number;
  timeLabel: string;
};

export type AuctionDetail = AuctionListing & {
  description: string;
  condition: string;
  photoCount: number;
  bidHistory: BidHistoryEntry[];
};
