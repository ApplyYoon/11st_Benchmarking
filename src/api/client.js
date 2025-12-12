import axios from 'axios';

const client = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for HttpOnly Cookies
});

// No request interceptor needed for HttpOnly cookies as the browser handles them automatically.

// Response interceptor to handle 401s (optional)
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Check if we are not already on login page to avoid loops
            if (window.location.pathname !== '/login') {
                // Logic to redirect or clear session could go here
                // But we let the Context handle state clearing usually
            }
        }
        return Promise.reject(error);
    }
);

export default client;
