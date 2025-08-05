import { apiConnector } from '../services/apiConnector';

// Utility to periodically check if user is still active
export const startAuthChecker = () => {
    // Check every 30 seconds if user is logged in
    const checkInterval = setInterval(async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            clearInterval(checkInterval);
            return;
        }

        try {
            // Make a lightweight API call to check auth status
            await apiConnector('GET', '/api/v1/auth/verify-token', null, {
                Authorization: `Bearer ${token}`
            });
        } catch (error) {
            // If auth fails, the interceptor will handle logout
            console.log('Auth check failed:', error.message);
        }
    }, 30000); // Check every 30 seconds

    return checkInterval;
};

export const stopAuthChecker = (intervalId) => {
    if (intervalId) {
        clearInterval(intervalId);
    }
};
