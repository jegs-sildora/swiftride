import api from "./apiClient";

const AuthService = {
  register: (data) => api.post("/auth/register", data),
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    if (res.data?.token)
      localStorage.setItem("swiftride_token", res.data.token);
    return res;
  },
  me: () => api.get("/auth/me"),
  refresh: () => api.post("/auth/refresh"),
  logout: async () => {
    await api.post("/auth/logout");
    localStorage.removeItem("swiftride_token");
  },
  isAuthenticated: () => !!localStorage.getItem("swiftride_token"),
};

export default AuthService;
