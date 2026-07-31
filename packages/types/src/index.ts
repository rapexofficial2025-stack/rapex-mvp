export * from "./common";
export * from "./api";

// Domain entity types (User, Order, Product, Wallet, Auction, etc.) are intentionally
// NOT defined here yet — they must match the real Xano API contract field-for-field.
// Adding them ahead of the contract risks silent mismatches once real endpoints land.
// See docs/api/README.md for status.
