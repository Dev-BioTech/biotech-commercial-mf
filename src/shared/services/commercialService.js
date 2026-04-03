import apiClient from "@/shared/utils/apiClient";

/**
 * Commercial Service — Transactions & Third Parties
 *
 * baseURL = https://...nip.io/api  →  paths start with /v1/
 * Ocelot upstream routes:
 *   /api/v1/transactions/{everything}  → commercial-service
 *   /api/v1/third-parties/{everything} → commercial-service
 *
 * The apiClient interceptor injects:
 *   Authorization: Bearer <token>
 *   X-Farm-Id: <selectedFarm.id>
 *   ?farmId=<id>  (for GET requests)
 */
export const commercialService = {

  // ── TRANSACTIONS ────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/transactions
   */
  createTransaction: async (transactionData) => {
    const response = await apiClient.post("/v1/transactions", transactionData);
    return response.data?.data ?? response.data;
  },

  /**
   * GET /api/v1/transactions
   * @param {object} filters - { fromDate, toDate, type, page, pageSize }
   */
  getTransactions: async (filters = {}) => {
    const response = await apiClient.get("/v1/transactions", { params: filters });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
  },

  /**
   * GET /api/v1/transactions/{id}
   */
  getTransactionById: async (id) => {
    const response = await apiClient.get(`/v1/transactions/${id}`);
    return response.data?.data ?? response.data;
  },

  /**
   * GET /api/v1/transactions/{id}/animals
   */
  getTransactionAnimals: async (id) => {
    const response = await apiClient.get(`/v1/transactions/${id}/animals`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
  },

  /**
   * GET /api/v1/transactions/{id}/products
   */
  getTransactionProducts: async (id) => {
    const response = await apiClient.get(`/v1/transactions/${id}/products`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
  },

  // ── THIRD PARTIES ────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/third-parties
   * @param {object} filters - { isSupplier, isCustomer, page, pageSize }
   */
  getThirdParties: async (filters = {}) => {
    const response = await apiClient.get("/v1/third-parties", { params: filters });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
  },

  /**
   * GET /api/v1/third-parties/{id}
   */
  getThirdPartyById: async (id) => {
    const response = await apiClient.get(`/v1/third-parties/${id}`);
    return response.data?.data ?? response.data;
  },

  /**
   * POST /api/v1/third-parties
   */
  createThirdParty: async (thirdPartyData) => {
    const response = await apiClient.post("/v1/third-parties", thirdPartyData);
    return response.data?.data ?? response.data;
  },

  /**
   * PUT /api/v1/third-parties/{id}
   */
  updateThirdParty: async (id, thirdPartyData) => {
    const response = await apiClient.put(`/v1/third-parties/${id}`, thirdPartyData);
    return response.data?.data ?? response.data;
  },
};

export default commercialService;
