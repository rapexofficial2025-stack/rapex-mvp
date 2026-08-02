import type { BusinessCategory, BusinessStructure, VatStatus } from "@rapex/api-client";

export const BUSINESS_CATEGORIES: { key: BusinessCategory; icon: string; label: string; blurb: string }[] = [
  { key: "food", icon: "🍽", label: "RAPEX Food", blurb: "Restaurants, cafes, bakeries, and street food." },
  { key: "market", icon: "🛒", label: "RAPEX Market", blurb: "Grocery, fresh produce, and the wet market." },
  { key: "shop", icon: "🛍", label: "RAPEX Shop", blurb: "Hardware, fashion, electronics, and more." },
  { key: "service", icon: "🛠", label: "RAPEX Service", blurb: "Home services and skilled professionals." },
];

export const BUSINESS_NATURE_OPTIONS: Record<BusinessCategory, string[]> = {
  food: ["Ready-to-Eat", "Restaurant", "Cafe", "Bakery", "Milk Tea", "Pizza", "Dessert", "Street Food", "Short Order", "Korean Store"],
  market: ["Grocery", "Fresh Vegetables", "Fresh Fruits", "Wet Market", "Frozen Foods", "Meat Shop", "Seafood", "Rice Dealer", "Agri Products"],
  shop: ["Hardware", "Fashion", "Electronics", "Furniture", "Pet Shop", "Pharmacy", "Office Supplies", "Agricultural Supplies", "Auto Parts"],
  service: ["Electrician", "Plumber", "Mechanic", "Cleaning", "Salon", "Tutor", "Photographer", "Computer Repair", "Professional Services"],
};

export const OPERATING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const BUSINESS_STRUCTURES: { key: BusinessStructure; label: string }[] = [
  { key: "individual", label: "Individual" },
  { key: "dti", label: "DTI" },
  { key: "opc", label: "OPC" },
  { key: "corporation", label: "Corporation" },
  { key: "partnership", label: "Partnership" },
  { key: "cooperative", label: "Cooperative" },
];

export const VAT_STATUSES: { key: VatStatus; label: string }[] = [
  { key: "vat", label: "VAT Registered" },
  { key: "non-vat", label: "Non-VAT" },
];

export const ONBOARDING_STEP_TITLES = [
  "Merchant Verification",
  "Create Your First Business",
  "Business Nature",
  "Store Details",
  "Business Documents",
  "Store Appearance",
  "Products",
];
