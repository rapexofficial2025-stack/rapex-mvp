import type { Category, ProductDetail, ProductSummary, StoreSummary } from "../types";

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
  { id: "prod-1", storeId: "store-1", name: "Chicken Adobo Meal", price: 129, imageLabel: "🍗" },
  { id: "prod-2", storeId: "store-1", name: "Pork Sinigang Meal", price: 139, imageLabel: "🍲" },
  { id: "prod-3", storeId: "store-2", name: "Fresh Bangus (1kg)", price: 180, imageLabel: "🐟" },
  { id: "prod-4", storeId: "store-2", name: "Red Rice (5kg)", price: 250, imageLabel: "🍚" },
  { id: "prod-5", storeId: "store-3", name: "Claw Hammer", price: 320, imageLabel: "🔨" },
  { id: "prod-6", storeId: "store-4", name: "Paracetamol 500mg (20 tabs)", price: 45, imageLabel: "💊" },
  { id: "prod-7", storeId: "store-5", name: "Pork BBQ (6 sticks)", price: 150, imageLabel: "🍢" },
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
