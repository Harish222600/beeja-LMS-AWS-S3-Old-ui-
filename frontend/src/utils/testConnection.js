import { adminEndpoints } from '../services/apis';
import { apiConnector } from '../services/apiConnector';

export const testBackendConnection = async (token) => {
    try {
        // Test basic server connection
        const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5000';
        console.log('Testing connection to:', baseUrl);
        
        // Test server health
        const healthCheck = await fetch(baseUrl);
        console.log('Server health check:', healthCheck.ok ? 'OK' : 'Failed');

        // Test admin endpoints with authentication
        if (token) {
            console.log('Testing admin endpoints with token...');
            const { GET_ALL_USERS_API } = adminEndpoints;
            
            const response = await apiConnector("GET", GET_ALL_USERS_API, null, {
                Authorization: `Bearer ${token}`,
            });
            
            console.log('Admin API test response:', {
                status: response.status,
                success: response.data?.success,
                message: response.data?.message,
                error: response.data?.error
            });
            
            return response;
        } else {
            console.error('No token provided for admin endpoint test');
        }
    } catch (error) {
        console.error('Connection test failed:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw error;
    }
};

// Add this to UserManagement.jsx's useEffect:
// testBackendConnection(token).catch(console.error);
