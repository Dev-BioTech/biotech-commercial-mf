import { useState, useEffect, useCallback } from "react";
import { commercialService } from "@/shared/services/commercialService";

/**
 * Hook to fetch and manage transactions.
 * The apiClient automatically injects Authorization + X-Farm-Id + farmId query param.
 * We do NOT need to wait for farmId here — the interceptor handles it.
 */
export const useTransactions = (initialFilters = {}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commercialService.getTransactions({ ...filters, page: 1, pageSize: 1000 });
      // Normalize response: could be array, { data: [] }, or { items: [] }
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions(data?.data ?? data?.items ?? []);
      }
    } catch (err) {
      console.error("[useTransactions] Error:", err);
      setError("Error al cargar transacciones.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    setFilters,
  };
};
