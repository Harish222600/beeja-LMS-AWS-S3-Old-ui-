import React from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase, FaUsers, FaCheckCircle, FaUserTie, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

const CareersAnalytics = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-600',
      purple: 'bg-purple-600',
      red: 'bg-red-600'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-richblack-700 rounded-lg p-6 border border-richblack-600"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-richblack-400 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-richblack-5 mt-1">{value}</p>
            {subtitle && (
              <p className="text-richblack-300 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-richblack-5 mb-2">Careers Analytics</h2>
        <p className="text-richblack-400">Overview of job postings and applications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FaBriefcase className="text-white text-xl" />}
          title="Total Jobs"
          value={analytics.jobs?.total || 0}
          subtitle={`${analytics.jobs?.published || 0} published`}
          color="blue"
        />
        
        <StatCard
          icon={<FaUsers className="text-white text-xl" />}
          title="Total Applications"
          value={analytics.applications?.total || 0}
          subtitle={`${analytics.applications?.pending || 0} pending review`}
          color="green"
        />
        
        <StatCard
          icon={<FaCheckCircle className="text-white text-xl" />}
          title="Shortlisted"
          value={analytics.applications?.shortlisted || 0}
          subtitle="Candidates in pipeline"
          color="yellow"
        />
        
        <StatCard
          icon={<FaUserTie className="text-white text-xl" />}
          title="Hired"
          value={analytics.applications?.hired || 0}
          subtitle="Successful placements"
          color="purple"
        />
      </div>

      {/* Job Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-richblack-700 rounded-lg p-6 border border-richblack-600"
        >
          <h3 className="text-lg font-semibold text-richblack-5 mb-4">Job Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-richblack-300">Published Jobs</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-richblack-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ 
                      width: `${analytics.jobs?.total > 0 ? (analytics.jobs.published / analytics.jobs.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-richblack-5 font-medium">{analytics.jobs?.published || 0}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-richblack-300">Draft Jobs</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-richblack-600 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ 
                      width: `${analytics.jobs?.total > 0 ? (analytics.jobs.draft / analytics.jobs.total) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <span className="text-richblack-5 font-medium">{analytics.jobs?.draft || 0}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-richblack-700 rounded-lg p-6 border border-richblack-600"
        >
          <h3 className="text-lg font-semibold text-richblack-5 mb-4">Application Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-richblack-300">Pending</span>
              <span className="text-richblack-5 font-medium">{analytics.applications?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-richblack-300">Shortlisted</span>
              <span className="text-richblack-5 font-medium">{analytics.applications?.shortlisted || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-richblack-300">Hired</span>
              <span className="text-richblack-5 font-medium">{analytics.applications?.hired || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Applications by Department */}
      {analytics.applicationsByDepartment && analytics.applicationsByDepartment.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-richblack-700 rounded-lg p-6 border border-richblack-600"
        >
          <h3 className="text-lg font-semibold text-richblack-5 mb-4">Applications by Department</h3>
          <div className="space-y-3">
            {analytics.applicationsByDepartment.map((dept, index) => {
              const maxCount = Math.max(...analytics.applicationsByDepartment.map(d => d.count));
              const percentage = (dept.count / maxCount) * 100;
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-richblack-300 flex-1">{dept._id}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-full bg-richblack-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-richblack-5 font-medium w-8 text-right">{dept.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Applications */}
      {analytics.recentApplications && analytics.recentApplications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-richblack-700 rounded-lg p-6 border border-richblack-600"
        >
          <h3 className="text-lg font-semibold text-richblack-5 mb-4">Recent Applications</h3>
          <div className="space-y-3">
            {analytics.recentApplications.slice(0, 5).map((application, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-richblack-600 last:border-b-0">
                <div className="flex-1">
                  <p className="text-richblack-5 font-medium">{application.applicantName}</p>
                  <p className="text-richblack-400 text-sm">{application.job?.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-richblack-300 text-sm">{formatDate(application.createdAt)}</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    application.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                    application.status === 'Hired' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {(!analytics.jobs?.total && !analytics.applications?.total) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-richblack-700 rounded-lg p-12 border border-richblack-600 text-center"
        >
          <FaChartLine className="mx-auto text-4xl text-richblack-400 mb-4" />
          <h3 className="text-lg font-medium text-richblack-100 mb-2">No Data Available</h3>
          <p className="text-richblack-400">
            Analytics will appear here once you start posting jobs and receiving applications.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default CareersAnalytics;
