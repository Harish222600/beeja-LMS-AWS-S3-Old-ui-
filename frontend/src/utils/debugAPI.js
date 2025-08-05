// Debug utility to check API configuration and connectivity
export const debugAPIConfig = () => {
  console.log("=== API Debug Information ===");
  console.log("BASE_URL from env:", import.meta.env.VITE_APP_BASE_URL);
  console.log("Environment mode:", import.meta.env.MODE);
  console.log("All env variables:", import.meta.env);
  
  // Check if token exists in localStorage
  const token = localStorage.getItem("token");
  console.log("Token in localStorage:", token ? "EXISTS" : "NOT FOUND");
  if (token) {
    console.log("Token length:", token.length);
    console.log("Token preview:", token.substring(0, 20) + "...");
  }
  
  // Check Redux state
  const state = window.__REDUX_DEVTOOLS_EXTENSION__ ? 
    window.__REDUX_DEVTOOLS_EXTENSION__.getState?.() : null;
  if (state) {
    console.log("Redux auth state:", state.auth);
  }
  
  console.log("=== End Debug Information ===");
};

export const testAPIEndpoint = async (url, token) => {
  try {
    console.log("Testing API endpoint:", url);
    console.log("Using token:", token ? "YES" : "NO");
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log("Response data:", data);
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error("API test failed:", error);
    return { success: false, error: error.message };
  }
};
