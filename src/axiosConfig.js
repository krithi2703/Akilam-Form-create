import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://136.185.14.8:8500/api',
  baseURL: 'http://localhost:5000/api', // Set your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    console.log('Interceptor triggered for URL:', config.url);
    const token = sessionStorage.getItem('token');
    console.log('Token from sessionStorage:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', config.headers.Authorization);
    }
    const userId = sessionStorage.getItem('userId');
    if (userId && config.headers.userid !== 'preview') {
      config.headers.userid = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration and other auth errors
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    const { status, data } = error.response || {};
    const errorMessage = data?.message?.toLowerCase() || '';

    // Check for token-related errors
    if (status === 401 || status === 403) {
      if (errorMessage.includes('jwt expired') || errorMessage.includes('token verification failed')) {
        console.error("Token expired or invalid. Redirecting to login.");
        
        // Clear user session
        sessionStorage.clear();
        localStorage.clear();

        // Redirect to the login page
        // We use window.location to navigate outside of a React component
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    
    // For all other errors, just pass them along
    return Promise.reject(error);
  }
);

export default api;
