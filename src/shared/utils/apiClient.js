import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_GATEWAY_URL ||
  "https://api.biotech.159.54.176.254.nip.io/api";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        let rawFarmId = parsed?.state?.selectedFarm?.id;
        let cleanFarmId = null;

        if (rawFarmId) {
          // Si el ID es una cadena como "35:1", nos quedamos solo con la parte numérica "35"
          cleanFarmId = typeof rawFarmId === 'string' ? rawFarmId.split(":")[0] : rawFarmId;
        }

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (cleanFarmId) {
          config.headers["X-Farm-Id"] = cleanFarmId;
          // Automáticamente inyectar farmId en GET params si no existe
          if (config.method === "get") {
            config.params = { ...config.params, farmId: cleanFarmId };
          }
        }
      } catch (error) {
        console.error("Error parsing auth storage:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si recibimos 401, el token expiró o es inválido.
      // Cerraremos sesión para redirigir al login y limpiar el storage.
      localStorage.removeItem("auth-storage");
      window.dispatchEvent(new Event("auth-change"));
      
      // Intentar forzar redirección si estamos en el framework
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
