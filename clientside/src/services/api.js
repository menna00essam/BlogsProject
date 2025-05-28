import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
   withCredentials: true,
 
});

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
    
//     console.log('API Request:', {
//       method: config.method?.toUpperCase(),
//       url: config.baseURL + config.url,
//       headers: config.headers
//     });
    
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // ما تضيفش توكن لطلبات التسجيل
    if (token && !config.url.includes('/auth/register')) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.baseURL + config.url,
      headers: config.headers,
      body: config.data
    });
    
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;