import apiClient from "../utils/apiClient";

export const commercialService = {
  // ========== TRANSACTIONS ==========

  // POST /api/transactions - Create a new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await apiClient.post("/transactions", transactionData);
      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },

  // GET /api/transactions - Get transactions (Query: fromDate, toDate, type, page, pageSize)
  getTransactions: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.fromDate) params.append("fromDate", filters.fromDate);
      if (filters.toDate) params.append("toDate", filters.toDate);
      if (filters.type) params.append("type", filters.type);
      if (filters.page) params.append("page", filters.page);
      if (filters.pageSize) params.append("pageSize", filters.pageSize);

      const qs = params.toString();
      const response = await apiClient.get(
        `/transactions${qs ? `?${qs}` : ""}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    }
  },

  // GET /api/transactions/{id} - Get transaction by ID
  getTransactionById: async (id) => {
    try {
      const response = await apiClient.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  },

  // GET /api/transactions/{id}/animals - Get animals involved in a transaction
  getTransactionAnimals: async (id) => {
    try {
      const response = await apiClient.get(`/transactions/${id}/animals`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching animals for transaction ${id}:`, error);
      throw error;
    }
  },

  // GET /api/transactions/{id}/products - Get products involved in a transaction
  getTransactionProducts: async (id) => {
    try {
      const response = await apiClient.get(`/transactions/${id}/products`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for transaction ${id}:`, error);
      throw error;
    }
  },

  // ========== THIRD PARTIES ==========

  // POST /api/third-parties - Create a third party (customer/supplier)
  createThirdParty: async (thirdPartyData) => {
    try {
      const response = await apiClient.post("/third-parties", thirdPartyData);
      return response.data;
    } catch (error) {
      console.error("Error creating third party:", error);
      throw error;
    }
  },

  // PUT /api/third-parties/{id} - Update a third party
  updateThirdParty: async (id, thirdPartyData) => {
    try {
      const response = await apiClient.put(
        `/third-parties/${id}`,
        thirdPartyData,
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating third party ${id}:`, error);
      throw error;
    }
  },

  // GET /api/third-parties - Get third parties
  getThirdParties: async () => {
    try {
      const response = await apiClient.get("/third-parties");
      return response.data;
    } catch (error) {
      console.error("Error fetching third parties:", error);
      throw error;
    }
  },

  // GET /api/third-parties/{id} - Get third party by ID
  getThirdPartyById: async (id) => {
    try {
      const response = await apiClient.get(`/third-parties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching third party ${id}:`, error);
      throw error;
    }
  },
};

export default commercialService;
