import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSearch, FaSpinner, FaGraduationCap, FaUsers } from 'react-icons/fa';
import { getAllCourses } from '../../../../services/operations/adminAPI';

const CourseList = ({ categoryId, onCourseSelect }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result = await getAllCourses(token);
        // Filter courses by category
        const coursesData = result?.courses?.filter(course => 
          course.category._id === categoryId
        ) || [];
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [categoryId, token]);

  const filteredCourses = courses.filter(course =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-yellow-50 text-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-richblack-700 rounded-lg text-richblack-5 
                   placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50"
        />
        <FaSearch className="absolute right-3 top-3 text-richblack-400" />
      </div>

      {/* Courses list */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course._id}
            onClick={() => onCourseSelect(course)}
            className="bg-richblack-700 p-6 rounded-lg cursor-pointer 
                     hover:bg-richblack-600 transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              {/* Course thumbnail */}
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={course.thumbnail}
                  alt={course.courseName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Course details */}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-richblack-5 mb-2">
                  {course.courseName}
                </h3>
                <p className="text-sm text-richblack-300 mb-4 line-clamp-2">
                  {course.courseDescription}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-richblack-300">
                    <FaGraduationCap className="mr-2" />
                    <span>{course.totalDuration || '0s'}</span>
                  </div>
                  <div className="flex items-center text-richblack-300">
                    <FaUsers className="mr-2" />
                    <span>{course.studentsEnrolled?.length || 0} Students</span>
                  </div>
                </div>
              </div>

              {/* View details button */}
              <button 
                className="text-yellow-50 hover:text-yellow-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onCourseSelect(course);
                }}
              >
                View Progress
                <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredCourses.length === 0 && (
        <div className="text-center text-richblack-400 py-8">
          {searchTerm ? "No courses found matching your search" : "No courses available in this category"}
        </div>
      )}
    </div>
  );
};

export default CourseList;
