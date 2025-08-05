import axios from "axios"
import { toast } from "react-hot-toast"

export const axiosInstance = axios.create({
    withCredentials: true,
    headers: {
        'Accept': 'application/json'
    }
});

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Check if the error is due to user deactivation
        if (error.response?.status === 401) {
            const errorData = error.response.data;
            
            // Handle specific deactivation cases
            if (errorData?.reason === 'USER_DEACTIVATED' || 
                errorData?.reason === 'TOKEN_BLACKLISTED' ||
                errorData?.reason === 'USER_NOT_FOUND') {
                
                console.log('User account deactivated or token blacklisted - forcing logout');
                
                // Show appropriate message
                toast.error(errorData.message || 'Your account has been deactivated. Please contact support.');
                
                // Clear local storage and Redux state
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Dispatch clearAuth action to Redux store if available
                try {
                    // Get the store instance (this will be set up in the main app)
                    const store = window.__REDUX_STORE__;
                    if (store) {
                        const { clearAuth } = await import('../slices/authSlice');
                        store.dispatch(clearAuth());
                    }
                } catch (reduxError) {
                    console.log('Could not clear Redux state:', reduxError.message);
                }
                
                // Force page reload to ensure complete logout
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            }
        }
        
        return Promise.reject(error);
    }
);

export const apiConnector = (method, url, bodyData, headers, params, config = {}) => {
    // Debug logging
    console.log('API Request:', {
        method,
        url,
        bodyData,
        headers,
        params,
        config
    });

    // Determine if we're sending FormData (for file uploads)
    const isFormData = bodyData instanceof FormData;
    
    // Set default headers, but don't override Content-Type for FormData
    const defaultHeaders = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(headers?.Authorization ? { 'Authorization': headers.Authorization } : {})
    };

    // Debug token
    if (headers?.Authorization) {
        console.log('Token being used:', headers.Authorization);
    }

    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData !== undefined && bodyData !== null ? bodyData : undefined,
        headers: {
            ...defaultHeaders,
            ...headers
        },
        params: params ? params : null,
        withCredentials: true,
        ...config  // Spread additional axios config options like responseType
    }).then(response => {
        console.log('API Response:', {
            url,
            status: response.status,
            data: response.data
        });
        return response;
    }).catch(error => {
        console.error('API Error:', {
            url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    });
}
