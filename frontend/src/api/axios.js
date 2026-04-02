import axios from 'axios';
// Automatically decide base URL
const baseURL =
  import.meta.env.MODE === 'production'
    ? '/api' // local frontend → Vite proxy
    : import.meta.env.VITE_API_URL; // deployed frontend → actual backend URL

// Optional: log to confirm what it's using
console.log('Axios baseURL →', baseURL);

const instance = axios.create({ baseURL });

// Add auth token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;




