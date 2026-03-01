import apiClient from "@shared/utils/apiClient";

/**
 * Sales Service — redirects to /api/transactions with type filter.
 * The backend does NOT have a separate /api/sales endpoint.
 * All sales are transactions, use type="sale" (or whatever the backend enum is).
 */
export const salesService = {
  // GET /api/transactions?type=sale
  getSales: async (filters = {}) => {
    const response = await apiClient.get("/transactions", {
      params: { ...filters, type: filters.type ?? "sale" },
    });
    return response.data;
  },

  // GET /api/transactions/{id}
  getSaleById: async (id) => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  // POST /api/transactions  (type: "sale" must be in the body)
  createSale: async (data) => {
    const response = await apiClient.post("/transactions", {
      ...data,
      type: data.type ?? "sale",
    });
    return response.data;
  },

  // No PUT/DELETE for transactions in the official API docs.
  // These will return an error until the backend adds them.
  updateSale: async (id, data) => {
    console.warn("PUT /transactions/{id} not in API docs — may fail");
    const response = await apiClient.put(`/transactions/${id}`, data);
    return response.data;
  },

  deleteSale: async (id) => {
    console.warn("DELETE /transactions/{id} not in API docs — may fail");
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  },
};

export default salesService;
