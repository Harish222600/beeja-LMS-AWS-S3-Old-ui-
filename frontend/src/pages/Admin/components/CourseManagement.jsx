import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { getAllCourses, approveCourse, deleteCourse, toggleCourseVisibility, setCourseType } from "../../../services/operations/adminAPI";
import { moveToRecycleBin } from "../../../services/operations/recycleBinAPI";
import { getFullDetailsOfCourse } from "../../../services/operations/courseDetailsAPI";
import { FaCheck, FaTrash, FaEye, FaEyeSlash, FaPlus, FaEdit, FaSearch, FaTimes, FaDollarSign, FaTag } from "react-icons/fa";
import { toast } from "react-hot-toast";
import CreateCourse from "./CreateCourse/CreateCourse";
import EditCourse from "./EditCourse";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const CourseManagement = () => {
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Optimized fetch courses with caching and debouncing
  const fetchCourses = useCallback(async () => {
    if (!token) {
      setError("Authentication token is missing");
      return;
    }

    setLoading(true);
    try {
      const response = await getAllCourses(token);
      
      if (!response || !response.courses) {
        throw new Error("No courses data received");
      }

      setCourses(response.courses);
      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch courses';
      setError(errorMessage);
      // Only show toast for unexpected errors, not for missing token
      if (err.message !== "No authentication token found") {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCourses();
    } else {
      setError("Authentication token is missing");
      // Remove duplicate toast - this will be handled by auth system
    }
  }, [token]);

  const handleApproveCourse = async (courseId) => {
    try {
      await approveCourse(courseId, token);
      fetchCourses(); // Refresh course list
    } catch (error) {
      setError(error.message);
    }
  };

  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [togglingCourseId, setTogglingCourseId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const handleDeleteCourse = useCallback((course) => {
    setConfirmationModal({
      text1: "Move Course to Recycle Bin?",
      text2: `Are you sure you want to move the course "${course.courseName}" to recycle bin? It will be automatically deleted after 30 days, but you can restore it anytime before that.`,
      btn1Text: "Move to Recycle Bin",
      btn2Text: "Cancel",
      btn1Handler: () => confirmDeleteCourse(course._id, course.courseName),
      btn2Handler: () => setConfirmationModal(null),
    });
  }, []);

  const confirmDeleteCourse = useCallback(async (courseId, courseName) => {
    if (!token) {
      return;
    }

    try {
      setDeletingCourseId(courseId);
      setError(null);
      setConfirmationModal(null);
      
      const result = await moveToRecycleBin(token, 'Course', courseId, `Course moved to recycle bin by admin`);
      
      if (result) {
        toast.success("Course moved to recycle bin successfully");
        // Optimistic update - remove from local state immediately
        setCourses(prevCourses => prevCourses.filter(course => course._id !== courseId));
      }
      
    } catch (error) {
      console.error('Move to recycle bin operation failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to move course to recycle bin';
      toast.error(errorMessage);
    } finally {
      setDeletingCourseId(null);
    }
  }, [token]);

  const handleToggleVisibility = useCallback(async (courseId) => {
    if (!token) {
      return;
    }
    try {
      setTogglingCourseId(courseId);
      const response = await toggleCourseVisibility(courseId, token);
      if (response) {
        // Optimistic update - update local state immediately with both isVisible and status
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId 
              ? { 
                  ...course, 
                  isVisible: !course.isVisible,
                  status: !course.isVisible ? 'Published' : 'Draft'
                }
              : course
          )
        );
      }
    } catch (error) {
      console.error('Toggle course visibility failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update course visibility');
    } finally {
      setTogglingCourseId(null);
    }
  }, [token]);

  const handleEditCourse = async (course) => {
    try {
      console.log("Fetching full course details for editing...");
      const fullCourseDetails = await getFullDetailsOfCourse(course._id, token);
      if (fullCourseDetails?.data) {
        console.log("Full course details fetched:", fullCourseDetails.data);
        setEditingCourse(fullCourseDetails.data);
      } else {
        console.log("Using basic course details:", course);
        setEditingCourse(course);
      }
    } catch (error) {
      console.error("Error fetching full course details:", error);
      // Only show toast for critical errors, fallback to basic course details
      if (error.response?.status !== 404) {
        toast.error("Error loading course details");
      }
      setEditingCourse(course);
    }
    setShowCreateCourse(false);
  };

  const handleCourseTypeChange = useCallback(async (courseId, newType) => {
    if (!token) {
      return;
    }
    try {
      setProcessingId(courseId);
      const response = await setCourseType(courseId, newType, token);
      if (response) {
        // Optimistic update - update local state immediately
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId 
              ? { ...course, courseType: newType }
              : course
          )
        );
      }
    } catch (error) {
      console.error('Change course type failed:', error);
      toast.error(error.response?.data?.message || 'Failed to change course type');
    } finally {
      setProcessingId(null);
    }
  }, [token]);

  const handleViewCourse = (courseId) => {
    // Implement course preview/details view
    console.log("View course:", courseId);
  };

  // Memoized filtered courses for better performance
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = searchTerm === "" || 
        course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${course.instructor?.firstName} ${course.instructor?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "published" && course.status === "Published") ||
        (statusFilter === "draft" && course.status === "Draft") ||
        (statusFilter === "visible" && course.isVisible) ||
        (statusFilter === "hidden" && !course.isVisible);
      
      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  // Memoized statistics calculation
  const courseStats = useMemo(() => {
    const totalCourses = courses.length;
    const pendingCourses = courses.filter(course => 
      course.status === 'Draft' && course.isVisible
    ).length;
    const activeCourses = courses.filter(course => course.status === 'Published').length;
    
    return { totalCourses, pendingCourses, activeCourses };
  }, [courses]);

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="text-richblack-5">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h4 className="text-lg font-semibold">Course Management</h4>
          <button
            onClick={() => setShowCreateCourse(true)}
            className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg hover:bg-yellow-100 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <FaPlus className="w-4 h-4" />
            Create Course
          </button>
        </div>
        
        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-richblack-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses by title, instructor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-richblack-400 hover:text-richblack-200"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
              >
                <option value="all">All Courses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== "all") && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 px-4 py-2.5 bg-richblack-600 text-richblack-200 rounded-lg hover:bg-richblack-500 transition-colors whitespace-nowrap"
              >
                <FaTimes className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="text-sm text-richblack-300">
              Showing {filteredCourses.length} of {courseStats.totalCourses} courses
              {searchTerm && (
                <span> matching "{searchTerm}"</span>
              )}
              {statusFilter !== "all" && (
                <span> with status "{statusFilter}"</span>
              )}
            </div>
          )}
        </div>
        
        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-richblack-700 p-2.5 rounded">
            <h5 className="text-xs text-richblack-50">Total Courses</h5>
            <p className="text-lg font-semibold text-yellow-50 mt-0.5">{courseStats.totalCourses}</p>
          </div>
          <div className="bg-richblack-700 p-2.5 rounded">
            <h5 className="text-xs text-richblack-50">Pending Approval</h5>
            <p className="text-lg font-semibold text-yellow-50 mt-0.5">{courseStats.pendingCourses}</p>
          </div>
          <div className="bg-richblack-700 p-2.5 rounded">
            <h5 className="text-xs text-richblack-50">Active Courses</h5>
            <p className="text-lg font-semibold text-yellow-50 mt-0.5">{courseStats.activeCourses}</p>
          </div>
        </div>
      </div>

      {loading && <p>Loading courses...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {editingCourse ? (
        <EditCourse
          course={editingCourse}
          onCancel={() => setEditingCourse(null)}
          onSave={(updatedCourse) => {
            setEditingCourse(null);
            fetchCourses();
          }}
        />
      ) : showCreateCourse ? (
        <CreateCourse onCancel={() => setShowCreateCourse(false)} />
      ) : !loading && !error && (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-richblack-700">
                  <th className="p-3 border border-richblack-600">Title</th>
                  <th className="p-3 border border-richblack-600">Instructor</th>
                  <th className="p-3 border border-richblack-600">Category</th>
                  <th className="p-3 border border-richblack-600">Price</th>
                  <th className="p-3 border border-richblack-600">Course Type</th>
                  <th className="p-3 border border-richblack-600">Status</th>
                  <th className="p-3 border border-richblack-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-4 text-center">
                      {courseStats.totalCourses === 0 ? "No courses found." : "No courses match your search criteria."}
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course._id} className="border-b border-richblack-600 hover:bg-richblack-700/50">
                      <td className="p-3">{course.courseName}</td>
                      <td className="p-3">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </td>
                      <td className="p-3">{course.category?.name || 'N/A'}</td>
                      <td className="p-3">₹{course.price}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          course.courseType === 'Free'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {course.courseType || 'Paid'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          course.status === 'Published'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {course.status || 'Draft'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <>
                            <button
                              onClick={() => handleToggleVisibility(course._id)}
                              className={`flex items-center gap-2 px-3 py-1.5 ${
                                course.isVisible 
                                  ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' 
                                  : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                              } rounded-lg transition-colors disabled:opacity-50`}
                              disabled={togglingCourseId === course._id}
                              title={course.isVisible ? 'Hide Course' : 'Show Course'}
                            >
                              {togglingCourseId === course._id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-current"/>
                              ) : (
                                <>
                                  {course.isVisible ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                                  <span className="text-xs font-medium">
                                    {course.isVisible ? 'Visible' : 'Hidden'}
                                  </span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleCourseTypeChange(course._id, course.courseType === 'Free' ? 'Paid' : 'Free')}
                              className={`flex items-center gap-2 px-3 py-1.5 ${
                                course.courseType === 'Free'
                                  ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              } rounded-lg transition-colors disabled:opacity-50`}
                              disabled={processingId === course._id}
                              title={course.courseType === 'Free' ? 'Make Paid' : 'Make Free'}
                            >
                              {processingId === course._id ? (
                                <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-current"/>
                              ) : (
                                <>
                                  {course.courseType === 'Free' ? <FaDollarSign size={16} /> : <FaTag size={16} />}
                                  <span className="text-xs font-medium">
                                    {course.courseType === 'Free' ? 'Make Paid' : 'Make Free'}
                                  </span>
                                </>
                              )}
                            </button>
                          </>
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                            title="Edit Course"
                          >
                            <FaEdit size={16} />
                            <span className="text-xs font-medium">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course)}
                            disabled={deletingCourseId === course._id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Move to Recycle Bin"
                          >
                            {deletingCourseId === course._id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-current"/>
                            ) : (
                              <>
                                <FaTrash size={16} />
                            <span className="text-xs font-medium">Move to Bin</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="text-center p-6 bg-richblack-700 rounded-lg">
                <p className="text-base">{courseStats.totalCourses === 0 ? "No courses found." : "No courses match your search criteria."}</p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div key={course._id} className="bg-richblack-700 rounded-lg p-5 space-y-4">
                  {/* Header Section */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-white text-lg leading-tight mb-1">{course.courseName}</h5>
                      <p className="text-base text-richblack-300">
                        {course.instructor?.firstName} {course.instructor?.lastName}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        course.status === 'Published'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {course.status || 'Draft'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        course.courseType === 'Free'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {course.courseType || 'Paid'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Course Details */}
                  <div className="grid grid-cols-1 gap-3 text-base text-richblack-300">
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span> 
                      <span>{course.category?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Price:</span> 
                      <span className="font-semibold text-yellow-50">₹{course.price}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Two Rows for Better Mobile UX */}
                  <div className="space-y-3 pt-3 border-t border-richblack-600">
                    {/* First Row - Toggle Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleToggleVisibility(course._id)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                          course.isVisible 
                            ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' 
                            : 'bg-gray-500/15 text-gray-400 hover:bg-gray-500/25'
                        }`}
                        disabled={togglingCourseId === course._id}
                        title={course.isVisible ? 'Hide Course' : 'Show Course'}
                      >
                        {togglingCourseId === course._id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-current"/>
                        ) : (
                          <>
                            {course.isVisible ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                            <span>
                              {course.isVisible ? 'Visible' : 'Hidden'}
                            </span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleCourseTypeChange(course._id, course.courseType === 'Free' ? 'Paid' : 'Free')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                          course.courseType === 'Free'
                            ? 'bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25'
                            : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                        }`}
                        disabled={processingId === course._id}
                        title={course.courseType === 'Free' ? 'Make Paid' : 'Make Free'}
                      >
                        {processingId === course._id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-current"/>
                        ) : (
                          <>
                            {course.courseType === 'Free' ? <FaDollarSign size={16} /> : <FaTag size={16} />}
                            <span>
                              {course.courseType === 'Free' ? 'Make Paid' : 'Make Free'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Second Row - Edit and Delete */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 rounded-lg text-sm font-medium transition-colors"
                        title="Edit Course"
                      >
                        <FaEdit size={16} />
                        <span>Edit Course</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCourse(course)}
                        disabled={deletingCourseId === course._id}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/15 text-red-400 hover:bg-red-500/25 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        title="Move to Recycle Bin"
                      >
                        {deletingCourseId === course._id ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-b-2 border-current"/>
                        ) : (
                          <>
                            <FaTrash size={16} />
                            <span>Move to Bin</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
      
      {/* Confirmation Modal */}
      {confirmationModal && (
        <ConfirmationModal
          modalData={confirmationModal}
          closeModal={() => setConfirmationModal(null)}
        />
      )}
    </div>
  );
};

export default CourseManagement;
