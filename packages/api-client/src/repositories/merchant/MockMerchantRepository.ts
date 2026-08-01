import type {
  CreateProductInput,
  CreateStoreInput,
  CreateVariantInput,
  MerchantRepository,
  UpdateProductInput,
  UpdateStoreInput,
  UpdateVariantInput,
} from "./MerchantRepository";
import type { MerchantAccount, MerchantOrder, MerchantProduct, MerchantStore, ProductVariant } from "../types";

const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

let nextId = 1000;
function generateId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

const account: MerchantAccount = {
  id: "merchant-account-1",
  ownerName: "Amy Villanueva",
  email: "amy@example.com",
  verificationStatus: "verified",
};

const stores: MerchantStore[] = [
  {
    id: "ms-1",
    merchantAccountId: account.id,
    name: "Amy's Carinderia",
    category: "Food",
    status: "online",
    approvalStatus: "approved",
    address: "Anabu I-A, Imus, Cavite",
    coverageRadiusKm: 3,
    rating: 4.9,
    productCount: 0,
  },
  {
    id: "ms-2",
    merchantAccountId: account.id,
    name: "Amy's Grocery Corner",
    category: "Grocery",
    status: "offline",
    approvalStatus: "pending",
    address: "Anabu I-A, Imus, Cavite",
    coverageRadiusKm: 2,
    rating: 0,
    productCount: 0,
  },
];

const products: MerchantProduct[] = [
  { id: "mp-1", storeId: "ms-1", name: "Chicken Adobo Meal", price: 129, imageLabel: "🍗", productCategory: "Rice Meals", stock: 30, isActive: true, variantCount: 2 },
  { id: "mp-2", storeId: "ms-1", name: "Pork Sinigang Meal", price: 139, imageLabel: "🍲", productCategory: "Rice Meals", stock: 22, isActive: true, variantCount: 0 },
  { id: "mp-3", storeId: "ms-1", name: "Grilled Pork Belly", price: 159, imageLabel: "🥓", productCategory: "Grilled", stock: 15, isActive: true, variantCount: 2 },
  { id: "mp-4", storeId: "ms-2", name: "Fresh Bangus (1kg)", price: 180, imageLabel: "🐟", productCategory: "Fresh Seafood", stock: 0, isActive: false, variantCount: 0 },
  { id: "mp-5", storeId: "ms-2", name: "Red Rice (5kg)", price: 250, imageLabel: "🍚", productCategory: "Staples", stock: 40, isActive: true, variantCount: 0 },
];

const variants: ProductVariant[] = [
  { id: "mv-1", productId: "mp-1", name: "Regular", priceDelta: 0, stock: 20, sku: "ADB-REG" },
  { id: "mv-2", productId: "mp-1", name: "Large", priceDelta: 30, stock: 10, sku: "ADB-LRG" },
  { id: "mv-3", productId: "mp-3", name: "250g", priceDelta: 0, stock: 15, sku: "GPB-250" },
  { id: "mv-4", productId: "mp-3", name: "500g", priceDelta: 80, stock: 8, sku: "GPB-500" },
];

const orders: MerchantOrder[] = [
  {
    id: "order-2001",
    storeName: stores[0]!.name,
    status: "pending",
    total: 268,
    placedAt: "2026-08-01T09:20:00.000Z",
    itemCount: 2,
    customerName: "Juan dela Cruz",
  },
];

function syncProductCounts() {
  for (const store of stores) {
    store.productCount = products.filter((p) => p.storeId === store.id).length;
  }
}
syncProductCounts();

/** Stands in for the real Xano-backed MerchantRepository until that API contract is provided. */
export class MockMerchantRepository implements MerchantRepository {
  async getMyAccount(): Promise<MerchantAccount> {
    return delay(account);
  }

  async getMyStores(): Promise<MerchantStore[]> {
    return delay(stores);
  }

  async getStoreById(storeId: string): Promise<MerchantStore | null> {
    return delay(stores.find((s) => s.id === storeId) ?? null);
  }

  async createStore(input: CreateStoreInput): Promise<MerchantStore> {
    const store: MerchantStore = {
      id: generateId("ms"),
      merchantAccountId: account.id,
      name: input.name,
      category: input.category,
      status: "offline",
      approvalStatus: "pending",
      address: input.address,
      coverageRadiusKm: 2,
      rating: 0,
      productCount: 0,
    };
    stores.push(store);
    return delay(store);
  }

  async updateStore(storeId: string, input: UpdateStoreInput): Promise<MerchantStore> {
    const store = stores.find((s) => s.id === storeId);
    if (!store) throw new Error(`Store ${storeId} not found`);
    Object.assign(store, input);
    return delay(store);
  }

  async toggleStoreStatus(storeId: string): Promise<MerchantStore> {
    const store = stores.find((s) => s.id === storeId);
    if (!store) throw new Error(`Store ${storeId} not found`);
    store.status = store.status === "online" ? "offline" : "online";
    return delay(store);
  }

  async getStoreProducts(storeId: string): Promise<MerchantProduct[]> {
    return delay(products.filter((p) => p.storeId === storeId));
  }

  async createProduct(storeId: string, input: CreateProductInput): Promise<MerchantProduct> {
    if (!stores.some((s) => s.id === storeId)) throw new Error(`Store ${storeId} not found`);
    const product: MerchantProduct = {
      id: generateId("mp"),
      storeId,
      name: input.name,
      price: input.price,
      imageLabel: "🛍️",
      productCategory: input.productCategory,
      stock: 0,
      isActive: true,
      variantCount: 0,
    };
    products.push(product);
    syncProductCounts();
    return delay(product);
  }

  async updateProduct(productId: string, input: UpdateProductInput): Promise<MerchantProduct> {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error(`Product ${productId} not found`);
    Object.assign(product, input);
    return delay(product);
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return delay(variants.filter((v) => v.productId === productId));
  }

  async createVariant(productId: string, input: CreateVariantInput): Promise<ProductVariant> {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error(`Product ${productId} not found`);
    const variant: ProductVariant = { id: generateId("mv"), productId, ...input };
    variants.push(variant);
    product.variantCount = variants.filter((v) => v.productId === productId).length;
    return delay(variant);
  }

  async updateVariant(variantId: string, input: UpdateVariantInput): Promise<ProductVariant> {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) throw new Error(`Variant ${variantId} not found`);
    Object.assign(variant, input);
    return delay(variant);
  }

  async deleteVariant(variantId: string): Promise<void> {
    const index = variants.findIndex((v) => v.id === variantId);
    if (index === -1) throw new Error(`Variant ${variantId} not found`);
    const [removed] = variants.splice(index, 1);
    const product = products.find((p) => p.id === removed!.productId);
    if (product) product.variantCount = variants.filter((v) => v.productId === product.id).length;
    return delay(undefined);
  }

  async getMyOrders(): Promise<MerchantOrder[]> {
    return delay(orders);
  }

  async acceptOrder(orderId: string): Promise<MerchantOrder> {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    order.status = "accepted";
    return delay(order);
  }

  async rejectOrder(orderId: string): Promise<MerchantOrder> {
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);
    order.status = "cancelled";
    return delay(order);
  }
}
