import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/refresh`,
            {
              refresh_token: refreshToken,
            },
          );

          const { access_token, refresh_token: new_refresh_token } = response.data;
          localStorage.setItem("access_token", access_token);
          localStorage.setItem('refresh_token', new_refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  login: (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);
    return api.post("/api/v1/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },

  register: (userData: {
    email: string;
    password: string;
    full_name?: string;
  }) => api.post("/api/v1/auth/register", userData),

  getProfile: () => api.get("/api/v1/auth/me"),

  refresh: (refresh_token: string) =>
    api.post("/api/v1/auth/refresh", { refresh_token }),

  logout: (refresh_token: string) =>
    api.post("/api/v1/auth/logout", { refresh_token }),
};

export const recipesAPI = {
  getAll: (params?: any) => api.get("/api/v1/recipes/", { params }),
  getById: (id: number) => api.get(`/api/v1/recipes/${id}`),
  search: (query: string) => api.post("/api/v1/recipes/search", { query }),
  create: (data: any) => api.post("/api/v1/recipes/", data),
};

export const articlesAPI = {
  getAll: (params?: any) => api.get("/api/v1/articles/", { params}),
  getById: (id: number) => api.get(`/api/v1/articles/${id}`),
};

export const menuAPI = {
  calculate: (data: any) => api.post("/api/v1/menu/calculate", data),
  getPlans: () => api.get("/api/v1/menu/plans"),
};

export const ordersAPI = {
  create: (orderData: any) => api.post("/api/v1/orders/create", orderData),
  getMyOrders: () => api.get("/api/v1/orders/my-orders"),
  getById: (id: number) => api.get(`/api/v1/orders/${id}`),
  cancel: (id: number) => api.put(`/api/v1/orders/${id}/cancel`),
};

export const aiAPI = {
  searchRecipes: (query: string, maxResults?: number) =>
    api.post("/api/v1/ai/search-recipes", {
      query,
      max_results: maxResults || 10,
    }),

  checkStatus: () => api.get("/api/v1/ai/ai-status"),

  generateMenu: (userData: any) =>
    api.post("/api/v1/ai/generate-menu-plan", userData),
};

export const adminAPI = {
  getDashboard: () => api.get("/api/v1/admin/dashboard"),

  getRecipes: () => api.get("/api/v1/admin/recipes"),
  createRecipe: (data: any) => api.post("/api/v1/admin/recipes", data),
  updateRecipe: (id: number, data: any) =>
    api.put(`/api/v1/admin/recipes/${id}`, data),
  deleteRecipe: (id: number) => api.delete(`/api/v1/admin/recipes/${id}`),

  getArticles: () => api.get("/api/v1/admin/articles"),
  createArticle: (data: any) => api.post("/api/v1/admin/articles", data),

  getMenuPlans: () => api.get("/api/v1/admin/menu-plans"),

  getOrders: () => api.get("/api/v1/admin/orders"),
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/api/v1/admin/orders/${id}/status?status=${status}`),

  getUsers: () => api.get("/api/v1/admin/users"),
  toggleUserActive: (id: number) =>
    api.put(`/api/v1/admin/users/${id}/toggle-active`),

  uploadImage: (formData: FormData) =>
    api.post('/api/v1/admin/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadPdf: (formData: FormData) =>
    api.post('/api/v1/admin/upload-pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
