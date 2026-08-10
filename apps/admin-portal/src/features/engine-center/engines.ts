import type { EngineKey } from "@rapex/api-client";

export type EngineDef = { key: EngineKey; icon: string; label: string; description: string };

export const ENGINES: EngineDef[] = [
  { key: "marketplace", icon: "🛍", label: "Marketplace", description: "Business pillars: categories, icons, theme, sort order." },
  { key: "delivery", icon: "🚚", label: "Delivery", description: "Food, non-food, and industrial delivery rules and fees." },
  { key: "pricing", icon: "📈", label: "Pricing", description: "Commission, markup, peak-hour, and holiday rate rules." },
  { key: "promotions", icon: "🎟", label: "Promotions", description: "Free delivery and voucher engines." },
  { key: "finance", icon: "💰", label: "Finance", description: "Platform fees and commission earnings." },
  { key: "membership", icon: "⭐", label: "Membership", description: "Merchant tiers: Starter, Silver, Gold, Platinum." },
  { key: "rewards", icon: "🏅", label: "Rewards", description: "Points, referrals, and conversion rates." },
  { key: "wallet", icon: "💳", label: "Wallet", description: "Top-up, withdrawal, and transfer limits." },
  { key: "coverage", icon: "📍", label: "Coverage", description: "Default and maximum service radius." },
  { key: "verification", icon: "🛡", label: "Verification", description: "Age and document requirements." },
  { key: "orders", icon: "🚨", label: "Orders", description: "Response, acceptance, and auto-cancel timeouts." },
  { key: "notifications", icon: "🔔", label: "Notifications", description: "Push, SMS, email, in-app, and broadcast." },
  { key: "maps", icon: "🌍", label: "Maps", description: "Google Maps zoom, markers, and tracking intervals." },
  { key: "developer", icon: "🤖", label: "Developer", description: "God Mode tools — visible to super admin only." },
];
