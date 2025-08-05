// Comprehensive API debugging utility
export const debugAPIIssues = () => {
    console.log('=== API DEBUG INFORMATION ===');
    
    // 1. Environment Variables
    console.log('Environment Variables:');
    console.log('- VITE_APP_BASE_URL:', import.meta.env.VITE_APP_BASE_URL);
    console.log('- NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('- All env vars:', import.meta.env);
    
    // 2. Redux State
    const authState = JSON.parse(localStorage.getItem('persist:auth') || '{}');
    const token = localStorage.getItem('token');
    console.log('Auth State:');
    console.log('- localStorage token:', token);
    console.log('- Redux auth state:', authState);
    
    // 3. Network connectivity test
    const testConnectivity = async () => {
        const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5000';
        console.log('Testing connectivity to:', baseUrl);
        
        try {
            const response = await fetch(baseUrl, { 
                method: 'GET',
                mode: 'cors'
            });
            console.log('Server connectivity:', response.ok ? 'SUCCESS' : 'FAILED');
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
        } catch (error) {
            console.error('Connectivity test failed:', error);
        }
    };
    
    testConnectivity();
    
    // 4. API endpoint construction
    const BASE_URL = import.meta.env.VITE_APP_BASE_URL;
    const GET_ALL_USERS_API = BASE_URL + "/api/v1/admin/users";
    console.log('Constructed API URL:', GET_ALL_USERS_API);
    
    console.log('=== END DEBUG INFO ===');
};

export const testAdminAPI = async (token) => {
    console.log('=== TESTING ADMIN API ===');
    
    if (!token) {
        console.error('No token provided for API test');
        return;
    }
    
    const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:5000';
    const apiUrl = `${baseUrl}/api/v1/admin/users`;
    
    console.log('Testing API:', apiUrl);
    console.log('Using token:', token.substring(0, 20) + '...');
    
    try {
        // Test with fetch directly
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        const responseText = await response.text();
        console.log('Response body:', responseText);
        
        if (response.ok) {
            try {
                const data = JSON.parse(responseText);
                console.log('Parsed response:', data);
                return data;
            } catch (parseError) {
                console.error('Failed to parse response as JSON:', parseError);
            }
        } else {
            console.error('API request failed with status:', response.status);
        }
        
    } catch (error) {
        console.error('API test failed:', error);
    }
    
    console.log('=== END API TEST ===');
};
