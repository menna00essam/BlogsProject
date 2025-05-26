import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      console.log('🚀 Attempting login with:', { email: credentials.email });
      
const loginData = {
  usernameOrEmail: credentials.usernameOrEmail, 
  password: credentials.password
};
      
      const response = await api.post('/auth/login', loginData);
      console.log(' Login API success:', response.data);
      
      if (response.data.access_token) {
        return {
          token: response.data.access_token,
          user: null 
        };
      }
      
      return response.data;
    } catch (error) {
      console.error(' Login API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('🚀 Attempting register with:', { email: userData.email, username: userData.username });
      const response = await api.post('/auth/register', userData);
      console.log('Register API success:', response.data);
      return response.data;
    } catch (error) {
      console.error('Register API error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  
 
};

export default authService;