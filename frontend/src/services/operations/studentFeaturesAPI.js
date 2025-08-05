import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiConnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png"
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";


const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

function loadScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;

        script.onload = () => {
            resolve(true);
        }
        script.onerror = () => {
            resolve(false);
        }
        document.body.appendChild(script);
    })
}

// ================ buyCourse ================ 
export async function buyCourse(token, coursesId, userDetails, navigate, dispatch, couponData = null) {
    const toastId = toast.loading("Processing your enrollment...");

    try {
        // Prepare request body with coupon information if available
        const requestBody = { coursesId };
        if (couponData) {
            requestBody.couponCode = couponData.code;
            requestBody.discountAmount = couponData.discountAmount;
        }

        // First API call - capture payment/initiate enrollment
        const courseResponse = await apiConnector(
            "POST", 
            COURSE_PAYMENT_API,
            requestBody,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!courseResponse.data.success) {
            throw new Error(courseResponse.data.message);
        }

        // If first call succeeds, proceed with verification
        const verifyResponse = await apiConnector(
            "POST", 
            COURSE_VERIFY_API, 
            requestBody,
            {
                Authorization: `Bearer ${token}`,
            }
        );

        if (!verifyResponse.data.success) {
            throw new Error(verifyResponse.data.message);
        }

        toast.success("Successfully enrolled in the course!");
        navigate("/dashboard/enrolled-courses");
        dispatch(resetCart());

    } catch (error) {
        console.log("ENROLLMENT API ERROR.....", error);
        toast.error(error.response?.data?.message || "Could not complete enrollment");
    } finally {
        toast.dismiss(toastId);
    }
}


// ================ send Payment Success Email ================
async function sendPaymentSuccessEmail(response, amount, token) {
    try {
        await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            amount,
        }, {
            Authorization: `Bearer ${token}`
        })
    }
    catch (error) {
        console.log("PAYMENT SUCCESS EMAIL ERROR....", error);
    }
}


