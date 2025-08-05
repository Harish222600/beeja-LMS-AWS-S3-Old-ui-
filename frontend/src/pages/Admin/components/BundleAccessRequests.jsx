import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../../../services/apiConnector';
import { courseAccessEndpoints } from '../../../services/apis';
import { FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const BundleAccessRequests = () => {
  const { token } = useSelector((state) => state.auth);
  const [bundleRequests, setBundleRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');

  useEffect(() => {
    fetchBundleRequests();
  }, [selectedStatus]);

  const fetchBundleRequests = async () => {
    setLoading(true);
    try {
      const response = await apiConnector(
        "GET",
        courseAccessEndpoints.GET_BUNDLE_REQUESTS_API,
        null,
        { Authorization: `Bearer ${token}` }
      );
      // Filter requests based on selected status
      const filteredRequests = response.data.data.filter(
        request => request.status.toLowerCase() === selectedStatus.toLowerCase()
      );
      setBundleRequests(filteredRequests);
    } catch (error) {
      console.error("Error fetching bundle requests:", error);
      toast.error("Failed to fetch bundle requests");
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (bundleId, status) => {
    try {
      const url = courseAccessEndpoints.UPDATE_BUNDLE_REQUEST_STATUS_API.replace(':bundleId', bundleId);
      await apiConnector(
        "POST",
        url,
        {
          status
        },
        { Authorization: `Bearer ${token}` }
      );
      toast.success(`Bundle request ${status} successfully`);
      fetchBundleRequests(); // Refresh the list
    } catch (error) {
      console.error("Error updating bundle request:", error);
      toast.error("Failed to update bundle request");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-50"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-richblack-5">Bundle Access Requests</h2>
            <p className="text-sm sm:text-base text-richblack-200">Manage bundle access requests from students</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm sm:text-base text-richblack-300">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-richblack-700 text-richblack-5 px-3 sm:px-4 py-2 rounded-lg border border-richblack-600 focus:outline-none focus:border-yellow-50 text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {bundleRequests.length === 0 ? (
        <div className="text-center text-richblack-200 py-8 sm:py-10">
          <p className="text-sm sm:text-base">No {selectedStatus} bundle access requests found</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {bundleRequests.map((request) => (
            <div
              key={request._id}
              className="bg-richblack-800 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4"
            >
              {/* User Info */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <img
                  src={request.user.image}
                  alt={request.user.firstName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-richblack-5 truncate">
                    {request.user.firstName} {request.user.lastName}
                  </h3>
                  <p className="text-sm sm:text-base text-richblack-300 truncate">{request.user.email}</p>
                </div>
              </div>

              {/* Courses List */}
              <div className="space-y-2">
                <h4 className="text-xs sm:text-sm font-medium text-richblack-300">Requested Courses:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {request.courses.map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center space-x-2 bg-richblack-700 rounded p-2"
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.courseName}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover flex-shrink-0"
                      />
                      <span className="text-xs sm:text-sm text-richblack-50 truncate">
                        {course.courseName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 text-xs sm:text-sm text-richblack-300">
                <div>
                  Requested: {new Date(request.requestedAt).toLocaleDateString()}
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  {request.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'approved')}
                        className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg bg-caribbeangreen-200 text-richblack-900 hover:bg-caribbeangreen-100 transition-colors text-sm"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'rejected')}
                        className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg bg-pink-200 text-richblack-900 hover:bg-pink-100 transition-colors text-sm"
                      >
                        <FiX className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-center text-sm ${
                      request.status === 'approved' 
                        ? 'bg-caribbeangreen-200 text-richblack-900' 
                        : 'bg-pink-200 text-richblack-900'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BundleAccessRequests;
