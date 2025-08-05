  import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaSpinner, FaVideo, FaCheckCircle, FaTimesCircle, FaCertificate } from 'react-icons/fa';
import { getStudentProgress } from '../../../../services/operations/adminAPI';
import { formatDate } from '../../../../utils/dateFormatter';

const ProgressDetails = ({ courseId, studentId }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { token } = useSelector((state) => state.auth);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const progressData = await getStudentProgress(courseId, studentId, token);
      setProgress(progressData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error refreshing progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progressData = await getStudentProgress(courseId, studentId, token);
        setProgress(progressData);
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId, studentId, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-yellow-50 text-3xl" />
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center text-richblack-400 py-8">
        No progress data available
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-richblack-5">Student Progress</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-richblack-300">
            Last updated: {formatDate(lastUpdated)}
          </span>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-richblack-900 rounded-lg hover:bg-yellow-100 transition-all duration-200 disabled:opacity-50"
          >
            <FaSpinner className={`${loading ? 'animate-spin' : 'hidden'}`} />
            Refresh
          </button>
        </div>
      </div>
      {/* Overall Progress */}
      <div className="bg-richblack-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-richblack-5 mb-4">Overall Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-richblack-600 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-richblack-300">Completion</span>
              <span className="text-yellow-50 text-lg font-semibold">
                {progress.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-richblack-700 rounded-full h-2">
              <div
                className="bg-yellow-50 h-2 rounded-full"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-richblack-600 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FaVideo className="text-yellow-50" />
              <span className="text-richblack-300">Videos Completed</span>
            </div>
            <span className="text-lg font-semibold text-richblack-5">
              {progress.completedVideos?.length || 0} / {progress.totalVideos || 0}
            </span>
          </div>

          <div className="bg-richblack-600 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FaCertificate className="text-yellow-50" />
              <span className="text-richblack-300">Quizzes Passed</span>
            </div>
            <span className="text-lg font-semibold text-richblack-5">
              {progress.passedQuizzes?.length || 0} / {progress.totalQuizzes || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Quiz Results */}
      <div className="bg-richblack-700 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-richblack-5 mb-4">Quiz Results</h3>
        <div className="space-y-4">
          {progress.quizResults?.map((result) => (
            <div 
              key={result._id}
              className="bg-richblack-600 p-4 rounded-lg hover:bg-richblack-500 transition-all duration-200"
            >
              {/* Quiz Header */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className="text-lg font-semibold text-richblack-5">
                    Quiz: {result.quiz.videoTitle || result.quiz.title}
                  </h4>
                  <p className="text-sm text-richblack-300">
                    Section: {result.quiz.section || 'General'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  result.passed 
                    ? 'bg-green-400' 
                    : 'bg-red-400'
                }`}>
                  {result.passed ? 'Passed' : 'Failed'}
                </div>
              </div>

              {/* Quiz Stats */}
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div className="bg-richblack-700 p-3 rounded-lg">
                  <p className="text-sm text-richblack-300">Score</p>
                  <p className="text-lg font-semibold text-yellow-50">
                    {result.score}/{result.totalMarks}
                  </p>
                </div>
                <div className="bg-richblack-700 p-3 rounded-lg">
                  <p className="text-sm text-richblack-300">Percentage</p>
                  <p className="text-lg font-semibold text-yellow-50">
                    {result.percentage}%
                  </p>
                </div>
                <div className="bg-richblack-700 p-3 rounded-lg">
                  <p className="text-sm text-richblack-300">Attempts</p>
                  <p className="text-lg font-semibold text-yellow-50">
                    {result.attempts}
                  </p>
                </div>
                <div className="bg-richblack-700 p-3 rounded-lg">
                  <p className="text-sm text-richblack-300">Status</p>
                  {result.passed ? (
                    <div>
                      <p className="text-sm font-semibold text-green-400">Completed</p>
                      <p className="text-xs text-richblack-300">
                        {formatDate(result.completedAt)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-red-400">Not Completed</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(!progress.quizResults || progress.quizResults.length === 0) && (
            <div className="text-center text-richblack-400 py-4">
              No quiz attempts yet
            </div>
          )}
        </div>
      </div>

      {/* Certificate Status */}
      {progress.certificateStatus && (
        <div className="bg-richblack-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-richblack-5 mb-4">Certificate Status</h3>
          <div className="bg-richblack-600 p-4 rounded-lg flex items-center justify-between">
            <div>
              <h4 className="text-richblack-5 font-medium mb-1">
                Course Certificate
              </h4>
              <p className="text-sm text-richblack-300">
                Issued: {progress.certificateStatus?.issuedDate ? formatDate(progress.certificateStatus.issuedDate) : 'Not available'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <FaCertificate className="text-yellow-50 text-2xl" />
              <span className="text-green-500 font-medium">Earned</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressDetails;
