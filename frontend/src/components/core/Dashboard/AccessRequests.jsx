import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FiBook, FiClock, FiMessageSquare, FiCheckCircle, FiXCircle, FiAlertCircle, FiPlay, FiFilter, FiSearch } from 'react-icons/fi'
import { getUserAccessRequests } from '../../../services/operations/courseAccessAPI'
import { getRelativeTime, formatDate } from '../../../utils/dateFormatter'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AccessRequests() {
  const { token } = useSelector((state) => state.auth)
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    let filtered = requests
    
    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(request => request.status === statusFilter)
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestMessage?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredRequests(filtered)
  }, [statusFilter, requests, searchTerm])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const result = await getUserAccessRequests(token)
      if (result) {
        setRequests(result)
      }
    } catch (error) {
      toast.error('Failed to fetch access requests')
    }
    setLoading(false)
  }

  const getStatusConfig = (status) => {
    const configs = {
      Pending: {
        color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        icon: FiAlertCircle,
        bgGradient: 'from-yellow-500/5 to-orange-500/5'
      },
      Approved: {
        color: 'bg-green-500/10 text-green-400 border-green-500/20',
        icon: FiCheckCircle,
        bgGradient: 'from-green-500/5 to-emerald-500/5'
      },
      Rejected: {
        color: 'bg-red-500/10 text-red-400 border-red-500/20',
        icon: FiXCircle,
        bgGradient: 'from-red-500/5 to-pink-500/5'
      }
    }
    return configs[status] || {
      color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      icon: FiAlertCircle,
      bgGradient: 'from-slate-500/5 to-gray-500/5'
    }
  }

  const getRequestStats = () => {
    const stats = {
      total: requests.length,
      pending: requests.filter(r => r.status === 'Pending').length,
      approved: requests.filter(r => r.status === 'Approved').length,
      rejected: requests.filter(r => r.status === 'Rejected').length
    }
    return stats
  }

  const stats = getRequestStats()

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Header Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              My Course Requests
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track your course access requests and their status
            </p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="bg-slate-700/30 rounded p-2 text-center">
              <p className="text-lg font-semibold text-white">{stats.total}</p>
              <p className="text-xs text-slate-400">Total</p>
            </div>
            <div className="bg-yellow-500/10 rounded p-2 text-center border border-yellow-500/20">
              <p className="text-lg font-semibold text-yellow-400">{stats.pending}</p>
              <p className="text-xs text-yellow-400">Pending</p>
            </div>
            <div className="bg-green-500/10 rounded p-2 text-center border border-green-500/20">
              <p className="text-lg font-semibold text-green-400">{stats.approved}</p>
              <p className="text-xs text-green-400">Approved</p>
            </div>
            <div className="bg-red-500/10 rounded p-2 text-center border border-red-500/20">
              <p className="text-lg font-semibold text-red-400">{stats.rejected}</p>
              <p className="text-xs text-red-400">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses or messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <FiFilter className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
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
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <FiBook className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {requests.length === 0 ? 'No requests yet' : 'No matching requests'}
            </h3>
            <p className="text-slate-400 text-center max-w-md mb-6">
              {requests.length === 0 
                ? "You haven't made any course access requests yet. Browse our free courses to get started!"
                : "No requests match your current filters. Try adjusting your search or filter criteria."
              }
            </p>
            {requests.length === 0 && (
              <Link
                to="/free-courses"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105"
              >
                <FiBook className="w-4 h-4" />
                Browse Free Courses
              </Link>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredRequests.map((request) => {
                const statusConfig = getStatusConfig(request.status)
                const StatusIcon = statusConfig.icon
                
                return (
                  <div
                    key={request._id}
                    className={`relative bg-gradient-to-br ${statusConfig.bgGradient} rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 group`}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {request.status}
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex gap-4 mb-4">
                      <div className="relative group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={request.course.thumbnail}
                          alt={request.course.courseName}
                          className="w-24 h-16 rounded-xl object-cover ring-2 ring-slate-600/50"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg line-clamp-2 mb-2">
                          {request.course.courseName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <FiClock className="w-4 h-4" />
                          <span>Requested {getRelativeTime(request.requestDate)}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(request.requestDate)}
                        </p>
                      </div>
                    </div>

                    {/* Request Message */}
                    {request.requestMessage && (
                      <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiMessageSquare className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-300">Your message:</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {request.requestMessage}
                        </p>
                      </div>
                    )}

                    {/* Admin Response */}
                    {request.adminResponse && (
                      <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-600/30">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">A</span>
                          </div>
                          <span className="text-sm font-medium text-slate-300">Admin response:</span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          {request.adminResponse}
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    {request.status === 'Approved' && (
                      <Link
                        to={`/view-course/${request.course._id}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 font-medium"
                      >
                        <FiPlay className="w-4 h-4" />
                        Start Learning
                      </Link>
                    )}

                    {request.status === 'Pending' && (
                      <div className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 font-medium">
                        <FiClock className="w-4 h-4" />
                        Awaiting Review
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
