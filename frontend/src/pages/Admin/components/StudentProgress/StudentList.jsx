import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSearch, FaSpinner, FaGraduationCap, FaCertificate } from 'react-icons/fa';
import { getStudentsByCourse } from '../../../../services/operations/adminAPI';
import { formatDate } from '../../../../utils/dateFormatter';

const StudentList = ({ courseId, onStudentSelect }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await getStudentsByCourse(courseId, token);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId, token]);

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-richblack-700 rounded-lg text-richblack-5 
                   placeholder-richblack-400 focus:outline-none focus:ring-2 focus:ring-yellow-50"
        />
        <FaSearch className="absolute right-3 top-3 text-richblack-400" />
      </div>

      {/* Students list */}
      <div className="space-y-4">
        {filteredStudents.map((student) => (
          <div
            key={student._id}
            onClick={() => onStudentSelect(student)}
            className="bg-richblack-700 p-6 rounded-lg cursor-pointer 
                     hover:bg-richblack-600 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Student avatar */}
                <div className="w-12 h-12 rounded-full bg-richblack-500 flex items-center justify-center">
                  {student.image ? (
                    <img
                      src={student.image}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl text-richblack-50">
                      {student.firstName[0]}
                    </span>
                  )}
                </div>

                {/* Student details */}
                <div>
                  <h3 className="text-lg font-semibold text-richblack-5">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-richblack-300">{student.email}</p>
                </div>
              </div>

              {/* Progress indicators */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="flex items-center text-yellow-50 mb-1">
                    <FaGraduationCap className="mr-2" />
                    <span>{student.progress?.completedVideos?.length || 0}</span>
                  </div>
                  <p className="text-xs text-richblack-300">Videos</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center text-yellow-50 mb-1">
                    <FaCertificate className="mr-2" />
                    <span>{student.progress?.passedQuizzes?.length || 0}</span>
                  </div>
                  <p className="text-xs text-richblack-300">Quizzes</p>
                </div>

                <div className="text-center">
                  <div className="text-yellow-50 mb-1">
                    {student.progress?.progressPercentage || 0}%
                  </div>
                  <p className="text-xs text-richblack-300">Complete</p>
                </div>
              </div>

              {/* View details button */}
              <button 
                className="text-yellow-50 hover:text-yellow-100 flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onStudentSelect(student);
                }}
              >
                View Details
                <span className="ml-2">→</span>
              </button>
            </div>

            {/* Enrollment date */}
            <div className="mt-4 text-sm text-richblack-300">
              Enrolled: {formatDate(student.enrolledAt)}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredStudents.length === 0 && (
        <div className="text-center text-richblack-400 py-8">
          {searchTerm ? "No students found matching your search" : "No students enrolled in this course"}
        </div>
      )}
    </div>
  );
};

export default StudentList;
