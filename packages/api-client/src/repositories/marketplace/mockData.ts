import type { Category, ProductDetail, ProductSummary, Review, StoreDetail, StoreSummary } from "../types";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food", iconLabel: "🍴" },
  { id: "cat-grocery", name: "Grocery", iconLabel: "🛒" },
  { id: "cat-hardware", name: "Hardware", iconLabel: "🔧" },
  { id: "cat-pharmacy", name: "Pharmacy", iconLabel: "💊" },
];

export const MOCK_STORES: StoreSummary[] = [
  {
    id: "store-1",
    name: "Amy's Carinderia",
    category: "Food",
    rating: 4.9,
    isOpen: true,
    distanceKm: 0.8,
    distanceLabel: "0.8 km",
    deliveryTimeMinMinutes: 20,
    deliveryTimeLabel: "20-30 min",
  },
  {
    id: "store-2",
    name: "Lancaster Fresh Mart",
    category: "Grocery",
    rating: 4.8,
    isOpen: true,
    distanceKm: 1.2,
    distanceLabel: "1.2 km",
    deliveryTimeMinMinutes: 25,
    deliveryTimeLabel: "25-35 min",
  },
  {
    id: "store-3",
    name: "Kawit Hardware Supply",
    category: "Hardware",
    rating: 4.6,
    isOpen: false,
    distanceKm: 2.5,
    distanceLabel: "2.5 km",
    deliveryTimeMinMinutes: 40,
    deliveryTimeLabel: "40-50 min",
  },
  {
    id: "store-4",
    name: "Imus Family Pharmacy",
    category: "Pharmacy",
    rating: 4.7,
    isOpen: true,
    distanceKm: 1.5,
    distanceLabel: "1.5 km",
    deliveryTimeMinMinutes: 15,
    deliveryTimeLabel: "15-25 min",
  },
  {
    id: "store-5",
    name: "Tejero Grill House",
    category: "Food",
    rating: 4.3,
    isOpen: true,
    distanceKm: 3.1,
    distanceLabel: "3.1 km",
    deliveryTimeMinMinutes: 35,
    deliveryTimeLabel: "35-45 min",
  },
];

export const MOCK_PRODUCTS: ProductSummary[] = [
  { id: "prod-1", storeId: "store-1", name: "Chicken Adobo Meal", price: 129, imageLabel: "🍗", productCategory: "Rice Meals" },
  { id: "prod-2", storeId: "store-1", name: "Pork Sinigang Meal", price: 139, imageLabel: "🍲", productCategory: "Rice Meals" },
  { id: "prod-8", storeId: "store-1", name: "Grilled Pork Belly", price: 159, imageLabel: "🥓", productCategory: "Grilled" },
  { id: "prod-9", storeId: "store-1", name: "Iced Tea (16oz)", price: 35, imageLabel: "🧋", productCategory: "Drinks" },
  { id: "prod-3", storeId: "store-2", name: "Fresh Bangus (1kg)", price: 180, imageLabel: "🐟", productCategory: "Fresh Seafood" },
  { id: "prod-4", storeId: "store-2", name: "Red Rice (5kg)", price: 250, imageLabel: "🍚", productCategory: "Staples" },
  { id: "prod-5", storeId: "store-3", name: "Claw Hammer", price: 320, imageLabel: "🔨", productCategory: "Tools" },
  { id: "prod-6", storeId: "store-4", name: "Paracetamol 500mg (20 tabs)", price: 45, imageLabel: "💊", productCategory: "Medicine" },
  { id: "prod-7", storeId: "store-5", name: "Pork BBQ (6 sticks)", price: 150, imageLabel: "🍢", productCategory: "Grilled" },
];

export const MOCK_PRODUCT_DETAILS: Record<string, ProductDetail> = Object.fromEntries(
  MOCK_PRODUCTS.map((product) => {
    const store = MOCK_STORES.find((s) => s.id === product.storeId);
    const detail: ProductDetail = {
      ...product,
      description: `${product.name}, freshly prepared and ready for delivery.`,
      storeName: store?.name ?? "Unknown Store",
      stock: 24,
    };
    return [product.id, detail];
  }),
);

const MOCK_REVIEWS: Record<string, Review[]> = {
  "store-1": [
    { id: "rev-1", authorName: "Maria S.", rating: 5, comment: "Best adobo in Imus, always hot and generous portions!", date: "2026-07-28T10:00:00.000Z" },
    { id: "rev-2", authorName: "Jun P.", rating: 5, comment: "Fast delivery and the sinigang is amazing.", date: "2026-07-20T14:00:00.000Z" },
    { id: "rev-3", authorName: "Liza R.", rating: 4, comment: "Good food, sometimes a bit slow during lunch rush.", date: "2026-07-10T09:00:00.000Z" },
  ],
  "store-2": [
    { id: "rev-4", authorName: "Carlo M.", rating: 5, comment: "Freshest bangus in the area.", date: "2026-07-25T11:00:00.000Z" },
    { id: "rev-5", authorName: "Grace T.", rating: 4, comment: "Good prices, wide selection.", date: "2026-07-15T08:00:00.000Z" },
  ],
  "store-3": [
    { id: "rev-6", authorName: "Ferdie C.", rating: 4, comment: "Reliable hardware store, staff knows their stock well.", date: "2026-06-30T13:00:00.000Z" },
  ],
  "store-4": [
    { id: "rev-7", authorName: "Ana L.", rating: 5, comment: "Quick service, always has what I need.", date: "2026-07-22T16:00:00.000Z" },
  ],
  "store-5": [
    { id: "rev-8", authorName: "Ricky D.", rating: 4, comment: "Great BBQ, worth the wait.", date: "2026-07-18T19:00:00.000Z" },
  ],
};

const HERO_EXTRAS: Record<string, Omit<StoreDetail, keyof StoreSummary | "reviews" | "reviewCount">> = {
  "store-1": {
    coverImageLabel: "🍛",
    logoLabel: "🐔",
    isVerified: true,
    followerCount: 1240,
    description: "Home-style Filipino carinderia serving classic favorites since 2015. Fresh ingredients, generous portions.",
    businessHours: "6:00 AM - 8:00 PM daily",
    deliveryFee: 29,
    minimumOrder: 99,
  },
  "store-2": {
    coverImageLabel: "🥬",
    logoLabel: "🛒",
    isVerified: true,
    followerCount: 860,
    description: "Your neighborhood fresh market — seafood, produce, and pantry staples delivered daily.",
    businessHours: "24 hours",
    deliveryFee: 39,
    minimumOrder: 150,
  },
  "store-3": {
    coverImageLabel: "🧰",
    logoLabel: "🔧",
    isVerified: false,
    followerCount: 320,
    description: "Full-service hardware supply for home and construction needs.",
    businessHours: "8:00 AM - 5:00 PM, Mon-Sat",
    deliveryFee: 49,
    minimumOrder: 200,
  },
  "store-4": {
    coverImageLabel: "💊",
    logoLabel: "⚕️",
    isVerified: true,
    followerCount: 540,
    description: "Licensed community pharmacy with a wide range of medicines and health essentials.",
    businessHours: "9:00 AM - 7:00 PM daily",
    deliveryFee: 25,
    minimumOrder: 50,
  },
  "store-5": {
    coverImageLabel: "🔥",
    logoLabel: "🍢",
    isVerified: false,
    followerCount: 410,
    description: "Neighborhood grill house known for smoky BBQ and generous rice meals.",
    businessHours: "4:00 PM - 11:00 PM daily",
    deliveryFee: 35,
    minimumOrder: 100,
  },
};

export const MOCK_STORE_DETAILS: Record<string, StoreDetail> = Object.fromEntries(
  MOCK_STORES.map((store) => {
    const reviews = MOCK_REVIEWS[store.id] ?? [];
    const detail: StoreDetail = {
      ...store,
      ...HERO_EXTRAS[store.id]!,
      reviewCount: reviews.length,
      reviews,
    };
    return [store.id, detail];
  }),
);
