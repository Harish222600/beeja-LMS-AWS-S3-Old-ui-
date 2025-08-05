import { apiConnector } from "../apiConnector";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

const RECYCLE_BIN_API = {
    GET_ITEMS: BASE_URL + "/api/v1/recycle-bin",
    GET_STATS: BASE_URL + "/api/v1/recycle-bin/stats",
    MOVE_TO_BIN: BASE_URL + "/api/v1/recycle-bin/move",
    RESTORE_ITEM: BASE_URL + "/api/v1/recycle-bin/restore",
    PERMANENT_DELETE: BASE_URL + "/api/v1/recycle-bin/permanent",
    CLEANUP_EXPIRED: BASE_URL + "/api/v1/recycle-bin/cleanup"
};

// Get all recycle bin items
export const getRecycleBinItems = async (token, itemType = null, page = 1, limit = 10) => {
    const toastId = toast.loading("Loading..");
    let result = [];
    
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        if (itemType) {
            params.append('itemType', itemType);
        }

        const response = await apiConnector(
            "GET",
            `${RECYCLE_BIN_API.GET_ITEMS}?${params.toString()}`,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to fetch recycle bin items");
        }

        result = response.data;
    } catch (error) {
        console.error("GET_RECYCLE_BIN_ITEMS_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Failed to load recycle bin items");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Get recycle bin statistics
export const getRecycleBinStats = async (token) => {
    let result = null;
    
    try {
        const response = await apiConnector(
            "GET",
            RECYCLE_BIN_API.GET_STATS,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to fetch recycle bin stats");
        }

        result = response.data.data;
    } catch (error) {
        console.error("GET_RECYCLE_BIN_STATS_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Failed to load recycle bin statistics");
    }
    
    return result;
};

// Move item to recycle bin (soft delete)
export const moveToRecycleBin = async (token, itemType, itemId, reason = '') => {
    const toastId = toast.loading(`Moving ${itemType.toLowerCase()} to recycle bin...`);
    let result = false;
    
    try {
        const response = await apiConnector(
            "POST",
            RECYCLE_BIN_API.MOVE_TO_BIN,
            {
                itemType,
                itemId,
                reason
            },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to move item to recycle bin");
        }

        result = true;
        toast.success(`${itemType} moved to recycle bin successfully`);
    } catch (error) {
        console.error("MOVE_TO_RECYCLE_BIN_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Failed to move item to recycle bin");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Restore item from recycle bin
export const restoreFromRecycleBin = async (token, recycleBinId) => {
    const toastId = toast.loading("Restoring item...");
    let result = false;
    
    try {
        const response = await apiConnector(
            "PUT",
            `${RECYCLE_BIN_API.RESTORE_ITEM}/${recycleBinId}`,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to restore item");
        }

        result = true;
        toast.success("Item restored successfully");
    } catch (error) {
        console.error("RESTORE_FROM_RECYCLE_BIN_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Failed to restore item");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Permanently delete item
export const permanentlyDeleteItem = async (token, recycleBinId) => {
    const toastId = toast.loading("Permanently deleting item...");
    let result = false;
    
    try {
        const response = await apiConnector(
            "DELETE",
            `${RECYCLE_BIN_API.PERMANENT_DELETE}/${recycleBinId}`,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to permanently delete item");
        }

        result = true;
        toast.success("Item permanently deleted");
    } catch (error) {
        console.error("PERMANENTLY_DELETE_ITEM_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Failed to permanently delete item");
    }
    
    toast.dismiss(toastId);
    return result;
};

// Cleanup expired items
export const cleanupExpiredItems = async (token) => {
    const toastId = toast.loading("Cleaning up expired items...");
    let result = false;
    
    try {
        const response = await apiConnector(
            "POST",
            RECYCLE_BIN_API.CLEANUP_EXPIRED,
            null,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to cleanup expired items");
        }

        result = true;
        toast.success("Expired items cleaned up successfully");
    } catch (error) {
        console.error("CLEANUP_EXPIRED_ITEMS_API ERROR:", error);
        toast.error(error?.response?.data?.message || "Failed to cleanup expired items");
    }
    
    toast.dismiss(toastId);
    return result;
};
