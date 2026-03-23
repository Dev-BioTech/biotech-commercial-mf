import apiClient from "@shared/utils/apiClient";

/**
 * Sales Service
 * Gateway route: /api/v1/sales/{everything}
 * ⚠️ Requires backend: SalesController [Route("api/v1/sales")] + ocelot.json entry
 */
export const salesService = {
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
  createSale: async (data) => {
    const response = await apiClient.post("/v1/sales", data);
    return response.data?.data ?? response.data;
  },

  // PUT /api/v1/sales/{id}
  updateSale: async (id, data) => {
    const response = await apiClient.put(`/v1/sales/${id}`, data);
    return response.data?.data ?? response.data;
  },

  // DELETE /api/v1/sales/{id}
  deleteSale: async (id) => {
    const response = await apiClient.delete(`/v1/sales/${id}`);
    return response.data;
  },
};

export default salesService;

