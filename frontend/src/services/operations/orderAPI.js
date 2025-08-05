import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { adminEndpoints, studentEndpoints } from "../apis";

const { 
  GET_ALL_ORDERS_API, 
  UPDATE_ORDER_STATUS_API, 
  GENERATE_ORDERS_PDF_API 
} = adminEndpoints;

const {
  GET_ORDER_BY_COURSE_API: STUDENT_GET_ORDER_BY_COURSE_API
} = studentEndpoints;

export const getOrderByCourse = async (courseId, token) => {
  const toastId = toast.loading("Loading invoice...");
  let result = null;
  
  try {
    const response = await apiConnector(
      "GET",
      STUDENT_GET_ORDER_BY_COURSE_API.replace(":courseId", courseId),
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch order details");
    }

    result = response?.data?.order;
    toast.success("Invoice loaded successfully");
  } catch (error) {
    console.error("GET_ORDER_BY_COURSE_API ERROR............", error);
    toast.error(error?.response?.data?.message || "Could not fetch order details");
  }
  
  toast.dismiss(toastId);
  return result;
};

export const getAllOrders = async (token) => {
  const toastId = toast.loading("Loading orders...");
  let result = null;
  
  try {
    const response = await apiConnector(
      "GET",
      GET_ALL_ORDERS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch orders");
    }

    result = response?.data?.orders;
    toast.success("Orders loaded successfully");
  } catch (error) {
    console.error("GET_ALL_ORDERS_API ERROR............", error);
    toast.error(error?.response?.data?.message || "Could not fetch orders");
  }
  
  toast.dismiss(toastId);
  return result;
};

export const updateOrderStatus = async (token, orderId, status) => {
  const toastId = toast.loading("Updating order status...");
  let result = false;
  
  try {
    const response = await apiConnector(
      "PATCH",
      UPDATE_ORDER_STATUS_API.replace(":orderId", orderId),
      { status },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update order status");
    }

    result = true;
    toast.success("Order status updated successfully");
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_API ERROR............", error);
    toast.error(error?.response?.data?.message || "Could not update order status");
  }
  
  toast.dismiss(toastId);
  return result;
};

export const generateOrdersPDF = async (token) => {
  const toastId = toast.loading("Generating PDF...");
  
  try {
    const response = await apiConnector(
      "GET",
      GENERATE_ORDERS_PDF_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
      null,
      true // This indicates we expect a blob response
    );

    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orders-report-${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("PDF downloaded successfully");
  } catch (error) {
    console.error("GENERATE_ORDERS_PDF_API ERROR............", error);
    toast.error("Could not generate PDF");
  }
  
  toast.dismiss(toastId);
};
