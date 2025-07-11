import axios from "axios";

const API_URL = `https://pixelcafe-fye3hqena8gwergr.chilecentral-01.azurewebsites.net/`; // URL base de la API
const API_CONFIG = `/config`;


export const api = axios.create({
  //baseURL: API_BASE_URL,
  baseURL: API_URL,
  headers: {
    // "Content-Type": "application/json",
  },
  credentials: true, //para que mande la cookie
  withCredentials: true //para que mande la cookie
});

const plainAxios = axios.create({
  baseURL: API_URL,
  withCredentials: true //para que mande la cookie
});

// Interceptor para agregar el token JWT en cada request
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  const configData = await getConfigData();
  if (configData && configData.nombreCafe) {
    config.headers["nombreCafe"] = configData.nombreCafe.replace(/\s+/g, '');
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      try {
        const userId = localStorage.getItem('userId');
        
        // Don't attempt refresh if we don't have a userId (not logged in yet)
        if (!userId) {
          localStorage.removeItem("token");
          return Promise.reject(error);
        }
        
        // Prevent infinite loop by checking if this is already a refresh request or already retried
        if (error.config.url && error.config.url.includes('/auth/refresh')) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          if (window.location.pathname !== '/login') {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
        
        // Don't retry if already retried
        if (error.config._retry) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          if (window.location.pathname !== '/login') {
            window.location.href = "/login";
          }
          return Promise.reject(error);
        }
        
        // Call refresh endpoint using plainAxios to avoid interceptor
        const res = await plainAxios.post(`/auth/refresh`, {'userId': userId});
        const newToken = res.data.token;
        if (newToken) {
          localStorage.setItem("token", newToken);
          // Set the new token in the original request header
          error.config.headers["Authorization"] = `Bearer ${newToken}`;
          // Mark the request as retried to avoid infinite loop
          if (!error.config._retry) {
            error.config._retry = true;
            return api.request(error.config);
          }
        }else{
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          if (window.location.pathname !== '/login') {
            window.location.href = "/login";
          }
        }
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        if (window.location.pathname !== '/login') {
          window.location.href = "/login";
        }
      }
    }
    if (error.response && error.response.status === 403) {
      window.location.href = "/nonAuthorized";
    }
    return Promise.reject(error);
  }
);


async function getConfigData() {
  try {
    const response = await plainAxios.get(`${API_CONFIG}`);
    return response.data;
  } catch (error) {
    return null;
  }
}


export default api;
