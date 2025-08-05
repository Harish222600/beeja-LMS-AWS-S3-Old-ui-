import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaPlus, FaEdit } from 'react-icons/fa';
import { getAllCourses } from '../../../services/operations/adminAPI';
import { getFullDetailsOfCourse } from '../../../services/operations/courseDetailsAPI';
import { showAllCategories } from '../../../services/operations/categoryAPI';
import QuizCreator from './QuizCreator';

const QuizManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [selectedSubSection, setSelectedSubSection] = useState(null);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const categoriesData = await showAllCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Error fetching categories:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setCategories([]);
      // You might want to show a toast error here
      // toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCourses = async (categoryId) => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching courses with token:", token);
      
      // Get all courses from admin API
      const result = await getAllCourses(token);
      console.log("Courses data received:", result);
      
      if (!result?.courses) {
        throw new Error("No courses data received");
      }

      // Filter courses by category if a category is selected
      console.log("Filtering courses for category:", categoryId);
      console.log("Available courses:", result.courses);
      
      const filteredCourses = categoryId 
        ? result.courses.filter(course => {
            console.log("Course category:", course.category);
            return course.category?._id === categoryId;
          })
        : result.courses;

      console.log("Filtered courses:", filteredCourses);
      setCourses(filteredCourses || []);
    } catch (error) {
      console.error("Error fetching courses:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setCourses([]);
      // You might want to show a toast error here
      // toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    setLoadingCourseDetails(true);
    try {
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await getFullDetailsOfCourse(courseId, token);
      console.log("Course details API response:", response);
      
      if (!response?.courseDetails) {
        throw new Error("No course details in response");
      }
      
      setSelectedCourseDetails(response.courseDetails);
    } catch (error) {
      console.error("Error fetching course details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setSelectedCourseDetails(null);
      // You might want to show a toast error here
      // toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoadingCourseDetails(false);
    }
  };

  const getSubSections = () => {
    try {
      console.log("Getting subsections from course details:", selectedCourseDetails);
      
      if (!selectedCourseDetails) {
        console.log("No course details available");
        return [];
      }
      
      if (!selectedCourseDetails.courseContent) {
        console.log("No course content in details");
        return [];
      }
      
      console.log("Course content:", selectedCourseDetails.courseContent);
      
      const subsections = selectedCourseDetails.courseContent.reduce((acc, section) => {
        console.log("Processing section:", section);
        if (section.subSection && Array.isArray(section.subSection)) {
          const sectionSubsections = section.subSection.map(sub => ({
            ...sub,
            sectionName: section.sectionName || 'Unknown Section'
          }));
          console.log("Section subsections:", sectionSubsections);
          return [...acc, ...sectionSubsections];
        }
        return acc;
      }, []);
      
      console.log("All subsections:", subsections);
      return subsections;
    } catch (error) {
      console.error("Error in getSubSections:", error);
      return [];
    }
  };

  const handleQuizCreated = () => {
    // Refresh course details to get updated quiz data
    if (selectedCourse) {
      fetchCourseDetails(selectedCourse._id);
    }
    setShowQuizForm(false);
  };

  try {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl sm:text-2xl font-bold text-richblack-5">Quiz Management</h1>
        
        {/* Category Selection */}
        {loadingCategories ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-50"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="text-sm text-richblack-5">Select Category</label>
            <select
              value={selectedCategory || ""}
              onChange={(e) => {
                try {
                  const categoryId = e.target.value;
                  setSelectedCategory(categoryId);
                  setSelectedCourse(null);
                  setSelectedCourseDetails(null);
                  setSelectedSubSection(null);
                  if (categoryId) {
                    fetchCourses(categoryId);
                  }
                } catch (error) {
                  console.error("Error in category selection:", error);
                }
              }}
              className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3 text-sm sm:text-base"
            >
              <option value="">Select a category</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Course Selection */}
        {selectedCategory && (
          loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-50"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="text-sm text-richblack-5">Select Course</label>
              <select
                value={selectedCourse?._id || ""}
                onChange={(e) => {
                  try {
                    const course = courses.find(c => c._id === e.target.value);
                    setSelectedCourse(course);
                    setSelectedCourseDetails(null);
                    setSelectedSubSection(null);
                    if (course) {
                      fetchCourseDetails(course._id);
                    }
                  } catch (error) {
                    console.error("Error in course selection:", error);
                  }
                }}
                className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3 text-sm sm:text-base"
              >
                <option value="">Select a course</option>
                {courses?.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseName}
                  </option>
                ))}
              </select>

              {courses.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <p className="text-lg sm:text-xl font-semibold text-richblack-100">No courses found</p>
                  <p className="text-sm sm:text-base text-richblack-400">There are no courses available in this category.</p>
                </div>
              )}
            </div>
          )
        )}

        {/* Lectures List */}
        {selectedCourse && (
          <div className="space-y-4">
            {loadingCourseDetails && (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-50"></div>
                <span className="ml-2 text-richblack-300 text-sm">Loading course details...</span>
              </div>
            )}
            
            {selectedCourseDetails && !loadingCourseDetails && (
              <div className="space-y-4">
                <label className="text-lg font-semibold text-richblack-5">Lectures</label>
                <div className="space-y-3">
                  {getSubSections().map((subsection, index) => (
                    <div key={subsection._id} className="bg-richblack-700 rounded-lg p-4 flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="text-richblack-5 font-medium">
                          {subsection.sectionName} - {subsection.title}
                        </h4>
                        {subsection.quiz && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-richblack-300">
                              Questions: {subsection.quiz.questions?.length || 0}
                            </p>
                            <p className="text-sm text-richblack-300">
                              Total Marks: {subsection.quiz.questions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0}
                            </p>
                            <p className="text-sm text-richblack-300">
                              Time Limit: {Math.floor((subsection.quiz.timeLimit || 1800) / 60)} minutes
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {subsection.quiz ? (
                          <button
                            onClick={() => {
                              setSelectedSubSection(subsection);
                              setShowQuizForm(true);
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200"
                          >
                            <FaEdit className="text-sm" />
                            <span>Edit</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSubSection(subsection);
                              setShowQuizForm(true);
                            }}
                            className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-4 py-2 rounded-lg hover:scale-95 transition-all duration-200"
                          >
                            <FaPlus className="text-sm" />
                            <span>Add Quiz</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {getSubSections().length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center bg-richblack-700 rounded-lg">
                      <p className="text-xl font-semibold text-richblack-100">No lectures found</p>
                      <p className="text-richblack-400">This course doesn't have any lectures yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Creator Modal */}
        {showQuizForm && selectedSubSection && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-richblack-800 rounded-lg p-4 sm:p-6 w-full max-w-[800px] max-h-[90vh] overflow-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h3 className="text-lg sm:text-xl font-semibold text-richblack-5">
                  {selectedSubSection.quiz ? 'Edit' : 'Add'} Quiz - {selectedSubSection.title}
                </h3>
                <button
                  onClick={() => setShowQuizForm(false)}
                  className="text-richblack-300 hover:text-richblack-50 text-xl self-end sm:self-auto"
                >
                  ✕
                </button>
              </div>
              <QuizCreator
                subSectionId={selectedSubSection._id}
                existingQuiz={selectedSubSection.quiz}
                onClose={() => setShowQuizForm(false)}
                onSuccess={handleQuizCreated}
              />
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error rendering QuizManagement component:", error);
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-richblack-5">Quiz Management</h1>
        <div className="bg-pink-900 border border-pink-700 rounded-lg p-6">
          <p className="text-pink-200">
            An error occurred while loading the quiz management interface. Please refresh the page and try again.
          </p>
          <p className="text-pink-300 text-sm mt-2">
            Error: {error.message}
          </p>
        </div>
      </div>
    );
  }
};

export default QuizManagement;
