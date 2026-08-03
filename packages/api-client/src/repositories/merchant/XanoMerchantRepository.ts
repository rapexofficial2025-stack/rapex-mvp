import type { HttpClient } from "../../core/httpClient";
import { MockMerchantRepository } from "./MockMerchantRepository";
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
  MerchantAccount,
  MerchantOrder,
  MerchantOrderFinancials,
  MerchantProduct,
  MerchantRegistrationDraft,
  MerchantStore,
  NearbyRider,
  ProductImportResult,
  ProductImportRow,
  ProductVariant,
  StoreExpansionRequest,
  StoreInsights,
  StoreSlot,
  StoreTimelineEvent,
} from "../types";

/** createStore/createProduct need real-world coordinates -- default to Imus, Cavite (RAPEX's pilot area) until the UI collects real GPS input. */
const DEFAULT_LATITUDE = 14.4297;
const DEFAULT_LONGITUDE = 120.936;

/**
 * Real Xano-backed MerchantRepository for the E2E Alpha flow only:
 * createStore + createProduct + getMyStores + getStoreProducts go to the
 * live `admin-master-data` group (base https://x8ki-letl-twmt.n7.xano.io/api:admin-master-data/,
 * handover 2026-08-03). Every other method delegates to MockMerchantRepository
 * unchanged -- those don't have a confirmed Xano contract yet, and the rest
 * of the merchant-portal (onboarding wizard, insights, expansion requests,
 * etc.) must keep working in the meantime.
 *
 * Known gap: the handover documented createStore/createProduct request
 * bodies but not their response shapes. Response mapping below tries the
 * documented field names first, falls back to common alternates, and must
 * be corrected against the real live response the first time this actually
 * runs successfully (blocked on signup being fixed as of this writing).
 */
export class XanoMerchantRepository implements MerchantRepository {
  private readonly fallback = new MockMerchantRepository();
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  async createStore(input: CreateStoreInput): Promise<MerchantStore> {
    const raw = await this.client.request<Record<string, unknown>>({
      path: "/stores",
      method: "POST",
      body: {
        store_name: input.name,
        latitude: DEFAULT_LATITUDE,
        longitude: DEFAULT_LONGITUDE,
        complete_address: input.address,
      },
    });

    return {
      id: String(raw.id ?? raw.store_id ?? raw.uuid ?? ""),
      merchantAccountId: String(raw.merchant_id ?? raw.user_id ?? ""),
      name: String(raw.store_name ?? input.name),
      category: input.category,
      status: "offline",
      approvalStatus: "pending",
      address: String(raw.complete_address ?? input.address),
      coverageRadiusKm: 2,
      rating: 0,
      description: "",
      phone: "",
      businessHours: "",
      logoLabel: "🏪",
      coverImageLabel: "🏪",
      latitude: Number(raw.latitude ?? DEFAULT_LATITUDE),
      longitude: Number(raw.longitude ?? DEFAULT_LONGITUDE),
      productCount: 0,
    };
  }

  async createProduct(storeId: string, input: CreateProductInput): Promise<MerchantProduct> {
    const raw = await this.client.request<Record<string, unknown>>({
      path: "/products",
      method: "POST",
      body: {
        name: input.name,
        price: input.price,
        store_id: storeId,
        stock: 0,
      },
    });

    return {
      id: String(raw.id ?? raw.product_id ?? raw.uuid ?? ""),
      storeId,
      name: String(raw.name ?? input.name),
      price: Number(raw.price ?? input.price),
      imageLabel: "🛍️",
      productCategory: input.productCategory,
      stock: Number(raw.stock ?? 0),
      isActive: true,
      variantCount: 0,
    };
  }

  async getMyStores(): Promise<MerchantStore[]> {
    // GET /admin-master-data/stores wasn't in the handover -- delegate until confirmed.
    return this.fallback.getMyStores();
  }

  async getStoreProducts(storeId: string): Promise<MerchantProduct[]> {
    return this.fallback.getStoreProducts(storeId);
  }

  // ---- Everything below: no confirmed Xano contract yet, Mock passthrough ----

  getMyAccount(): Promise<MerchantAccount> {
    return this.fallback.getMyAccount();
  }
  getRegistrationDraft(): Promise<MerchantRegistrationDraft> {
    return this.fallback.getRegistrationDraft();
  }
  saveRegistrationDraft(input: SaveRegistrationDraftInput): Promise<MerchantRegistrationDraft> {
    return this.fallback.saveRegistrationDraft(input);
  }
  addDraftProduct(input: AddDraftProductInput): Promise<MerchantRegistrationDraft> {
    return this.fallback.addDraftProduct(input);
  }
  removeDraftProduct(draftProductId: string): Promise<MerchantRegistrationDraft> {
    return this.fallback.removeDraftProduct(draftProductId);
  }
  submitRegistration(): Promise<MerchantRegistrationDraft> {
    return this.fallback.submitRegistration();
  }
  getStoreSlots(): Promise<StoreSlot[]> {
    return this.fallback.getStoreSlots();
  }
  getStoreById(storeId: string): Promise<MerchantStore | null> {
    return this.fallback.getStoreById(storeId);
  }
  updateStore(storeId: string, input: UpdateStoreInput): Promise<MerchantStore> {
    return this.fallback.updateStore(storeId, input);
  }
  toggleStoreStatus(storeId: string): Promise<MerchantStore> {
    return this.fallback.toggleStoreStatus(storeId);
  }
  updateProduct(productId: string, input: UpdateProductInput): Promise<MerchantProduct> {
    return this.fallback.updateProduct(productId, input);
  }
  bulkImportProducts(storeId: string, rows: ProductImportRow[]): Promise<ProductImportResult> {
    return this.fallback.bulkImportProducts(storeId, rows);
  }
  getProductVariants(productId: string): Promise<ProductVariant[]> {
    return this.fallback.getProductVariants(productId);
  }
  createVariant(productId: string, input: CreateVariantInput): Promise<ProductVariant> {
    return this.fallback.createVariant(productId, input);
  }
  updateVariant(variantId: string, input: UpdateVariantInput): Promise<ProductVariant> {
    return this.fallback.updateVariant(variantId, input);
  }
  deleteVariant(variantId: string): Promise<void> {
    return this.fallback.deleteVariant(variantId);
  }
  getStoreExpansionRequests(storeId: string): Promise<StoreExpansionRequest[]> {
    return this.fallback.getStoreExpansionRequests(storeId);
  }
  createExpansionRequest(storeId: string, input: CreateExpansionRequestInput): Promise<StoreExpansionRequest> {
    return this.fallback.createExpansionRequest(storeId, input);
  }
  getNearbyRiders(storeId: string): Promise<NearbyRider[]> {
    return this.fallback.getNearbyRiders(storeId);
  }
  getStoreInsights(storeId: string): Promise<StoreInsights> {
    return this.fallback.getStoreInsights(storeId);
  }
  getStoreTimeline(storeId: string): Promise<StoreTimelineEvent[]> {
    return this.fallback.getStoreTimeline(storeId);
  }
  getMyOrders(): Promise<MerchantOrder[]> {
    return this.fallback.getMyOrders();
  }
  acceptOrder(orderId: string): Promise<MerchantOrder> {
    return this.fallback.acceptOrder(orderId);
  }
  rejectOrder(orderId: string): Promise<MerchantOrder> {
    return this.fallback.rejectOrder(orderId);
  }
  getOrderFinancials(storeId: string): Promise<MerchantOrderFinancials[]> {
    return this.fallback.getOrderFinancials(storeId);
  }
}
