import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaDownload, FaEye, FaEdit, FaTrash, FaFilter, FaSearch, FaFileAlt } from 'react-icons/fa';
import { getJobApplications, updateApplicationStatus, deleteJobApplication } from '../../../../services/operations/jobsAPI';

const JobApplications = ({ selectedJob, applications, onRefresh }) => {
  const { token } = useSelector((state) => state.auth);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    job: selectedJob?._id || 'all'
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    filterApplications();
  }, [applications, filters]);

  const filterApplications = () => {
    let filtered = [...applications];

    // Filter by job
    if (filters.job !== 'all') {
      filtered = filtered.filter(app => app.job._id === filters.job);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicantName.toLowerCase().includes(searchLower) ||
        app.email.toLowerCase().includes(searchLower) ||
        app.job.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredApplications(filtered);
  };

  const handleStatusUpdate = async (applicationId, newStatus, notes = '') => {
    setLoading(true);
    try {
      await updateApplicationStatus(applicationId, { status: newStatus, notes }, token);
      await onRefresh();
      setShowStatusModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Under Review': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Shortlisted': { bg: 'bg-green-100', text: 'text-green-800' },
      'Interview Scheduled': { bg: 'bg-purple-100', text: 'text-purple-800' },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800' },
      'Hired': { bg: 'bg-emerald-100', text: 'text-emerald-800' }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueJobs = () => {
    const jobs = applications.reduce((acc, app) => {
      if (!acc.find(job => job._id === app.job._id)) {
        acc.push(app.job);
      }
      return acc;
    }, []);
    return jobs;
  };

  const StatusModal = () => {
    const [newStatus, setNewStatus] = useState(selectedApplication?.status || 'Pending');
    const [notes, setNotes] = useState('');

    const statusOptions = [
      'Pending',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Rejected',
      'Hired'
    ];

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-richblack-800 rounded-lg p-6 w-full max-w-md border border-richblack-700">
          <h3 className="text-lg font-semibold text-richblack-5 mb-4">
            Update Application Status
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-richblack-200 mb-2">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-richblack-200 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                placeholder="Add any notes about this status change..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowStatusModal(false);
                setSelectedApplication(null);
              }}
              className="px-4 py-2 text-richblack-300 hover:text-richblack-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleStatusUpdate(selectedApplication._id, newStatus, notes)}
              disabled={loading}
              className="px-4 py-2 bg-yellow-50 text-richblack-900 rounded-lg font-medium hover:bg-yellow-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-richblack-5">
            Job Applications
            {selectedJob && (
              <span className="text-richblack-300 font-normal ml-2">
                for {selectedJob.title}
              </span>
            )}
          </h2>
          <p className="text-richblack-400 text-sm">
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-richblack-200 mb-2">
            Search Applications
          </label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-richblack-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
              placeholder="Search by name, email, or job title..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-richblack-200 mb-2">
            Filter by Job
          </label>
          <select
            value={filters.job}
            onChange={(e) => setFilters(prev => ({ ...prev, job: e.target.value }))}
            className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
          >
            <option value="all">All Jobs</option>
            {getUniqueJobs().map(job => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-richblack-200 mb-2">
            Filter by Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview Scheduled">Interview Scheduled</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12">
          <FaFileAlt className="mx-auto text-4xl text-richblack-400 mb-4" />
          <h3 className="text-lg font-medium text-richblack-100 mb-2">No applications found</h3>
          <p className="text-richblack-400">
            {filters.search || filters.status !== 'all' || filters.job !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Applications will appear here once candidates start applying.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <motion.div
              key={application._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-richblack-700 rounded-lg p-6 border border-richblack-600"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-richblack-5">
                        {application.applicantName}
                      </h3>
                      <p className="text-richblack-300">{application.email}</p>
                      <p className="text-richblack-400 text-sm">{application.phone}</p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-richblack-400">Applied for:</span>
                      <p className="text-richblack-200 font-medium">{application.job.title}</p>
                    </div>
                    <div>
                      <span className="text-richblack-400">Applied on:</span>
                      <p className="text-richblack-200">{formatDate(application.createdAt)}</p>
                    </div>
                    {application.experience && (
                      <div>
                        <span className="text-richblack-400">Experience:</span>
                        <p className="text-richblack-200">{application.experience}</p>
                      </div>
                    )}
                    {application.expectedSalary && (
                      <div>
                        <span className="text-richblack-400">Expected Salary:</span>
                        <p className="text-richblack-200">${application.expectedSalary.toLocaleString()}</p>
                      </div>
                    )}
                  </div>

                  {application.coverLetter && (
                    <div className="mt-3">
                      <span className="text-richblack-400 text-sm">Cover Letter:</span>
                      <p className="text-richblack-200 text-sm mt-1 line-clamp-2">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  {application.notes && (
                    <div className="mt-3 p-3 bg-richblack-800 rounded-lg">
                      <span className="text-richblack-400 text-sm">Admin Notes:</span>
                      <p className="text-richblack-200 text-sm mt-1">{application.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const baseUrl = import.meta.env.VITE_REACT_APP_BASE_URL || 
                                     (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
                                       ? `${window.location.protocol}//${window.location.hostname}:5001` 
                                       : 'http://localhost:5001');
                      const downloadUrl = `${baseUrl}/api/v1/job-applications/download/${application._id}`;
                      
                      const token = localStorage.getItem('token');
                      if (token) {
                        // Get download info from backend
                        fetch(downloadUrl, {
                          method: 'GET',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                          },
                        })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error('Download failed');
                          }
                          return response.json();
                        })
                        .then(data => {
                          if (data.success) {
                            // Use the URL directly from Cloudinary
                            const link = document.createElement('a');
                            link.href = data.data.url;
                            link.download = data.data.filename;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            toast.success(`Downloaded: ${data.data.filename}`);
                          } else {
                            throw new Error(data.message || 'Download failed');
                          }
                        })
                        .catch(error => {
                          console.error('Download error:', error);
                          toast.error('Failed to download resume');
                        });
                      } else {
                        toast.error('Authentication required');
                      }
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title="Download Resume"
                  >
                    <FaDownload />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowStatusModal(true);
                    }}
                    className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    title="Update Status"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this application?')) {
                        const deleted = await deleteJobApplication(application._id, token);
                        if (deleted) {
                          onRefresh();
                        }
                      }
                    }}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Delete Application"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && <StatusModal />}
    </div>
  );
};

export default JobApplications;
