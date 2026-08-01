import type { Category, ProductDetail, ProductSummary, StoreSummary } from "../types";

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food", iconLabel: "🍴" },
  { id: "cat-grocery", name: "Grocery", iconLabel: "🛒" },
  { id: "cat-hardware", name: "Hardware", iconLabel: "🔧" },
  { id: "cat-pharmacy", name: "Pharmacy", iconLabel: "💊" },
];

export const MOCK_STORES: StoreSummary[] = [
  { id: "store-1", name: "Amy's Carinderia", category: "Food", rating: 4.9, isOpen: true, distanceLabel: "0.8 km" },
  { id: "store-2", name: "Lancaster Fresh Mart", category: "Grocery", rating: 4.8, isOpen: true, distanceLabel: "1.2 km" },
  { id: "store-3", name: "Kawit Hardware Supply", category: "Hardware", rating: 4.6, isOpen: false, distanceLabel: "2.5 km" },
];

export const MOCK_PRODUCTS: ProductSummary[] = [
  { id: "prod-1", storeId: "store-1", name: "Chicken Adobo Meal", price: 129, imageLabel: "🍗" },
  { id: "prod-2", storeId: "store-1", name: "Pork Sinigang Meal", price: 139, imageLabel: "🍲" },
  { id: "prod-3", storeId: "store-2", name: "Fresh Bangus (1kg)", price: 180, imageLabel: "🐟" },
  { id: "prod-4", storeId: "store-2", name: "Red Rice (5kg)", price: 250, imageLabel: "🍚" },
  { id: "prod-5", storeId: "store-3", name: "Claw Hammer", price: 320, imageLabel: "🔨" },
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
