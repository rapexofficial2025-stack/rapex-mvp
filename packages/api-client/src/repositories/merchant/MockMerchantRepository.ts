import type { MerchantRepository } from "./MerchantRepository";
import type { MerchantOrder, MerchantProfile, ProductSummary } from "../types";

const MOCK_DELAY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

const profile: MerchantProfile = { id: "merchant-1", storeName: "Amy's Carinderia", approvalStatus: "approved" };

const products: ProductSummary[] = [
  { id: "prod-1", storeId: "merchant-1", name: "Chicken Adobo Meal", price: 129, imageLabel: "🍗", productCategory: "Rice Meals" },
  { id: "prod-2", storeId: "merchant-1", name: "Pork Sinigang Meal", price: 139, imageLabel: "🍲", productCategory: "Rice Meals" },
];

const orders: MerchantOrder[] = [
  { id: "order-2001", storeName: profile.storeName, status: "pending", total: 268, placedAt: new Date().toISOString(), itemCount: 2, customerName: "Juan dela Cruz" },
];

/** Stands in for the real Xano-backed MerchantRepository until that API contract is provided. */
export class MockMerchantRepository implements MerchantRepository {
  async getMyProfile(): Promise<MerchantProfile> {
    return delay(profile);
  }

  async getMyProducts(): Promise<ProductSummary[]> {
    return delay(products);
  }

  async createProduct(input: { name: string; price: number }): Promise<ProductSummary> {
    const product: ProductSummary = {
      id: `prod-${products.length + 1}`,
      storeId: profile.id,
      name: input.name,
      price: input.price,
      imageLabel: "🛍️",
      productCategory: "Uncategorized",
    };
    products.push(product);
    return delay(product);
  }

  async updateProduct(productId: string, input: { name?: string; price?: number }): Promise<ProductSummary> {
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error(`Product ${productId} not found`);
    if (input.name) product.name = input.name;
    if (input.price) product.price = input.price;
    return delay(product);
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
