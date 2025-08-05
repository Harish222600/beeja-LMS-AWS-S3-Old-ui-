import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaSave, FaTimes, FaPlus } from 'react-icons/fa';

const JobForm = ({ job, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    department: '',
    description: '',
    responsibilities: [''],
    requirements: [''],
    applicationDeadline: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid Level',
    salaryRange: {
      min: '',
      max: '',
      currency: 'USD'
    },
    benefits: [''],
    isPublished: false
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        location: job.location || '',
        department: job.department || '',
        description: job.description || '',
        responsibilities: job.responsibilities?.length > 0 ? job.responsibilities : [''],
        requirements: job.requirements?.length > 0 ? job.requirements : [''],
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
        employmentType: job.employmentType || 'Full-time',
        experienceLevel: job.experienceLevel || 'Mid Level',
        salaryRange: {
          min: job.salaryRange?.min || '',
          max: job.salaryRange?.max || '',
          currency: job.salaryRange?.currency || 'USD'
        },
        benefits: job.benefits?.length > 0 ? job.benefits : [''],
        isPublished: job.isPublished || false
      });
    }
  }, [job]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (arrayName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    if (formData[arrayName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Job title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.applicationDeadline) newErrors.applicationDeadline = 'Application deadline is required';
    
    // Check if deadline is in the future
    if (formData.applicationDeadline && new Date(formData.applicationDeadline) <= new Date()) {
      newErrors.applicationDeadline = 'Application deadline must be in the future';
    }

    // Validate responsibilities
    const validResponsibilities = formData.responsibilities.filter(r => r.trim());
    if (validResponsibilities.length === 0) {
      newErrors.responsibilities = 'At least one responsibility is required';
    }

    // Validate requirements
    const validRequirements = formData.requirements.filter(r => r.trim());
    if (validRequirements.length === 0) {
      newErrors.requirements = 'At least one requirement is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up data before submission
    const submitData = {
      ...formData,
      responsibilities: formData.responsibilities.filter(r => r.trim()),
      requirements: formData.requirements.filter(r => r.trim()),
      benefits: formData.benefits.filter(b => b.trim()),
      salaryRange: formData.salaryRange.min || formData.salaryRange.max ? formData.salaryRange : null
    };

    onSubmit(submitData);
  };

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-richblack-400 hover:text-richblack-100 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-richblack-5">
              {job ? 'Edit Job Posting' : 'Create New Job Posting'}
            </h2>
            <p className="text-richblack-300">Fill in the details for the job posting</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-richblack-800 rounded-lg p-6 border border-richblack-700">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-richblack-5 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-richblack-700 border rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 ${
                    errors.title ? 'border-red-500' : 'border-richblack-600'
                  }`}
                  placeholder="e.g., Senior Software Engineer"
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-richblack-700 border rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 ${
                    errors.location ? 'border-red-500' : 'border-richblack-600'
                  }`}
                  placeholder="e.g., Remote, New York, NY"
                />
                {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-richblack-700 border rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 ${
                    errors.department ? 'border-red-500' : 'border-richblack-600'
                  }`}
                  placeholder="e.g., Engineering, Marketing"
                />
                {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Application Deadline *
                </label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 bg-richblack-700 border rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 ${
                    errors.applicationDeadline ? 'border-red-500' : 'border-richblack-600'
                  }`}
                />
                {errors.applicationDeadline && <p className="text-red-400 text-sm mt-1">{errors.applicationDeadline}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Employment Type
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                >
                  {employmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-richblack-200 mb-2">
                  Experience Level
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-richblack-200 mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 bg-richblack-700 border rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50 ${
                  errors.description ? 'border-red-500' : 'border-richblack-600'
                }`}
                placeholder="Describe the role, company culture, and what makes this position exciting..."
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-richblack-200 mb-2">
                Salary Range (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="salaryRange.min"
                  value={formData.salaryRange.min}
                  onChange={handleInputChange}
                  className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                  placeholder="Min salary"
                />
                <input
                  type="number"
                  name="salaryRange.max"
                  value={formData.salaryRange.max}
                  onChange={handleInputChange}
                  className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                  placeholder="Max salary"
                />
                <select
                  name="salaryRange.currency"
                  value={formData.salaryRange.currency}
                  onChange={handleInputChange}
                  className="px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Responsibilities */}
        <div className="bg-richblack-800 rounded-lg p-6 border border-richblack-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-richblack-5">Responsibilities *</h3>
            <button
              type="button"
              onClick={() => addArrayItem('responsibilities')}
              className="flex items-center gap-2 text-yellow-50 hover:text-yellow-100 transition-colors"
            >
              <FaPlus className="text-sm" />
              Add Responsibility
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.responsibilities.map((responsibility, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={responsibility}
                  onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                  placeholder="Enter a key responsibility..."
                />
                {formData.responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('responsibilities', index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.responsibilities && <p className="text-red-400 text-sm mt-2">{errors.responsibilities}</p>}
        </div>

        {/* Requirements */}
        <div className="bg-richblack-800 rounded-lg p-6 border border-richblack-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-richblack-5">Requirements *</h3>
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="flex items-center gap-2 text-yellow-50 hover:text-yellow-100 transition-colors"
            >
              <FaPlus className="text-sm" />
              Add Requirement
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                  placeholder="Enter a requirement..."
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.requirements && <p className="text-red-400 text-sm mt-2">{errors.requirements}</p>}
        </div>

        {/* Benefits */}
        <div className="bg-richblack-800 rounded-lg p-6 border border-richblack-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-richblack-5">Benefits (Optional)</h3>
            <button
              type="button"
              onClick={() => addArrayItem('benefits')}
              className="flex items-center gap-2 text-yellow-50 hover:text-yellow-100 transition-colors"
            >
              <FaPlus className="text-sm" />
              Add Benefit
            </button>
          </div>
          
          <div className="space-y-3">
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                  className="flex-1 px-3 py-2 bg-richblack-700 border border-richblack-600 rounded-lg text-richblack-5 focus:outline-none focus:ring-2 focus:ring-yellow-50"
                  placeholder="Enter a benefit..."
                />
                {formData.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('benefits', index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Publication Status */}
        <div className="bg-richblack-800 rounded-lg p-6 border border-richblack-700">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleInputChange}
              className="w-4 h-4 text-yellow-50 bg-richblack-700 border-richblack-600 rounded focus:ring-yellow-50 focus:ring-2"
            />
            <label htmlFor="isPublished" className="text-richblack-200">
              Publish this job immediately
            </label>
          </div>
          <p className="text-sm text-richblack-400 mt-2">
            If unchecked, the job will be saved as a draft and can be published later.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-richblack-600 text-richblack-300 rounded-lg hover:bg-richblack-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-50 text-richblack-900 rounded-lg font-medium hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-richblack-900 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaSave />
            )}
            {job ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default JobForm;
