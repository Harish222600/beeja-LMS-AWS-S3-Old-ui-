import { toast } from "react-hot-toast"
import { apiConnector } from "../apiConnector"
import { certificateEndpoints } from "../apis"

const {
  GENERATE_CERTIFICATE_API,
  VERIFY_CERTIFICATE_API,
  GET_USER_CERTIFICATES_API,
} = certificateEndpoints

export async function generateCertificate(data, token) {
  const toastId = toast.loading("Generating certificate...")
  let result = null
  try {
    const response = await apiConnector("POST", GENERATE_CERTIFICATE_API, data, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GENERATE CERTIFICATE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Generate Certificate")
    }
    toast.success("Certificate generated successfully!")
    result = response?.data?.data
  } catch (error) {
    console.log("GENERATE CERTIFICATE API ERROR............", error)
    console.log("Error response data:", error?.response?.data)
    
    const errorMessage = error.response?.data?.message || "Could Not Generate Certificate"
    toast.error(errorMessage)
    
    // Log debug information if available
    if (error?.response?.data?.debug) {
      console.log("Debug info:", error.response.data.debug)
    }
  }
  toast.dismiss(toastId)
  return result
}

export async function verifyCertificate(certificateId) {
  let result = null
  try {
    const response = await apiConnector("GET", `${VERIFY_CERTIFICATE_API}/${certificateId}`)
    console.log("VERIFY CERTIFICATE API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Verify Certificate")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("VERIFY CERTIFICATE API ERROR............", error)
    throw new Error(error.response?.data?.message || "Could Not Verify Certificate")
  }
  return result
}

export async function getUserCertificates(token) {
  let result = []
  try {
    const response = await apiConnector("GET", GET_USER_CERTIFICATES_API, null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET USER CERTIFICATES API RESPONSE............", response)
    if (!response?.data?.success) {
      throw new Error("Could Not Get User Certificates")
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET USER CERTIFICATES API ERROR............", error)
    toast.error("Could Not Get User Certificates")
  }
  return result
}
