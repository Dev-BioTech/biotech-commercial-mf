import { useState, useEffect, useCallback } from "react";
import { commercialService } from "@/shared/services/commercialService";

/**
 * Hook to fetch and manage third parties (clients & suppliers).
 * The apiClient automatically injects Authorization + X-Farm-Id + farmId query param.
 */
export const useThirdParties = (initialFilters = {}) => {
  const [thirdParties, setThirdParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchThirdParties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await commercialService.getThirdParties({ ...filters, page: 1, pageSize: 1000 });
      if (Array.isArray(data)) {
        setThirdParties(data);
      } else {
        setThirdParties(data?.data ?? data?.items ?? []);
      }
    } catch (err) {
      console.error("[useThirdParties] Error:", err);
      setError("Error al cargar terceros.");
      setThirdParties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchThirdParties();
  }, [fetchThirdParties]);

  return {
    thirdParties,
    loading,
    error,
    refetch: fetchThirdParties,
    setFilters,
  };
};
