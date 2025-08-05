import { toast } from "react-hot-toast";
import { apiConnector } from '../apiConnector';
import { courseEndpoints } from '../apis';

export const showAllCategories = async () => {
  try {
    const response = await apiConnector("GET", courseEndpoints.COURSE_CATEGORIES_API);
    if (!response?.data?.success) {
      throw new Error("Could not fetch categories");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const updateCategory = async (data, token) => {
  const toastId = toast.loading("Updating category...");
  let result = null;
  
  try {
    const response = await apiConnector("PUT", courseEndpoints.UPDATE_CATEGORY_API, data, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    
    console.log("UPDATE CATEGORY API RESPONSE............", response);
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update category");
    }
    
    // Fetch updated categories list
    const updatedCategories = await apiConnector("GET", courseEndpoints.COURSE_CATEGORIES_API);
    if (updatedCategories?.data?.data) {
      // Dispatch an event that Navbar can listen to
      const event = new CustomEvent('categoriesUpdated', { 
        detail: updatedCategories.data.data 
      });
      window.dispatchEvent(event);
    }
    
    toast.success("Category updated successfully");
    result = response?.data?.data;
  } catch (error) {
    console.log("UPDATE CATEGORY API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Error updating category");
  }
  
  toast.dismiss(toastId);
  return result;
};

export const deleteCategory = async (categoryId, token) => {
  const toastId = toast.loading("Deleting category...");
  let result = null;
  
  try {
    const response = await apiConnector("DELETE", courseEndpoints.DELETE_CATEGORY_API, 
      { categoryId }, 
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    );
    
    console.log("DELETE CATEGORY API RESPONSE............", response);
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not delete category");
    }
    
    // Fetch updated categories list
    const updatedCategories = await apiConnector("GET", courseEndpoints.COURSE_CATEGORIES_API);
    if (updatedCategories?.data?.data) {
      // Dispatch an event that Navbar can listen to
      const event = new CustomEvent('categoriesUpdated', { 
        detail: updatedCategories.data.data 
      });
      window.dispatchEvent(event);
    }
    
    toast.success("Category deleted successfully");
    result = true;
  } catch (error) {
    console.log("DELETE CATEGORY API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Error deleting category");
  }
  
  toast.dismiss(toastId);
  return result;
};

export const createCategory = async (data, token) => {
  const toastId = toast.loading("Creating category...");
  let result = null;
  
  try {
    const response = await apiConnector("POST", courseEndpoints.CREATE_CATEGORY_API, data, {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    
    console.log("CREATE CATEGORY API RESPONSE............", response);
    
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not create category");
    }
    
    // Fetch updated categories list
    const updatedCategories = await apiConnector("GET", courseEndpoints.COURSE_CATEGORIES_API);
    if (updatedCategories?.data?.data) {
      // Dispatch an event that Navbar can listen to
      const event = new CustomEvent('categoriesUpdated', { 
        detail: updatedCategories.data.data 
      });
      window.dispatchEvent(event);
    }
    
    toast.success("Category created successfully");
    result = response?.data?.data;
  } catch (error) {
    console.log("CREATE CATEGORY API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Error creating category");
  }
  
  toast.dismiss(toastId);
  return result;
};
