import { apiConnector } from '../apiConnector';
import { adminEndpoints } from '../apis';
import { toast } from "react-hot-toast";

const {
    SEND_NOTIFICATION_API,
    GET_ALL_NOTIFICATIONS_API,
    DELETE_NOTIFICATION_API,
    GET_ALL_INSTRUCTORS_API,
    GET_ALL_USERS_API
} = adminEndpoints;

// Send notification to users with enhanced features
export const sendNotification = async (notificationData, token) => {
    const toastId = toast.loading("Sending notification...");
    let result = null;
    
    try {
        console.log('Sending notification with data:', notificationData);
        
        // Validate required fields
        if (!notificationData.title || !notificationData.message || !notificationData.recipients) {
            throw new Error("Title, message, and recipients are required");
        }

        // Validate specific recipients if needed
        if (notificationData.recipients === 'specific' && (!notificationData.selectedUsers || notificationData.selectedUsers.length === 0)) {
            throw new Error("Please select at least one user for specific notifications");
        }
        
        const response = await apiConnector(
            "POST",
            SEND_NOTIFICATION_API,
            {
                ...notificationData,
                priority: notificationData.priority || 'medium'
            },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        console.log('Send notification response:', response);

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to send notification");
        }

        const recipientCount = response.data.data?.recipientCount || 0;
        toast.success(`Notification sent successfully to ${recipientCount} users!`);
        result = response.data;
    } catch (error) {
        console.error("SEND_NOTIFICATION_API ERROR:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to send notification";
        toast.error(errorMessage);
        throw error;
    } finally {
        toast.dismiss(toastId);
    }
    
    return result;
};

// Get all notifications sent by admin with enhanced grouping
export const getAllNotifications = async (token) => {
    let result = null;
    
    try {
        console.log('Fetching all notifications...');
        
        const response = await apiConnector(
            "GET",
            GET_ALL_NOTIFICATIONS_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        console.log('Get all notifications response:', response);

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to fetch notifications");
        }

        // Process notifications to ensure proper formatting
        const notifications = response.data.data || [];
        const processedNotifications = notifications.map(notification => ({
            ...notification,
            // Ensure we have proper display data
            displayId: notification.displayId || notification._id,
            recipientType: notification.recipients || notification.recipientType || 'unknown',
            readPercentage: notification.recipientCount > 0 
                ? Math.round((notification.readCount / notification.recipientCount) * 100) 
                : 0,
            priority: notification.priority || 'medium',
            // Format dates
            createdAt: new Date(notification.createdAt).toLocaleString(),
            // Ensure sender info
            senderName: notification.sender 
                ? `${notification.sender.firstName} ${notification.sender.lastName}` 
                : 'Unknown Admin'
        }));

        result = {
            ...response.data,
            data: processedNotifications
        };
    } catch (error) {
        console.error("GET_ALL_NOTIFICATIONS_API ERROR:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch notifications";
        toast.error(errorMessage);
        throw error;
    }
    
    return result;
};

// Delete notification with enhanced error handling
export const deleteNotificationAdmin = async (notificationId, token) => {
    const toastId = toast.loading("Deleting notification...");
    let result = null;
    
    try {
        console.log('Deleting notification with ID:', notificationId);
        
        if (!notificationId) {
            throw new Error("Notification ID is required");
        }
        
        const response = await apiConnector(
            "DELETE",
            DELETE_NOTIFICATION_API.replace(':notificationId', notificationId),
            undefined, // Use undefined instead of null to avoid sending body data
            {
                Authorization: `Bearer ${token}`,
            }
        );

        console.log('Delete notification response:', response);

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to delete notification");
        }

        const deletedCount = response.data.deletedCount || 1;
        toast.success(`${deletedCount} notification${deletedCount > 1 ? 's' : ''} deleted successfully!`);
        result = response.data;
    } catch (error) {
        console.error("DELETE_NOTIFICATION_API ERROR:", error);
        
        // Handle different error scenarios
        if (error.response) {
            // Server responded with an error status
            switch (error.response.status) {
                case 404:
                    toast.success('Notification was already deleted');
                    return { 
                        success: true, 
                        message: 'Notification was already deleted',
                        notFound: true 
                    };
                case 500:
                    // For 500 errors, try to provide more context
                    console.error('Server error details:', error.response.data);
                    toast.error('Server error - notification may have been deleted');
                    return {
                        success: true,
                        message: 'Server error - notification may have been deleted',
                        serverError: true
                    };
                default:
                    toast.error(error.response.data?.message || 'Failed to delete notification');
                    return {
                        success: false,
                        error: error.response.data?.message || 'Failed to delete notification'
                    };
            }
        } else if (error.request) {
            // Request was made but no response received
            toast.error('Network error - please try again');
            return {
                success: false,
                error: 'Network error - please try again',
                networkError: true
            };
        } else {
            // Error in request setup
            toast.error(error.message || 'Failed to delete notification');
            return {
                success: false,
                error: error.message || 'Failed to delete notification'
            };
        }
    } finally {
        toast.dismiss(toastId);
    }
    
    return result;
};

// Get all instructors for notification targeting
export const getAllInstructors = async (token) => {
    let result = null;
    
    try {
        console.log('Fetching all instructors...');
        
        const response = await apiConnector(
            "GET",
            GET_ALL_INSTRUCTORS_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        console.log('Get all instructors response:', response);

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to fetch instructors");
        }

        result = response.data;
    } catch (error) {
        console.error("GET_ALL_INSTRUCTORS_API ERROR:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch instructors";
        toast.error(errorMessage);
        throw error;
    }
    
    return result;
};

// Get all users for specific targeting (new function)
export const getAllUsers = async (token) => {
    let result = null;
    
    try {
        console.log('Fetching all users...');
        
        const response = await apiConnector(
            "GET",
            GET_ALL_USERS_API,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        console.log('Get all users response:', response);

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to fetch users");
        }

        result = response.data;
    } catch (error) {
        console.error("GET_ALL_USERS_API ERROR:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to fetch users";
        // Don't show toast error for this as it might be called frequently
        console.warn(errorMessage);
        throw error;
    }
    
    return result;
};

// Utility function to format recipient type for display
export const formatRecipientType = (recipientType) => {
    const typeMap = {
        'All': 'All Users',
        'Student': 'Students',
        'Instructor': 'Instructors', 
        'Admin': 'Administrators',
        'Specific': 'Specific Users',
        'all': 'All Users',
        'students': 'Students',
        'instructors': 'Instructors',
        'admins': 'Administrators',
        'specific': 'Specific Users'
    };
    
    return typeMap[recipientType] || recipientType || 'Unknown';
};

// Utility function to get priority color
export const getPriorityColor = (priority) => {
    const colorMap = {
        'low': 'text-green-600 bg-green-100',
        'medium': 'text-yellow-600 bg-yellow-100', 
        'high': 'text-red-600 bg-red-100'
    };
    
    return colorMap[priority] || colorMap['medium'];
};

// Legacy function for backward compatibility
export const deleteNotification = deleteNotificationAdmin;
