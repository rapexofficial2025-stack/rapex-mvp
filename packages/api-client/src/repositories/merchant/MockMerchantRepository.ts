import { calculateOrderFinancials } from "@rapex/utils";
import type {
  AddDraftProductInput,
  CreateExpansionRequestInput,
  CreateProductInput,
  CreateStoreInput,
  CreateVariantInput,
  MerchantRepository,
  SaveRegistrationDraftInput,
  UpdateProductInput,
  UpdateStoreInput,
  UpdateVariantInput,
} from "./MerchantRepository";
import type {
  CreateVoucherInput,
  MerchantAccount,
  MerchantOrder,
  MerchantOrderFinancials,
  MerchantProduct,
  MerchantRegistrationDraft,
  MerchantStore,
  MerchantVoucher,
  NearbyRider,
  ProductImportResult,
  ProductImportRow,
  ProductVariant,
  StoreExpansionRequest,
  StoreInsights,
  StoreSlot,
  StoreTimelineEvent,
} from "../types";

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
  ownerName: "Juan Dela Cruz",
  email: "juan@example.com",
  verificationStatus: "verified",
  onboardingStatus: "approved",
  level: 15,
  xp: 340,
  xpForNextLevel: 500,
};

function blankRegistrationDraft(): MerchantRegistrationDraft {
  return {
    merchantAccountId: account.id,
    currentStep: 1,
    onboardingStatus: "draft",
    fullName: account.ownerName,
    birthday: "",
    mobileNumber: "",
    email: account.email,
    residentialAddress: "",
    govIdUploaded: false,
    selfieUploaded: false,
    mobileOtpVerified: false,
    emailVerified: false,
    businessCategory: null,
    businessNature: null,
    storeName: "",
    branchName: "",
    storeDescription: "",
    businessContactNumber: "",
    businessEmail: "",
    businessHours: "",
    operatingDays: [],
    deliveryAvailable: true,
    pickupAvailable: true,
    storeAddress: "",
    latitude: null,
    longitude: null,
    businessStructure: null,
    mayorsPermitUploaded: false,
    birRegistrationUploaded: false,
    tin: "",
    vatStatus: null,
    supportingDocumentsUploaded: false,
    logoUploaded: false,
    coverPhotoUploaded: false,
    galleryImageCount: 0,
    draftProducts: [],
  };
}

let registrationDraft: MerchantRegistrationDraft = blankRegistrationDraft();

const STORE_SLOT_UNLOCK_LEVELS = [1, 1, 1, 20, 25, 30, 35, 40, 45, 50];

function grantXp(amount: number) {
  account.xp += amount;
  while (account.xp >= account.xpForNextLevel) {
    account.xp -= account.xpForNextLevel;
    account.level += 1;
    account.xpForNextLevel = account.level * 200;
  }
}

const stores: MerchantStore[] = [
  {
    id: "ms-1",
    merchantAccountId: account.id,
    name: "JB Grocery",
    category: "Grocery",
    status: "online",
    approvalStatus: "approved",
    address: "Imus, Cavite",
    coverageRadiusKm: 3,
    rating: 4.8,
    productCount: 0,
    description: "Everyday grocery essentials, fresh produce, and pantry staples.",
    phone: "+63 917 123 4567",
    businessHours: "Mon-Sun, 7:00 AM - 8:00 PM",
    logoLabel: "🛒",
    coverImageLabel: "🏬",
    latitude: 14.4297,
    longitude: 120.936,
  },
  {
    id: "ms-2",
    merchantAccountId: account.id,
    name: "JB's Hardware",
    category: "Hardware",
    status: "online",
    approvalStatus: "approved",
    address: "Alapan, Imus, Cavite",
    coverageRadiusKm: 2,
    rating: 4.6,
    productCount: 0,
    description: "Hardware, tools, and construction supplies.",
    phone: "+63 917 765 4321",
    businessHours: "Mon-Sat, 8:00 AM - 6:00 PM",
    logoLabel: "🛠",
    coverImageLabel: "🏬",
    latitude: 14.4285,
    longitude: 120.9351,
  },
  {
    id: "ms-3",
    merchantAccountId: account.id,
    name: "Jenny's Carenderia",
    category: "Food",
    status: "online",
    approvalStatus: "approved",
    address: "Lancaster, General Trias, Cavite",
    coverageRadiusKm: 3,
    rating: 4.9,
    productCount: 0,
    description: "Home-style Filipino comfort food, cooked fresh every day.",
    phone: "+63 917 555 8888",
    businessHours: "Mon-Sun, 6:00 AM - 8:00 PM",
    logoLabel: "🍲",
    coverImageLabel: "🏠",
    latitude: 14.339,
    longitude: 120.882,
  },
];

const products: MerchantProduct[] = [
  { id: "mp-1", storeId: "ms-1", name: "Rice", price: 55, imageLabel: "🍚", productCategory: "Staples", stock: 40, isActive: true, variantCount: 2 },
  { id: "mp-2", storeId: "ms-1", name: "Cooking Oil", price: 95, imageLabel: "🛢️", productCategory: "Staples", stock: 25, isActive: true, variantCount: 0 },
  { id: "mp-3", storeId: "ms-1", name: "Eggs", price: 8, imageLabel: "🥚", productCategory: "Fresh", stock: 120, isActive: true, variantCount: 0 },
  { id: "mp-4", storeId: "ms-1", name: "Milk", price: 65, imageLabel: "🥛", productCategory: "Dairy", stock: 30, isActive: true, variantCount: 0 },
  { id: "mp-5", storeId: "ms-1", name: "Soft Drinks", price: 45, imageLabel: "🥤", productCategory: "Beverages", stock: 3, isActive: true, variantCount: 0 },
  { id: "mp-6", storeId: "ms-2", name: "Hammer", price: 250, imageLabel: "🔨", productCategory: "Hand Tools", stock: 12, isActive: true, variantCount: 0 },
  { id: "mp-7", storeId: "ms-2", name: "Nails", price: 60, imageLabel: "📌", productCategory: "Fasteners", stock: 200, isActive: true, variantCount: 0 },
  { id: "mp-8", storeId: "ms-2", name: "PVC Pipe", price: 180, imageLabel: "🧵", productCategory: "Plumbing", stock: 0, isActive: false, variantCount: 0 },
  { id: "mp-9", storeId: "ms-2", name: "Paint", price: 320, imageLabel: "🎨", productCategory: "Finishing", stock: 18, isActive: true, variantCount: 0 },
  { id: "mp-10", storeId: "ms-2", name: "Cement", price: 245, imageLabel: "🧱", productCategory: "Building Materials", stock: 5, isActive: true, variantCount: 0 },
  { id: "mp-11", storeId: "ms-3", name: "Chicken Adobo", price: 129, imageLabel: "🍗", productCategory: "Rice Meals", stock: 30, isActive: true, variantCount: 2 },
  { id: "mp-12", storeId: "ms-3", name: "Pork Sinigang", price: 139, imageLabel: "🍲", productCategory: "Rice Meals", stock: 22, isActive: true, variantCount: 0 },
  { id: "mp-13", storeId: "ms-3", name: "Beef Steak", price: 159, imageLabel: "🥩", productCategory: "Rice Meals", stock: 15, isActive: true, variantCount: 0 },
  { id: "mp-14", storeId: "ms-3", name: "Rice Meal", price: 99, imageLabel: "🍱", productCategory: "Rice Meals", stock: 40, isActive: true, variantCount: 0 },
  { id: "mp-15", storeId: "ms-3", name: "Halo Halo", price: 89, imageLabel: "🍧", productCategory: "Dessert", stock: 20, isActive: true, variantCount: 0 },
];

const variants: ProductVariant[] = [
  { id: "mv-1", productId: "mp-1", name: "5kg", priceDelta: 0, stock: 20, sku: "RICE-5KG" },
  { id: "mv-2", productId: "mp-1", name: "10kg", priceDelta: 50, stock: 10, sku: "RICE-10KG" },
  { id: "mv-3", productId: "mp-11", name: "Regular", priceDelta: 0, stock: 15, sku: "ADB-REG" },
  { id: "mv-4", productId: "mp-11", name: "Large", priceDelta: 30, stock: 8, sku: "ADB-LRG" },
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

const expansionRequests: StoreExpansionRequest[] = [
  {
    id: "exp-1",
    storeId: "ms-1",
    type: "coverage-increase",
    proposedAddress: null,
    requestedCoverageRadiusKm: 5,
    note: "Getting steady orders from Bayan Luma, just outside our current radius.",
    status: "pending",
    submittedAt: "2026-07-28T03:00:00.000Z",
  },
];

const NEARBY_RIDERS: NearbyRider[] = [
  { id: "rider-1", name: "Mark Santos", vehicleType: "Motorcycle", distanceKm: 0.6, rating: 4.9, availability: "available" },
  { id: "rider-2", name: "Jenny Reyes", vehicleType: "Motorcycle", distanceKm: 1.1, rating: 4.8, availability: "available" },
  { id: "rider-3", name: "Paolo Cruz", vehicleType: "Bicycle", distanceKm: 1.4, rating: 4.6, availability: "busy" },
  { id: "rider-4", name: "Liza Ramos", vehicleType: "Motorcycle", distanceKm: 2.2, rating: 4.7, availability: "offline" },
];

const storeTimelines: Record<string, StoreTimelineEvent[]> = {
  "ms-1": [
    { id: "tl-1", storeId: "ms-1", type: "store", message: "Store approved by RAPEX Admin.", occurredAt: "2026-07-10T02:00:00.000Z" },
    { id: "tl-2", storeId: "ms-1", type: "product", message: "Added \"Chicken Adobo Meal\" to the menu.", occurredAt: "2026-07-12T05:30:00.000Z" },
    { id: "tl-3", storeId: "ms-1", type: "order", message: "Completed order #2001 for Juan dela Cruz.", occurredAt: "2026-07-30T09:45:00.000Z" },
    { id: "tl-4", storeId: "ms-1", type: "system", message: "Store went online.", occurredAt: "2026-08-01T00:15:00.000Z" },
  ],
  "ms-2": [
    { id: "tl-5", storeId: "ms-2", type: "store", message: "Store submitted for approval.", occurredAt: "2026-07-25T04:00:00.000Z" },
  ],
};

/** Delivery Fee Engine settlements, seeded per store using the same formula rider/customer/admin screens use. */
const vouchers: MerchantVoucher[] = [];

const orderFinancialsByStoreId: Record<string, MerchantOrderFinancials[]> = {
  "ms-1": [
    { orderId: "order-6001", distanceKm: 1.8, ...toMerchantView(calculateOrderFinancials({ orderId: "order-6001", distanceKm: 1.8, productTotal: 163 })) },
    { orderId: "order-6002", distanceKm: 3.8, ...toMerchantView(calculateOrderFinancials({ orderId: "order-6002", distanceKm: 3.8, productTotal: 218 })) },
  ],
  "ms-2": [{ orderId: "order-6003", distanceKm: 2.5, ...toMerchantView(calculateOrderFinancials({ orderId: "order-6003", distanceKm: 2.5, productTotal: 505 })) }],
  "ms-3": [
    { orderId: "order-6004", distanceKm: 2.5, ...toMerchantView(calculateOrderFinancials({ orderId: "order-6004", distanceKm: 2.5, productTotal: 129 })) },
    { orderId: "order-6005", distanceKm: 5.2, ...toMerchantView(calculateOrderFinancials({ orderId: "order-6005", distanceKm: 5.2, productTotal: 347 })) },
  ],
};

function toMerchantView(financials: ReturnType<typeof calculateOrderFinancials>): Omit<MerchantOrderFinancials, "orderId" | "distanceKm"> {
  return { deliveryFee: financials.deliveryFee, customerPayment: financials.finalTotal, merchantReceives: financials.merchantReceives };
}

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

  async getRegistrationDraft(): Promise<MerchantRegistrationDraft> {
    return delay(registrationDraft);
  }

  async saveRegistrationDraft(input: SaveRegistrationDraftInput): Promise<MerchantRegistrationDraft> {
    registrationDraft = { ...registrationDraft, ...input };
    return delay(registrationDraft);
  }

  async addDraftProduct(input: AddDraftProductInput): Promise<MerchantRegistrationDraft> {
    const draftProduct = { id: generateId("dp"), ...input };
    registrationDraft = { ...registrationDraft, draftProducts: [...registrationDraft.draftProducts, draftProduct] };
    return delay(registrationDraft);
  }

  async removeDraftProduct(draftProductId: string): Promise<MerchantRegistrationDraft> {
    registrationDraft = {
      ...registrationDraft,
      draftProducts: registrationDraft.draftProducts.filter((p) => p.id !== draftProductId),
    };
    return delay(registrationDraft);
  }

  async submitRegistration(): Promise<MerchantRegistrationDraft> {
    const submitted = { ...registrationDraft, onboardingStatus: "submitted" as const };
    registrationDraft = submitted;

    const newStore: MerchantStore = {
      id: generateId("ms"),
      merchantAccountId: account.id,
      name: submitted.storeName || submitted.businessNature || "New Business",
      category: submitted.businessCategory ?? "shop",
      status: "offline",
      approvalStatus: "approved",
      address: submitted.storeAddress,
      coverageRadiusKm: 2,
      rating: 0,
      productCount: 0,
      description: submitted.storeDescription,
      phone: submitted.businessContactNumber,
      businessHours: submitted.businessHours,
      logoLabel: "🏪",
      coverImageLabel: "🏪",
      latitude: submitted.latitude ?? 14.4297,
      longitude: submitted.longitude ?? 120.936,
    };
    stores.push(newStore);

    for (const draftProduct of submitted.draftProducts) {
      products.push({
        id: generateId("mp"),
        storeId: newStore.id,
        name: draftProduct.name,
        price: draftProduct.price,
        imageLabel: "🛍️",
        productCategory: draftProduct.productCategory || "Uncategorized",
        stock: 0,
        isActive: true,
        variantCount: 0,
      });
    }
    syncProductCounts();

    grantXp(150);
    registrationDraft = { ...blankRegistrationDraft(), onboardingStatus: "approved" };
    return delay({ ...submitted, onboardingStatus: "approved" });
  }

  async getStoreSlots(): Promise<StoreSlot[]> {
    const slots: StoreSlot[] = STORE_SLOT_UNLOCK_LEVELS.map((unlockLevel, index) => {
      const store = stores[index] ?? null;
      const status = store ? "unlocked" : account.level >= unlockLevel ? "available" : "locked";
      return {
        index,
        label: index === 0 ? "Main Store" : `Branch ${index}`,
        status,
        unlockLevel,
        store,
      };
    });
    return delay(slots);
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
      description: "",
      phone: "",
      businessHours: "",
      logoLabel: "🏪",
      coverImageLabel: "🏪",
      latitude: 14.4297,
      longitude: 120.936,
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
      stock: input.stock ?? 0,
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

  async bulkImportProducts(storeId: string, rows: ProductImportRow[]): Promise<ProductImportResult> {
    if (!stores.some((s) => s.id === storeId)) throw new Error(`Store ${storeId} not found`);
    const imported: MerchantProduct[] = [];
    let failedCount = 0;
    for (const row of rows) {
      if (!row.name || !Number.isFinite(row.price)) {
        failedCount++;
        continue;
      }
      const product: MerchantProduct = {
        id: generateId("mp"),
        storeId,
        name: row.name,
        price: row.price,
        imageLabel: "🛍️",
        productCategory: row.productCategory || "Uncategorized",
        stock: Number.isFinite(row.stock) ? row.stock : 0,
        isActive: true,
        variantCount: 0,
      };
      products.push(product);
      imported.push(product);
    }
    syncProductCounts();
    return delay({ imported, failedCount });
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

  async getStoreExpansionRequests(storeId: string): Promise<StoreExpansionRequest[]> {
    return delay(expansionRequests.filter((r) => r.storeId === storeId));
  }

  async createExpansionRequest(storeId: string, input: CreateExpansionRequestInput): Promise<StoreExpansionRequest> {
    if (!stores.some((s) => s.id === storeId)) throw new Error(`Store ${storeId} not found`);
    const request: StoreExpansionRequest = {
      id: generateId("exp"),
      storeId,
      type: input.type,
      proposedAddress: input.proposedAddress ?? null,
      requestedCoverageRadiusKm: input.requestedCoverageRadiusKm ?? null,
      note: input.note,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };
    expansionRequests.push(request);
    return delay(request);
  }

  async getNearbyRiders(_storeId: string): Promise<NearbyRider[]> {
    return delay(NEARBY_RIDERS);
  }

  async getStoreInsights(storeId: string): Promise<StoreInsights> {
    const storeProducts = products.filter((p) => p.storeId === storeId);
    const totalRevenue = storeProducts.reduce((sum, p) => sum + p.price * Math.max(0, 30 - p.stock), 0);
    const totalOrders = Math.max(1, storeProducts.length * 4);
    const topProducts = [...storeProducts]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5)
      .map((p) => ({ productId: p.id, name: p.name, unitsSold: Math.max(0, 30 - p.stock), revenue: p.price * Math.max(0, 30 - p.stock) }));
    const last7DaysRevenue = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 6, 26 + i)).toISOString(),
      revenue: Math.round((totalRevenue / 7) * (0.7 + 0.1 * i)),
    }));
    return delay({
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      completionRate: 0.94,
      last7DaysRevenue,
      topProducts,
    });
  }

  async getStoreTimeline(storeId: string): Promise<StoreTimelineEvent[]> {
    return delay(storeTimelines[storeId] ?? []);
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

  async getOrderFinancials(storeId: string): Promise<MerchantOrderFinancials[]> {
    return delay(orderFinancialsByStoreId[storeId] ?? []);
  }

  async getMyVouchers(storeId: string): Promise<MerchantVoucher[]> {
    return delay(vouchers.filter((v) => v.storeId === storeId));
  }

  async createVoucher(storeId: string, input: CreateVoucherInput): Promise<MerchantVoucher> {
    const voucher: MerchantVoucher = {
      id: generateId("voucher"),
      storeId,
      code: input.code.trim().toUpperCase(),
      discountType: input.discountType,
      discountValue: input.discountValue,
      minOrderAmount: input.minOrderAmount,
      usageLimit: input.usageLimit,
      usedCount: 0,
      expiresAt: input.expiresAt,
      active: true,
      createdAt: new Date().toISOString(),
    };
    vouchers.push(voucher);
    return delay(voucher);
  }

  async deactivateVoucher(voucherId: string): Promise<MerchantVoucher> {
    const voucher = vouchers.find((v) => v.id === voucherId);
    if (!voucher) throw new Error(`Voucher ${voucherId} not found`);
    voucher.active = false;
    return delay(voucher);
  }
}
