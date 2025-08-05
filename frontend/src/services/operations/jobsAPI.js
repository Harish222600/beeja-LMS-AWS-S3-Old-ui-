import { apiConnector } from "../apiConnector";
import { jobsEndpoints } from "../apis";
import { toast } from "react-hot-toast";

const {
  GET_PUBLISHED_JOBS_API,
  GET_JOB_DETAILS_API,
  CREATE_JOB_API,
  GET_ALL_JOBS_API,
  UPDATE_JOB_API,
  DELETE_JOB_API,
  TOGGLE_JOB_PUBLICATION_API,
  GET_JOB_APPLICATIONS_API,
  GET_ALL_APPLICATIONS_API,
  UPDATE_APPLICATION_STATUS_API,
  GET_JOBS_ANALYTICS_API,
  SUBMIT_APPLICATION_API,
  GET_APPLICATION_BY_ID_API,
  DELETE_APPLICATION_API,
  BULK_UPDATE_APPLICATION_STATUS_API,
  GET_APPLICATION_STATISTICS_API
} = jobsEndpoints;

// ================ PUBLIC JOB FUNCTIONS ================

export const getPublishedJobs = async () => {
  const toastId = toast.loading("Loading jobs...");
  let result = [];
  try {
    const response = await apiConnector("GET", GET_PUBLISHED_JOBS_API);
    console.log("GET_PUBLISHED_JOBS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not fetch published jobs");
    }
    result = response?.data?.jobs;
  } catch (error) {
    console.log("GET_PUBLISHED_JOBS_API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const getJobDetails = async (jobId) => {
  const toastId = toast.loading("Loading job details...");
  let result = null;
  try {
    const response = await apiConnector("GET", GET_JOB_DETAILS_API.replace(":jobId", jobId));
    console.log("GET_JOB_DETAILS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not fetch job details");
    }
    result = response?.data?.job;
  } catch (error) {
    console.log("GET_JOB_DETAILS_API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const deleteJobApplication = async (applicationId, token) => {
  const toastId = toast.loading("Deleting application...");
  try {
    const response = await apiConnector("DELETE", jobsEndpoints.DELETE_APPLICATION_API.replace(":applicationId", applicationId), null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("DELETE_APPLICATION_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not delete application");
    }

    toast.success("Application deleted successfully");
    return true;
  } catch (error) {
    console.log("DELETE_APPLICATION_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
    return false;
  } finally {
    toast.dismiss(toastId);
  }
};

export const submitJobApplication = async (applicationData, token) => {
  const toastId = toast.loading("Submitting application...");
  let result = null;
  try {
    const response = await apiConnector("POST", SUBMIT_APPLICATION_API, applicationData, {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    });

    console.log("SUBMIT_APPLICATION_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not submit application");
    }

    result = response?.data?.application;
    toast.success("Application submitted successfully!");
  } catch (error) {
    console.log("SUBMIT_APPLICATION_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// ================ ADMIN JOB FUNCTIONS ================

export const createJob = async (jobData, token) => {
  const toastId = toast.loading("Creating job...");
  let result = null;
  try {
    const response = await apiConnector("POST", CREATE_JOB_API, jobData, {
      Authorization: `Bearer ${token}`,
    });

    console.log("CREATE_JOB_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not create job");
    }

    result = response?.data?.job;
    toast.success("Job created successfully!");
  } catch (error) {
    console.log("CREATE_JOB_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const getAllJobs = async (token) => {
  const toastId = toast.loading("Loading jobs...");
  let result = [];
  try {
    const response = await apiConnector("GET", GET_ALL_JOBS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("GET_ALL_JOBS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not fetch jobs");
    }
    result = response?.data?.jobs;
  } catch (error) {
    console.log("GET_ALL_JOBS_API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const updateJob = async (jobId, jobData, token) => {
  const toastId = toast.loading("Updating job...");
  let result = null;
  try {
    const response = await apiConnector("PUT", UPDATE_JOB_API.replace(":jobId", jobId), jobData, {
      Authorization: `Bearer ${token}`,
    });

    console.log("UPDATE_JOB_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update job");
    }

    result = response?.data?.job;
    toast.success("Job updated successfully!");
  } catch (error) {
    console.log("UPDATE_JOB_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const deleteJob = async (jobId, token) => {
  const toastId = toast.loading("Deleting job...");
  let result = false;
  try {
    const response = await apiConnector("DELETE", DELETE_JOB_API.replace(":jobId", jobId), null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("DELETE_JOB_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not delete job");
    }

    result = true;
    toast.success("Job deleted successfully!");
  } catch (error) {
    console.log("DELETE_JOB_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const toggleJobPublication = async (jobId, token) => {
  const toastId = toast.loading("Updating job status...");
  let result = null;
  try {
    const response = await apiConnector("PATCH", TOGGLE_JOB_PUBLICATION_API.replace(":jobId", jobId), {}, {
      Authorization: `Bearer ${token}`,
    });

    console.log("TOGGLE_JOB_PUBLICATION_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update job status");
    }

    result = response?.data?.job;
    toast.success(response?.data?.message);
  } catch (error) {
    console.log("TOGGLE_JOB_PUBLICATION_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};

// ================ APPLICATION MANAGEMENT FUNCTIONS ================

export const getJobApplications = async (jobId, token) => {
  const toastId = toast.loading("Loading applications...");
  let result = [];
  try {
    const response = await apiConnector("GET", GET_JOB_APPLICATIONS_API.replace(":jobId", jobId), null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("GET_JOB_APPLICATIONS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not fetch applications");
    }
    result = response?.data?.applications;
  } catch (error) {
    console.log("GET_JOB_APPLICATIONS_API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const getAllApplications = async (token) => {
  const toastId = toast.loading("Loading all applications...");
  let result = [];
  try {
    const response = await apiConnector("GET", GET_ALL_APPLICATIONS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("GET_ALL_APPLICATIONS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not fetch applications");
    }
    result = response?.data?.applications;
  } catch (error) {
    console.log("GET_ALL_APPLICATIONS_API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const updateApplicationStatus = async (applicationId, statusData, token) => {
  const toastId = toast.loading("Updating application status...");
  let result = null;
  try {
    const response = await apiConnector("PATCH", UPDATE_APPLICATION_STATUS_API.replace(":applicationId", applicationId), statusData, {
      Authorization: `Bearer ${token}`,
    });

    console.log("UPDATE_APPLICATION_STATUS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update application status");
    }

    result = response?.data?.application;
    toast.success("Application status updated successfully!");
  } catch (error) {
    console.log("UPDATE_APPLICATION_STATUS_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const getJobsAnalytics = async (token) => {
  const toastId = toast.loading("Loading analytics...");
  let result = null;
  try {
    const response = await apiConnector("GET", GET_JOBS_ANALYTICS_API, null, {
      Authorization: `Bearer ${token}`,
    });

    console.log("GET_JOBS_ANALYTICS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error("Could not fetch analytics");
    }
    result = response?.data?.analytics;
  } catch (error) {
    console.log("GET_JOBS_ANALYTICS_API ERROR............", error);
    toast.error(error.message);
  }
  toast.dismiss(toastId);
  return result;
};

export const bulkUpdateApplicationStatus = async (applicationIds, statusData, token) => {
  const toastId = toast.loading("Updating applications...");
  let result = false;
  try {
    const response = await apiConnector("PATCH", BULK_UPDATE_APPLICATION_STATUS_API, {
      applicationIds,
      ...statusData
    }, {
      Authorization: `Bearer ${token}`,
    });

    console.log("BULK_UPDATE_APPLICATION_STATUS_API RESPONSE............", response);

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Could not update applications");
    }

    result = true;
    toast.success(response?.data?.message);
  } catch (error) {
    console.log("BULK_UPDATE_APPLICATION_STATUS_API ERROR............", error);
    toast.error(error?.response?.data?.message || error.message);
  }
  toast.dismiss(toastId);
  return result;
};
