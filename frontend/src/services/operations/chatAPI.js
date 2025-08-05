import { toast } from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { chatEndpoints } from "../apis";

const {
  INITIATE_CHAT_API,
  GET_STUDENT_CHATS_API,
  GET_INSTRUCTOR_CHATS_API,
  GET_ALL_CHATS_API,
  ARCHIVE_CHAT_API,
  UNARCHIVE_CHAT_API,
  FLAG_CHAT_API,
  UNFLAG_CHAT_API,
  DELETE_CHAT_API,
  HIDE_MESSAGE_API,
  SEND_MESSAGE_API,
  GET_CHAT_MESSAGES_API,
  GET_CHAT_DETAILS_API,
} = chatEndpoints;

// ================ STUDENT FUNCTIONS ================

// Initiate chat with instructor
export const initiateChat = async (courseId, token) => {
  const toastId = toast.loading("Starting chat...");
  let result = null;
  
  try {
    const response = await apiConnector(
      "POST",
      INITIATE_CHAT_API,
      { courseId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("INITIATE_CHAT_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not initiate chat");
    }

    toast.success("Chat started successfully!");
    result = response.data.data;
  } catch (error) {
    console.log("INITIATE_CHAT_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not start chat");
  }
  
  toast.dismiss(toastId);
  return result;
};

// Get student's chats
export const getStudentChats = async (token, page = 1, limit = 10) => {
  let result = [];
  
  try {
    const response = await apiConnector(
      "GET",
      `${GET_STUDENT_CHATS_API}?page=${page}&limit=${limit}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("GET_STUDENT_CHATS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch chats");
    }

    result = response.data.data;
  } catch (error) {
    console.log("GET_STUDENT_CHATS_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not fetch chats");
  }
  
  return result;
};

// ================ INSTRUCTOR FUNCTIONS ================

// Get instructor's chats
export const getInstructorChats = async (token, page = 1, limit = 10, courseId = null) => {
  let result = [];
  
  try {
    let url = `${GET_INSTRUCTOR_CHATS_API}?page=${page}&limit=${limit}`;
    if (courseId) {
      url += `&courseId=${courseId}`;
    }

    const response = await apiConnector(
      "GET",
      url,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("GET_INSTRUCTOR_CHATS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch chats");
    }

    result = response.data.data;
  } catch (error) {
    console.log("GET_INSTRUCTOR_CHATS_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not fetch chats");
  }
  
  return result;
};

// ================ ADMIN FUNCTIONS ================

// Get all chats for admin
export const getAllChats = async (token, filters = {}) => {
  let result = [];
  
  try {
    const { page = 1, limit = 10, courseId, instructorId, studentId, status = 'active' } = filters;
    
    let url = `${GET_ALL_CHATS_API}?page=${page}&limit=${limit}&status=${status}`;
    if (courseId) url += `&courseId=${courseId}`;
    if (instructorId) url += `&instructorId=${instructorId}`;
    if (studentId) url += `&studentId=${studentId}`;

    const response = await apiConnector(
      "GET",
      url,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("GET_ALL_CHATS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch chats");
    }

    result = response.data.data;
  } catch (error) {
    console.log("GET_ALL_CHATS_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not fetch chats");
  }
  
  return result;
};

// Archive chat (Admin only)
export const archiveChat = async (chatId, token) => {
  const toastId = toast.loading("Archiving chat...");
  let result = false;
  
  try {
    const response = await apiConnector(
      "PATCH",
      `${ARCHIVE_CHAT_API}/${chatId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("ARCHIVE_CHAT_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not archive chat");
    }

    toast.success("Chat archived successfully!");
    result = true;
  } catch (error) {
    console.log("ARCHIVE_CHAT_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not archive chat");
  }
  
  toast.dismiss(toastId);
  return result;
};

// Flag chat (Admin only)
export const flagChat = async (chatId, reason, token) => {
  const toastId = toast.loading("Flagging chat...");
  let result = false;
  
  try {
    const response = await apiConnector(
      "PATCH",
      `${FLAG_CHAT_API}/${chatId}`,
      { reason },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("FLAG_CHAT_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not flag chat");
    }

    toast.success("Chat flagged successfully!");
    result = true;
  } catch (error) {
    console.log("FLAG_CHAT_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not flag chat");
  }
  
  toast.dismiss(toastId);
  return result;
};

// Unarchive chat (Admin only)
export const unarchiveChat = async (chatId, token) => {
  const toastId = toast.loading("Unarchiving chat...");
  let result = false;
  
  try {
    const response = await apiConnector(
      "PATCH",
      `${UNARCHIVE_CHAT_API}/${chatId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("UNARCHIVE_CHAT_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not unarchive chat");
    }

    toast.success("Chat unarchived successfully!");
    result = true;
  } catch (error) {
    console.log("UNARCHIVE_CHAT_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not unarchive chat");
  }
  
  toast.dismiss(toastId);
  return result;
};

// Unflag chat (Admin only)
export const unflagChat = async (chatId, token) => {
  const toastId = toast.loading("Removing flag from chat...");
  let result = false;
  
  try {
    const response = await apiConnector(
      "PATCH",
      `${UNFLAG_CHAT_API}/${chatId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("UNFLAG_CHAT_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not unflag chat");
    }

    toast.success("Chat flag removed successfully!");
    result = true;
  } catch (error) {
    console.log("UNFLAG_CHAT_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not unflag chat");
  }
  
  toast.dismiss(toastId);
  return result;
};

// Delete chat (Admin only)
export const deleteChat = async (chatId, token) => {
  const toastId = toast.loading("Deleting chat...");
  let result = false;
  
  try {
    const response = await apiConnector(
      "DELETE",
      `${DELETE_CHAT_API}/${chatId}`,
      {},
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("DELETE_CHAT_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not delete chat");
    }

    toast.success("Chat deleted successfully!");
    result = true;
  } catch (error) {
    console.log("DELETE_CHAT_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not delete chat");
  }
  
  toast.dismiss(toastId);
  return result;
};

// Hide message (Admin only)
export const hideMessage = async (messageId, reason, token) => {
  const toastId = toast.loading("Hiding message...");
  let result = false;
  
  try {
    const response = await apiConnector(
      "PATCH",
      `${HIDE_MESSAGE_API}/${messageId}`,
      { reason },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("HIDE_MESSAGE_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not hide message");
    }

    toast.success("Message hidden successfully!");
    result = true;
  } catch (error) {
    console.log("HIDE_MESSAGE_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not hide message");
  }
  
  toast.dismiss(toastId);
  return result;
};

// ================ MESSAGE FUNCTIONS ================

// Send message
export const sendMessage = async (chatId, content, messageType = 'text', image = null, token) => {
  let result = null;
  
  try {
    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('content', content);
    formData.append('messageType', messageType);
    
    if (messageType === 'image' && image) {
      formData.append('image', image);
    }

    // Don't set Content-Type header manually for FormData - axios will handle it
    const response = await apiConnector(
      "POST",
      SEND_MESSAGE_API,
      formData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("SEND_MESSAGE_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not send message");
    }

    result = response.data.data;
  } catch (error) {
    console.log("SEND_MESSAGE_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not send message");
  }
  
  return result;
};

// Get chat messages
export const getChatMessages = async (chatId, token, page = 1, limit = 50) => {
  let result = [];
  
  try {
    const response = await apiConnector(
      "GET",
      `${GET_CHAT_MESSAGES_API}/${chatId}?page=${page}&limit=${limit}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("GET_CHAT_MESSAGES_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch messages");
    }

    result = response.data.data;
  } catch (error) {
    console.log("GET_CHAT_MESSAGES_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not fetch messages");
  }
  
  return result;
};

// Get chat details
export const getChatDetails = async (chatId, token) => {
  let result = null;
  
  try {
    const response = await apiConnector(
      "GET",
      `${GET_CHAT_DETAILS_API}/${chatId}`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("GET_CHAT_DETAILS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not fetch chat details");
    }

    result = response.data.data;
  } catch (error) {
    console.log("GET_CHAT_DETAILS_API ERROR............", error);
    toast.error(error.response?.data?.message || error.message || "Could not fetch chat details");
  }
  
  return result;
};
