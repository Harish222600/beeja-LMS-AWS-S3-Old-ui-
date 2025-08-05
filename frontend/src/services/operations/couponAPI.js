import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { adminEndpoints, couponEndpoints } from "../apis";

const { GET_ALL_COUPONS_API, CREATE_COUPON_API, TOGGLE_COUPON_STATUS_API } = adminEndpoints;
const { GET_FRONTEND_COUPONS_API, VALIDATE_AND_APPLY_COUPON_API, VALIDATE_COUPON_API, APPLY_COUPON_API } = couponEndpoints;

export function createCoupon(data, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Creating Coupon...");
    try {
      const response = await apiConnector("POST", CREATE_COUPON_API, data, {
        Authorization: `Bearer ${token}`,
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Could Not Create Coupon");
      }

      toast.success("Coupon Created Successfully");
      toast.dismiss(toastId);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could Not Create Coupon");
      toast.dismiss(toastId);
      return null;
    }
  };
}

// Validate and apply coupon in a single request
export async function validateAndApplyCoupon(data, token) {
  try {
    const response = await apiConnector("POST", VALIDATE_AND_APPLY_COUPON_API, 
      { ...data, applyImmediately: true },
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Process Coupon");
    }

    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 404) {
      throw new Error("This coupon cannot be used for this type of purchase.");
    } else if (error.response?.status === 429) {
      throw new Error("Too many coupon attempts. Please try again later.");
    }
    
    // For other errors, throw without logging
    throw new Error(error.response?.data?.message || "Could not process coupon");
  }
}

// Legacy validate function (uses new combined endpoint without applying)
export async function validateCoupon(data, token) {
  try {
    const response = await apiConnector("POST", VALIDATE_AND_APPLY_COUPON_API, 
      { ...data, applyImmediately: false },
      { Authorization: `Bearer ${token}` }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Validate Coupon");
    }

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("This coupon cannot be used for this type of purchase.");
    } else if (error.response?.status === 429) {
      throw new Error("Too many coupon attempts. Please try again later.");
    }
    
    throw new Error(error.response?.data?.message || "Could not validate coupon");
  }
}

// Legacy apply function (uses new combined endpoint)
export async function applyCoupon(data, token) {
  return validateAndApplyCoupon(data, token);
}

export async function getAllCoupons(token, linkedTo = null) {
  try {
    // If token is provided, use admin endpoint, otherwise use frontend endpoint
    const endpoint = token ? GET_ALL_COUPONS_API : GET_FRONTEND_COUPONS_API;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Add linkedTo query parameter for frontend endpoint
    let url = endpoint;
    if (!token && linkedTo) {
      url = `${endpoint}?linkedTo=${linkedTo}`;
    }

    const response = await apiConnector("GET", url, null, headers);

    if (!response?.data?.success) {
      return []; // Return empty array instead of throwing error for frontend endpoint
    }

    return response.data.data;
  } catch (error) {
    return []; // Return empty array on error for frontend endpoint
  }
}

export async function toggleCouponStatus(couponId, token) {
  try {
    const url = TOGGLE_COUPON_STATUS_API.replace(':couponId', couponId);
    const response = await apiConnector("PATCH", url, null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("TOGGLE COUPON STATUS API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Toggle Coupon Status");
    }

    toast.success(response.data.message);
    return response.data.data;
  } catch (error) {
    console.log("TOGGLE COUPON STATUS API ERROR............", error);
    toast.error(error.response?.data?.message || "Could Not Toggle Coupon Status");
    throw error;
  }
}

// Get analytics for a specific coupon
export async function getCouponAnalytics(couponId, token) {
  try {
    const response = await apiConnector("GET", `${GET_ALL_COUPONS_API}/${couponId}/analytics`, {}, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Get Coupon Analytics");
    }

    return response.data;
  } catch (error) {
    console.error("Error getting coupon analytics:", error);
    throw new Error(error.response?.data?.message || "Could not get coupon analytics");
  }
}

// Cleanup expired coupons
export async function cleanupExpiredCoupons(token) {
  try {
    const response = await apiConnector("POST", `${GET_ALL_COUPONS_API.replace('/coupons', '/coupons/cleanup-expired')}`, {}, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could Not Cleanup Expired Coupons");
    }

    toast.success("Expired coupons cleaned up successfully");
    return response.data;
  } catch (error) {
    console.error("Error cleaning up expired coupons:", error);
    toast.error(error.response?.data?.message || "Could not cleanup expired coupons");
    throw error;
  }
}
