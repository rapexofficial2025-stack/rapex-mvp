import type { HttpClient } from "../../core/httpClient";
import type { WalletRepository } from "./WalletRepository";
import type { WalletSummary } from "../types";

/**
 * Real Xano-backed WalletRepository, wired per the 2026-08-04 handover
 * (base https://x8ki-letl-twmt.n7.xano.io/api:rapex-finance/):
 *
 *   GET /balance   -> "Standard Xano list return" (exact field names unconfirmed)
 *
 * Known gap (reported, not guessed around): no documented endpoint returns
 * transaction history, only a balance. `transactions` stays an empty array
 * until a real endpoint for it is confirmed, rather than inventing one.
 * This has not been tested against a live response yet -- unblocked once
 * the Xano draft is published and a real account can log in.
 */
export class XanoWalletRepository implements WalletRepository {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  async getWalletSummary(): Promise<WalletSummary> {
    const result = await this.client.request<{ balance: number }>({
      path: "/balance",
      method: "GET",
    });
    return { balance: result.balance, transactions: [] };
  }
}
