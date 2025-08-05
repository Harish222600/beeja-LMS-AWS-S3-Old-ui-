import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaRocket, FaGraduationCap, FaHeart, FaMapMarkerAlt, FaClock, FaEnvelope, FaArrowRight, FaBriefcase } from "react-icons/fa";
import ImprovedFooter from "../components/common/ImprovedFooter";
import { getPublishedJobs, submitJobApplication } from "../services/operations/jobsAPI";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import styles from "./css style/CareersPage.module.css";

// Separate ApplicationForm component to prevent re-mounting
const ApplicationForm = React.memo(({ selectedJob, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    email: '',
    phone: '',
    resume: null,
    coverLetter: '',
    experience: '',
    portfolio: '',
    linkedinProfile: '',
    expectedSalary: '',
    availableStartDate: '',
    source: 'Website'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  }, []);

  const { token } = useSelector((state) => state.auth);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (submitting || !token) {
      toast.error('Please login to submit your application');
      return;
    }

    // Basic validation
    if (!formData.applicantName || !formData.email || !formData.phone || !formData.resume) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Resume file validation
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(formData.resume.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    if (formData.resume.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Resume file size must be less than 5MB');
      return;
    }

    setSubmitting(true);

    try {
      const applicationData = new FormData();
      
      // Append all form fields
      applicationData.append('jobId', selectedJob._id);
      applicationData.append('applicantName', formData.applicantName);
      applicationData.append('email', formData.email);
      applicationData.append('phone', formData.phone);
      applicationData.append('resume', formData.resume);
      
      // Append optional fields only if they have values
      if (formData.coverLetter) applicationData.append('coverLetter', formData.coverLetter);
      if (formData.experience) applicationData.append('experience', formData.experience);
      if (formData.portfolio) applicationData.append('portfolio', formData.portfolio);
      if (formData.linkedinProfile) applicationData.append('linkedinProfile', formData.linkedinProfile);
      if (formData.expectedSalary) applicationData.append('expectedSalary', formData.expectedSalary);
      if (formData.availableStartDate) applicationData.append('availableStartDate', formData.availableStartDate);
      applicationData.append('source', formData.source);

      console.log('Form data being sent:');
      for (let [key, value] of applicationData.entries()) {
        console.log(key, value);
      }

      const result = await submitJobApplication(applicationData, token);
      if (result) {
        toast.success('Application submitted successfully!');
        onSubmit();
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  }, [formData, selectedJob, submitting, onSubmit]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

        <div className="relative bg-richblack-800 rounded-lg w-full max-w-4xl mx-2 sm:mx-4 p-4 sm:p-6 border border-richblack-700 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header - Mobile Optimized */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-richblack-5 mb-1 sm:mb-2 leading-tight break-words">
              Apply for {selectedJob.title}
            </h2>
            <p className="text-sm sm:text-base text-richblack-300 break-words">
              {selectedJob.department} • {selectedJob.location}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Form Grid - Single column on mobile, two columns on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Resume (PDF/DOC) *
                </label>
                <input
                  type="file"
                  name="resume"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx"
                  required
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 min-h-[44px] touch-manipulation file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-yellow-50 file:text-richblack-900 hover:file:bg-yellow-100"
                />
              </div>

              {/* Cover Letter - Full width on all screens */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Cover Letter
                </label>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-base sm:text-sm resize-y min-h-[100px] touch-manipulation"
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Years of Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Expected Salary
                </label>
                <input
                  type="number"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  className="w-full px-3 py-3 sm:py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 text-base sm:text-sm min-h-[44px] touch-manipulation"
                />
              </div>
            </div>

            {/* Action Buttons - Stack on mobile, inline on larger screens */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-richblack-600 text-richblack-300 rounded-lg hover:bg-richblack-700 transition-colors disabled:opacity-50 font-medium text-base sm:text-sm min-h-[44px] touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-yellow-50 text-richblack-900 rounded-lg font-medium hover:bg-yellow-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base sm:text-sm min-h-[44px] touch-manipulation"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-richblack-900 border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
});

const FinalDynamicCareers = () => {
  const { token } = useSelector((state) => state.auth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const benefits = useMemo(() => [
    {
      icon: <FaRocket className="text-2xl text-yellow-50" />,
      title: "Mission-Driven Work",
      description: "Be part of transforming education and empowering learners worldwide"
    },
    {
      icon: <FaUsers className="text-2xl text-blue-400" />,
      title: "Diverse Team",
      description: "Collaborate with talented professionals from diverse backgrounds"
    },
    {
      icon: <FaGraduationCap className="text-2xl text-green-400" />,
      title: "Continuous Learning",
      description: "Professional development opportunities and skill enhancement"
    },
    {
      icon: <FaHeart className="text-2xl text-pink-400" />,
      title: "Work-Life Balance",
      description: "Flexible work arrangements and remote-friendly culture"
    }
  ], []);

  const fetchJobs = useCallback(async () => {
    try {
      console.log('Fetching published jobs...');
      console.log('API Base URL:', import.meta.env.VITE_APP_BASE_URL);
      console.log('Making request to:', `${import.meta.env.VITE_APP_BASE_URL}/api/v1/jobs/published`);
      
      const result = await getPublishedJobs();
      console.log('Jobs fetch result:', result);
      console.log('Number of jobs returned:', result ? result.length : 0);
      
      if (result && result.length > 0) {
        console.log('First job details:', result[0]);
        result.forEach((job, index) => {
          console.log(`Job ${index + 1}:`, {
            id: job._id,
            title: job.title,
            isPublished: job.isPublished,
            deadline: job.applicationDeadline,
            isExpired: new Date() > new Date(job.applicationDeadline)
          });
        });
      } else {
        console.log('No jobs returned from API');
      }
      
      setJobs(result || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApplyClick = useCallback((job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowApplicationForm(false);
    setSelectedJob(null);
  }, []);

  const handleApplicationSubmit = useCallback(() => {
    handleCloseModal();
    fetchJobs(); // Refresh jobs if needed
  }, [handleCloseModal, fetchJobs]);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-richblack-900">
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-br from-blue-900 via-richblack-900 to-purple-900 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative w-11/12 max-w-maxContent mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-white mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join Our <span className="text-yellow-50">Mission</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-richblack-200 max-w-3xl mx-auto mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transform education and empower learners worldwide. Join our passionate team of innovators, educators, and technologists.
          </motion.p>
        </div>
      </motion.div>

      <div className="w-11/12 max-w-maxContent mx-auto py-16 text-richblack-5">
        {/* Why Work With Us Section */}
        <motion.section 
          className="mb-20"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.5
                }
              }
            }}
          >
            Why Choose <span className="text-yellow-50">Beeja?</span>
          </motion.h2>
          <motion.p 
            className="text-richblack-300 text-center mb-12 max-w-2xl mx-auto"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.5
                }
              }
            }}
          >
            We're not just building a company; we're creating the future of education. Here's what makes Beeja special.
          </motion.p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-richblack-800 p-6 rounded-xl text-center hover:bg-richblack-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: {
                    y: 0,
                    opacity: 1,
                    transition: {
                      duration: 0.5
                    }
                  }
                }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-richblack-50">{benefit.title}</h3>
                <p className="text-richblack-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Open Positions Section */}
        <motion.section 
          className="mb-20"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2 
            className="text-4xl font-bold text-center mb-4"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.5
                }
              }
            }}
          >
            Open <span className="text-yellow-50">Positions</span>
          </motion.h2>
          <motion.p 
            className="text-richblack-300 text-center mb-12 max-w-2xl mx-auto"
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: {
                y: 0,
                opacity: 1,
                transition: {
                  duration: 0.5
                }
              }
            }}
          >
            Ready to make an impact? Explore our current openings and find your perfect role.
          </motion.p>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-yellow-50 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <FaBriefcase className="mx-auto text-4xl text-richblack-400 mb-4" />
              <h3 className="text-lg font-medium text-richblack-100 mb-2">No open positions at the moment</h3>
              <p className="text-richblack-400">
                Please check back later for new opportunities.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col gap-4 md:gap-6 relative z-50">
              {console.log('Rendering jobs:', jobs)}
              {jobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-richblack-800 p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-richblack-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-richblack-500 w-full overflow-hidden"
                  style={{ zIndex: 100 + index }}
                >
                  {/* Job Header - Mobile First Layout */}
                  <div className="flex flex-col gap-4 md:gap-6">
                    <div className="flex-1 space-y-3 md:space-y-4">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-richblack-5 leading-tight break-words">
                        {job.title || 'Job Title'}
                      </h3>
                      
                      {/* Job Meta - Stack on mobile, wrap on larger screens */}
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm">
                        <span className="inline-flex items-center gap-2 bg-richblack-700 px-3 py-1.5 rounded-full text-richblack-200 w-fit">
                          <FaUsers className="text-blue-400 text-xs" /> 
                          <span className="truncate">{job.department || 'Department'}</span>
                        </span>
                        <span className="inline-flex items-center gap-2 bg-richblack-700 px-3 py-1.5 rounded-full text-richblack-200 w-fit">
                          <FaClock className="text-green-400 text-xs" /> 
                          <span className="truncate">{job.employmentType || 'Full-time'}</span>
                        </span>
                        <span className="inline-flex items-center gap-2 bg-richblack-700 px-3 py-1.5 rounded-full text-richblack-200 w-fit">
                          <FaMapMarkerAlt className="text-red-400 text-xs" /> 
                          <span className="truncate">{job.location || 'Location'}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Apply Button - Full width on mobile */}
                    <button
                      onClick={() => handleApplyClick(job)}
                      className="w-full sm:w-auto sm:min-w-[140px] bg-yellow-50 text-richblack-900 px-4 py-3 sm:px-6 sm:py-3 rounded-lg font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-all duration-300 hover:bg-yellow-100 hover:shadow-md active:scale-95 touch-manipulation min-h-[44px]"
                    >
                      Apply Now <FaArrowRight className="text-xs sm:text-sm" />
                    </button>
                  </div>
                  
                  {/* Job Description */}
                  <p className="text-richblack-200 mt-4 mb-4 sm:mt-6 sm:mb-6 leading-relaxed text-sm sm:text-base break-words">
                    {job.description || 'Job description will be displayed here.'}
                  </p>
                  
                  {/* Job Details */}
                  <div className="space-y-4 sm:space-y-6">
                    {job.requirements && job.requirements.length > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-richblack-5 mb-2 sm:mb-3">
                          Key Requirements:
                        </h4>
                        <ul className="list-disc pl-4 sm:pl-5 text-richblack-300 leading-relaxed space-y-1 sm:space-y-2">
                          {job.requirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="text-sm sm:text-base break-words">
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {job.benefits && job.benefits.length > 0 && (
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-richblack-5 mb-2 sm:mb-3">
                          Benefits:
                        </h4>
                        <ul className="list-disc pl-4 sm:pl-5 text-richblack-300 leading-relaxed space-y-1 sm:space-y-2">
                          {job.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="text-sm sm:text-base break-words">
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Application Deadline */}
                    <div className="pt-3 sm:pt-4 border-t border-richblack-600 mt-4 sm:mt-6">
                      <p className="text-xs sm:text-sm text-richblack-400">
                        <span className="text-yellow-50 font-semibold">Application Deadline:</span> {formatDate(job.applicationDeadline)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
      
      <ImprovedFooter />

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <ApplicationForm 
          selectedJob={selectedJob} 
          onClose={handleCloseModal} 
          onSubmit={handleApplicationSubmit} 
        />
      )}
    </div>
  );
};

export default FinalDynamicCareers;
