import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FiUser, FiBook, FiCalendar, FiMessageSquare, FiCheck, FiX, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi'
import { getAllAccessRequests, handleAccessRequest } from '../../../../services/operations/courseAccessAPI'
import { formatDate, getRelativeTime } from '../../../../utils/dateFormatter'
import toast from 'react-hot-toast'

export default function CourseAccessRequests() {
  const { token } = useSelector((state) => state.auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState('Pending')
  const [processingId, setProcessingId] = useState(null)

  useEffect(() => {
    fetchAccessRequests()
  }, [currentPage, selectedStatus])

  const fetchAccessRequests = async () => {
    setLoading(true)
    try {
      const result = await getAllAccessRequests(token, selectedStatus, currentPage)
      if (result) {
        setRequests(result.data)
        setTotalPages(result.pagination.totalPages)
      }
    } catch (error) {
      toast.error('Failed to fetch access requests')
    }
    setLoading(false)
  }

  const handleStatusChange = async (requestId, action, adminResponse = '') => {
    setProcessingId(requestId)
    try {
      const result = await handleAccessRequest(requestId, action, adminResponse, token)
      if (result) {
        toast.success(`Request ${action}d successfully`)
        await fetchAccessRequests()
      }
    } catch (error) {
      toast.error(`Failed to ${action} request`)
      console.error('Error handling status change:', error)
    }
    setProcessingId(null)
  }

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      Approved: 'bg-green-500/10 text-green-400 border-green-500/20',
      Rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
    }
    return badges[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Course Access Requests
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Manage student course access requests
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <FiFilter className="text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              <option value="Pending">Pending Requests</option>
              <option value="Approved">Approved Requests</option>
              <option value="Rejected">Rejected Requests</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDelay: '0.15s' }}></div>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <FiMessageSquare className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No {selectedStatus.toLowerCase()} requests found
            </h3>
            <p className="text-slate-400 text-center max-w-md">
              {selectedStatus === 'Pending' 
                ? "All caught up! No pending requests to review at the moment."
                : `No ${selectedStatus.toLowerCase()} requests to display.`
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        Student
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiBook className="w-4 h-4" />
                        Course
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FiMessageSquare className="w-4 h-4" />
                        Message
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300 min-w-[200px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={request.user?.image || '/default-avatar.png'}
                              alt={request.user?.firstName || 'User'}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-600/50"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {request.user?.firstName || 'Unknown'} {request.user?.lastName || 'User'}
                            </p>
                            <p className="text-sm text-slate-400">{request.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={request.course?.thumbnail || '/default-course.png'}
                            alt={request.course?.courseName || 'Course'}
                            className="w-12 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-white line-clamp-1">
                              {request.course?.courseName || 'Unknown Course'}
                            </p>
                            <p className="text-sm text-slate-400">
                              {request.course?.category?.name || 'No category'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm text-white">{getRelativeTime(request.requestDate)}</p>
                          <p className="text-xs text-slate-400">{formatDate(request.requestDate)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-slate-300 max-w-xs line-clamp-2">
                          {request.requestMessage || "No message provided"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        {selectedStatus === 'Pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStatusChange(request._id, 'approve')}
                              disabled={processingId === request._id}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiCheck className="w-4 h-4" />
                              <span className="text-sm font-medium">Approve</span>
                            </button>
                            <button
                              onClick={() => handleStatusChange(request._id, 'reject')}
                              disabled={processingId === request._id}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiX className="w-4 h-4" />
                              <span className="text-sm font-medium">Reject</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedStatus)}`}>
                              {selectedStatus}
                            </span>
                            {request.adminResponse && (
                              <p className="text-xs text-slate-400 max-w-xs line-clamp-1">
                                {request.adminResponse}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-6">
              {requests.map((request) => (
                <div key={request._id} className="bg-slate-700/30 rounded-xl p-4 space-y-4">
                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={request.user?.image || '/default-avatar.png'}
                      alt={request.user?.firstName || 'User'}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-600/50"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {request.user?.firstName || 'Unknown'} {request.user?.lastName || 'User'}
                      </p>
                      <p className="text-sm text-slate-400">{request.user?.email || 'No email'}</p>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={request.course?.thumbnail || '/default-course.png'}
                      alt={request.course?.courseName || 'Course'}
                      className="w-16 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white line-clamp-1">
                        {request.course?.courseName || 'Unknown Course'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {getRelativeTime(request.requestDate)}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  {request.requestMessage && (
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-sm text-slate-300">
                        {request.requestMessage}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedStatus === 'Pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(request._id, 'approve')}
                        disabled={processingId === request._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <FiCheck className="w-4 h-4" />
                        <span className="font-medium">Approve</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(request._id, 'reject')}
                        disabled={processingId === request._id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <FiX className="w-4 h-4" />
                        <span className="font-medium">Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(selectedStatus)}`}>
                        {selectedStatus}
                      </span>
                      {request.adminResponse && (
                        <p className="text-sm text-slate-400 flex-1 ml-3">
                          {request.adminResponse}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-slate-700/50 p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
