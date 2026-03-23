import apiClient from "../utils/apiClient";

/**
 * Commercial Service — Transactions, Third Parties & Sales
 * All paths use /v1/ prefix matching ocelot.json upstream routes.
 */
export const commercialService = {

  // ── TRANSACTIONS ─────────────────────────────────────────────────────────

  // POST /api/v1/transactions
  createTransaction: async (transactionData) => {
    const response = await apiClient.post("/v1/transactions", transactionData);
    return response.data?.data ?? response.data;
  },

  // GET /api/v1/transactions?fromDate=&toDate=&type=&page=&pageSize=
  getTransactions: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.fromDate) params.append("fromDate", filters.fromDate);
    if (filters.toDate) params.append("toDate", filters.toDate);
    if (filters.type) params.append("type", filters.type);
    if (filters.page) params.append("page", filters.page);
    if (filters.pageSize) params.append("pageSize", filters.pageSize);
    const qs = params.toString();
    const response = await apiClient.get(`/v1/transactions${qs ? `?${qs}` : ""}`);
    return response.data?.data ?? response.data;
  },

  // GET /api/v1/transactions/{id}
  getTransactionById: async (id) => {
    const response = await apiClient.get(`/v1/transactions/${id}`);
    return response.data?.data ?? response.data;
  },

  // GET /api/v1/transactions/{id}/animals
  getTransactionAnimals: async (id) => {
    const response = await apiClient.get(`/v1/transactions/${id}/animals`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
  },

  // GET /api/v1/transactions/{id}/products
  getTransactionProducts: async (id) => {
    const response = await apiClient.get(`/v1/transactions/${id}/products`);
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
  },

  // ── THIRD PARTIES ─────────────────────────────────────────────────────────

  // GET /api/v1/third-parties?isSupplier=&isCustomer=&page=&pageSize=
  getThirdParties: async (filters = {}) => {
    const response = await apiClient.get("/v1/third-parties", { params: filters });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
  },

  // GET /api/v1/third-parties/{id}
  getThirdPartyById: async (id) => {
    const response = await apiClient.get(`/v1/third-parties/${id}`);
    return response.data?.data ?? response.data;
  },

  // POST /api/v1/third-parties
  createThirdParty: async (thirdPartyData) => {
    const response = await apiClient.post("/v1/third-parties", thirdPartyData);
    return response.data?.data ?? response.data;
  },

  // PUT /api/v1/third-parties/{id}
  updateThirdParty: async (id, thirdPartyData) => {
    const response = await apiClient.put(`/v1/third-parties/${id}`, thirdPartyData);
    return response.data?.data ?? response.data;
  },

  // DELETE /api/v1/third-parties/{id}  ⚠️ backend must add this endpoint
  deleteThirdParty: async (id) => {
    const response = await apiClient.delete(`/v1/third-parties/${id}`);
    return response.data;
  },

  // ── SALES ─────────────────────────────────────────────────────────────────
  // ⚠️ Requires: SalesController [Route("api/v1/sales")] + ocelot.json route

  // GET /api/v1/sales
  getSales: async (filters = {}) => {
    const response = await apiClient.get("/v1/sales", { params: filters });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
  },

  // GET /api/v1/sales/{id}
  getSaleById: async (id) => {
    const response = await apiClient.get(`/v1/sales/${id}`);
    return response.data?.data ?? response.data;
  },

  // POST /api/v1/sales
  createSale: async (saleData) => {
    const response = await apiClient.post("/v1/sales", saleData);
    return response.data?.data ?? response.data;
  },

  // PUT /api/v1/sales/{id}
  updateSale: async (id, saleData) => {
    const response = await apiClient.put(`/v1/sales/${id}`, saleData);
    return response.data?.data ?? response.data;
  },

  // DELETE /api/v1/sales/{id}
  deleteSale: async (id) => {
    const response = await apiClient.delete(`/v1/sales/${id}`);
    return response.data;
  },
};

export default commercialService;
