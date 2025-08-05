import { apiConnector } from '../apiConnector';
import { faqEndpoints } from '../apis';
import { toast } from 'react-hot-toast';

const {
    SUBMIT_QUESTION_API,
    GET_ALL_FAQS_API,
    GET_PUBLISHED_FAQS_API,
    ANSWER_FAQ_API,
    TOGGLE_FAQ_PUBLISH_API,
    DELETE_FAQ_API,
} = faqEndpoints;

export const submitQuestion = async (question, token) => {
    try {
        const response = await apiConnector("POST", SUBMIT_QUESTION_API, 
            { question },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }

        toast.success("Question submitted successfully");
        return response.data;
    } catch (error) {
        console.error("SUBMIT_QUESTION_API ERROR", error);
        toast.error(error.response?.data?.message || "Failed to submit question");
        return false;
    }
};

export const getAllFaqs = async (token) => {
    try {
        const response = await apiConnector("GET", GET_ALL_FAQS_API, null, {
            Authorization: `Bearer ${token}`,
        });

        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }

        return response.data.faqs;
    } catch (error) {
        console.error("GET_ALL_FAQS_API ERROR", error);
        toast.error(error.response?.data?.message || "Failed to fetch FAQs");
        return [];
    }
};

export const getPublishedFaqs = async () => {
    try {
        const response = await apiConnector("GET", GET_PUBLISHED_FAQS_API);

        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }

        return response.data.faqs;
    } catch (error) {
        console.error("GET_PUBLISHED_FAQS_API ERROR", error);
        toast.error(error.response?.data?.message || "Failed to fetch FAQs");
        return [];
    }
};

export const answerFaq = async (faqId, answer, token) => {
    try {
        const response = await apiConnector("PUT", ANSWER_FAQ_API.replace(":id", faqId), 
            { answer },
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message);
        }

       
        return response.data.faq;
    } catch (error) {
        console.error("ANSWER_FAQ_API ERROR", error);
        toast.error(error.response?.data?.message || "Failed to answer FAQ");
        return false;
    }
};

export const deleteFaq = async (faqId, token) => {
    try {
        const response = await apiConnector("DELETE", DELETE_FAQ_API.replace(":id", faqId), 
            undefined,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to delete FAQ");
        }


        return true;
    } catch (error) {
        console.error("DELETE_FAQ_API ERROR", error);
        toast.error(error.response?.data?.message || "Failed to delete FAQ");
        return false;
    }
};

export const toggleFaqPublish = async (faqId, token) => {
    try {
        const response = await apiConnector("PUT", TOGGLE_FAQ_PUBLISH_API.replace(":id", faqId), 
            undefined,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!response?.data?.success) {
            throw new Error(response?.data?.message || "Failed to toggle publish status");
        }

        toast.success(response.data.message);
        return response.data.faq;
    } catch (error) {
        console.error("TOGGLE_FAQ_PUBLISH_API ERROR", error);
        console.error("Error details:", error.response?.data);
        toast.error(error.response?.data?.message || "Failed to toggle FAQ publish status");
        return false;
    }
};
