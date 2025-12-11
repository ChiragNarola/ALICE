import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

// Request interceptor to attach token
const getStoredItem = (key: string): string | null => {
  return sessionStorage.getItem(key) || localStorage.getItem(key);
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    axiosInstance.interceptors.request.use(
      (config) => {
        const token = getStoredItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        // 🔥 Do not set Content-Type manually
        return config;
      },
      (error) => Promise.reject(error)
    );


    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
