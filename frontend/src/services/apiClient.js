import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT and simulated role from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("swiftride_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const simulatedRole = localStorage.getItem("swiftride_simulated_role");
  if (simulatedRole) config.headers["X-Simulated-Role"] = simulatedRole;

  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("swiftride_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
