import { apiConnector } from '../apiConnector';
import { notificationEndpoints } from '../apis';

const {
    GET_NOTIFICATIONS_API,
    MARK_AS_READ_API,
    MARK_ALL_READ_API,
    DELETE_NOTIFICATION_API,
} = notificationEndpoints;

export const getNotifications = async (token) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiConnector("GET", GET_NOTIFICATIONS_API, undefined, headers);
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("GET_NOTIFICATIONS_API API ERROR............", error);
        return { success: false, error: error.message };
    }
};

export const markNotificationAsRead = async (notificationId, token) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiConnector("POST", MARK_AS_READ_API, {
            notificationId,
        }, headers);
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("MARK_AS_READ_API API ERROR............", error);
        return { success: false, error: error.message };
    }
};

export const markAllNotificationsAsRead = async (token) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiConnector("POST", MARK_ALL_READ_API, undefined, headers);
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("MARK_ALL_READ_API API ERROR............", error);
        return { success: false, error: error.message };
    }
};

export const deleteNotification = async (notificationId, token) => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await apiConnector("DELETE", DELETE_NOTIFICATION_API, {
            notificationId,
        }, headers);
        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }
        return response.data;
    } catch (error) {
        console.log("DELETE_NOTIFICATION_API API ERROR............", error);
        return { success: false, error: error.message };
    }
};
