import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";

const { USER_ANALYTICS_API, USER_ACTIVITY_API } = endpoints;

export const getUserAnalytics = async (token) => {
  try {
    const response = await apiConnector("GET", USER_ANALYTICS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Could not fetch user analytics");
    }

    return response.data.data;
  } catch (error) {
    console.log("GET_USER_ANALYTICS_API ERROR............", error);
    throw error;
  }
};

export const getUserActivity = async (token, period = '7d') => {
  try {
    const response = await apiConnector("GET", `${USER_ACTIVITY_API}?period=${period}`, null, {
      Authorization: `Bearer ${token}`,
    });

    if (!response?.data?.success) {
      throw new Error("Could not fetch user activity");
    }

    return response.data.data;
  } catch (error) {
    console.log("GET_USER_ACTIVITY_API ERROR............", error);
    throw error;
  }
};
