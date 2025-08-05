import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaBriefcase, FaCalendarAlt, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  toggleJobPublication,
  getAllApplications,
  getJobsAnalytics
} from '../../../services/operations/jobsAPI';
import JobForm from './CareersManagement/JobForm';
import JobApplications from './CareersManagement/JobApplications';
import CareersAnalytics from './CareersManagement/CareersAnalytics';

const CareersManagement = () => {
  const { token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedJobApplications, setSelectedJobApplications] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchAnalytics();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      console.log('Fetching jobs with token:', token ? 'Token present' : 'No token');
      const result = await getAllJobs(token);
      console.log('Jobs fetch result:', result);
      setJobs(result || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const result = await getAllApplications(token);
      setApplications(result || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const result = await getJobsAnalytics(token);
      setAnalytics(result);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleCreateJob = async (jobData) => {
    const result = await createJob(jobData, token);
    if (result) {
      await fetchJobs();
      await fetchAnalytics();
      setShowJobForm(false);
    }
  };

  const handleUpdateJob = async (jobData) => {
    const result = await updateJob(editingJob._id, jobData, token);
    if (result) {
      await fetchJobs();
      await fetchAnalytics();
      setShowJobForm(false);
      setEditingJob(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This will also delete all applications for this job.')) {
      const result = await deleteJob(jobId, token);
      if (result) {
        await fetchJobs();
        await fetchApplications();
        await fetchAnalytics();
      }
    }
  };

  const handleTogglePublication = async (jobId) => {
    const result = await toggleJobPublication(jobId, token);
    if (result) {
      await fetchJobs();
      await fetchAnalytics();
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleViewApplications = (job) => {
    setSelectedJobApplications(job);
    setActiveTab('applications');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isPublished, deadline) => {
    const isExpired = new Date() > new Date(deadline);
    
    if (isExpired) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Expired</span>;
    }
    
    if (isPublished) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Published (Visible on careers page)</span>;
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Draft (Not visible on careers page)</span>;
  };

  const tabs = [
    { id: 'jobs', label: 'Job Listings', icon: <FaBriefcase /> },
    { id: 'applications', label: 'Applications', icon: <FaUsers /> },
    { id: 'analytics', label: 'Analytics', icon: <FaCalendarAlt /> }
  ];

  if (showJobForm) {
    return (
      <JobForm
        job={editingJob}
        onSubmit={editingJob ? handleUpdateJob : handleCreateJob}
        onCancel={() => {
          setShowJobForm(false);
          setEditingJob(null);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-richblack-5">Careers Management</h1>
            <p className="text-sm sm:text-base text-richblack-300 mt-1">Manage job postings and applications</p>
          </div>
          
          {activeTab === 'jobs' && (
            <button
              onClick={() => setShowJobForm(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-yellow-50 text-richblack-900 px-4 py-3 sm:py-2 rounded-lg font-medium hover:bg-yellow-100 transition-colors min-h-[44px] touch-manipulation"
            >
              <FaPlus />
              <span className="text-sm sm:text-base">Add New Job</span>
            </button>
          )}
        </div>

        {/* Tabs - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 bg-richblack-800 p-2 sm:p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-2 rounded-md font-medium transition-colors text-sm sm:text-base min-h-[44px] touch-manipulation ${
                activeTab === tab.id
                  ? 'bg-richblack-700 text-yellow-50'
                  : 'text-richblack-300 hover:text-richblack-100'
              }`}
            >
              {tab.icon}
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-richblack-800 rounded-lg border border-richblack-700">
        {activeTab === 'jobs' && (
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
                <FaBriefcase className="mx-auto text-4xl text-richblack-400 mb-4" />
                <h3 className="text-lg font-medium text-richblack-100 mb-2">No jobs posted yet</h3>
                <p className="text-richblack-400 mb-4">Create your first job posting to get started</p>
                <button
                  onClick={() => setShowJobForm(true)}
                  className="bg-yellow-50 text-richblack-900 px-6 py-2 rounded-lg font-medium hover:bg-yellow-100 transition-colors"
                >
                  Create Job Posting
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-richblack-700 rounded-lg p-4 sm:p-6 border border-richblack-600"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        {/* Job Title and Status - Mobile Optimized */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
                          <h3 className="text-lg sm:text-xl font-semibold text-richblack-5 leading-tight break-words">
                            {job.title}
                          </h3>
                          <div className="flex-shrink-0">
                            {getStatusBadge(job.isPublished, job.applicationDeadline)}
                          </div>
                        </div>
                        
                        {/* Job Meta Information - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-richblack-300 mb-3">
                          <span className="flex items-center gap-1">📍 <span className="truncate">{job.location}</span></span>
                          <span className="flex items-center gap-1">🏢 <span className="truncate">{job.department}</span></span>
                          <span className="flex items-center gap-1">💼 <span className="truncate">{job.employmentType}</span></span>
                          <span className="flex items-center gap-1">📅 <span className="truncate">Deadline: {formatDate(job.applicationDeadline)}</span></span>
                        </div>
                        
                        {/* Job Description */}
                        <p className="text-richblack-200 text-sm sm:text-base line-clamp-2 mb-3 break-words">
                          {job.description}
                        </p>
                        
                        {/* Job Stats - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm mb-4">
                          <span className="text-richblack-400">
                            Applications: <span className="text-yellow-50 font-medium">{job.applicationCount || 0}</span>
                          </span>
                          <span className="text-richblack-400">
                            Created: {formatDate(job.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Mobile Responsive Grid */}
                      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 pt-3 border-t border-richblack-600">
                        <button
                          onClick={() => handleTogglePublication(job._id)}
                          className={`flex items-center justify-center gap-2 px-3 py-2 sm:p-2 rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[40px] touch-manipulation ${
                            job.isPublished
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-richblack-600 hover:bg-richblack-500 text-richblack-300'
                          }`}
                          title={job.isPublished ? 'Unpublish Job' : 'Publish Job'}
                        >
                          {job.isPublished ? <FaToggleOn /> : <FaToggleOff />}
                          <span className="sm:hidden">{job.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleViewApplications(job)}
                          className="flex items-center justify-center gap-2 px-3 py-2 sm:p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[40px] touch-manipulation"
                          title="View Applications"
                        >
                          <FaEye />
                          <span className="sm:hidden">View</span>
                        </button>
                        
                        <button
                          onClick={() => handleEditJob(job)}
                          className="flex items-center justify-center gap-2 px-3 py-2 sm:p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[40px] touch-manipulation"
                          title="Edit Job"
                        >
                          <FaEdit />
                          <span className="sm:hidden">Edit</span>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteJob(job._id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 sm:p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium min-h-[40px] touch-manipulation"
                          title="Delete Job"
                        >
                          <FaTrash />
                          <span className="sm:hidden">Delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <JobApplications
            selectedJob={selectedJobApplications}
            applications={applications}
            onRefresh={fetchApplications}
          />
        )}

        {activeTab === 'analytics' && (
          <CareersAnalytics analytics={analytics} />
        )}
      </div>
    </div>
  );
};

export default CareersManagement;
