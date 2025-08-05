const Job = require('../models/job');
const JobApplication = require('../models/jobApplication');
const mongoose = require('mongoose');

// ================ CREATE JOB ================
exports.createJob = async (req, res) => {
    try {
        const {
            title,
            location,
            department,
            description,
            responsibilities,
            requirements,
            applicationDeadline,
            employmentType,
            experienceLevel,
            salaryRange,
            benefits,
            isPublished
        } = req.body;

        console.log('Create job request:', {
            title,
            location,
            department,
            employmentType,
            experienceLevel,
            isPublished
        });

        // Validate required fields
        if (!title || !location || !department || !description || !responsibilities || !requirements || !applicationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided',
                missingFields: {
                    title: !title,
                    location: !location,
                    department: !department,
                    description: !description,
                    responsibilities: !responsibilities,
                    requirements: !requirements,
                    applicationDeadline: !applicationDeadline
                }
            });
        }

        // Parse arrays if they come as strings
        let parsedResponsibilities = responsibilities;
        let parsedRequirements = requirements;
        let parsedBenefits = benefits || [];

        if (typeof responsibilities === 'string') {
            try {
                parsedResponsibilities = JSON.parse(responsibilities);
            } catch (e) {
                parsedResponsibilities = responsibilities.split('\n').filter(item => item.trim());
            }
        }

        if (typeof requirements === 'string') {
            try {
                parsedRequirements = JSON.parse(requirements);
            } catch (e) {
                parsedRequirements = requirements.split('\n').filter(item => item.trim());
            }
        }

        if (typeof benefits === 'string') {
            try {
                parsedBenefits = JSON.parse(benefits);
            } catch (e) {
                parsedBenefits = benefits.split('\n').filter(item => item.trim());
            }
        }

        // Parse salary range
        let parsedSalaryRange = null;
        if (salaryRange && typeof salaryRange === 'object') {
            parsedSalaryRange = salaryRange;
        } else if (salaryRange && typeof salaryRange === 'string') {
            try {
                parsedSalaryRange = JSON.parse(salaryRange);
            } catch (e) {
                parsedSalaryRange = null;
            }
        }

        // Create job
        const newJob = await Job.create({
            title,
            location,
            department,
            description,
            responsibilities: parsedResponsibilities,
            requirements: parsedRequirements,
            applicationDeadline: new Date(applicationDeadline),
            employmentType: employmentType || 'Full-time',
            experienceLevel: experienceLevel || 'Mid Level',
            salaryRange: parsedSalaryRange,
            benefits: parsedBenefits,
            isPublished: isPublished || false,
            createdBy: req.user.id
        });

        console.log('Job created successfully:', newJob._id);

        // Populate creator details
        const populatedJob = await Job.findById(newJob._id)
            .populate('createdBy', 'firstName lastName email');

        return res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: populatedJob
        });

    } catch (error) {
        console.error('Error creating job:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating job',
            error: error.message
        });
    }
};

// ================ GET ALL JOBS (ADMIN) ================
exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({})
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            jobs,
            message: 'Jobs fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching jobs',
            error: error.message
        });
    }
};

// ================ GET PUBLISHED JOBS (PUBLIC) ================
exports.getPublishedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            isPublished: true,
            applicationDeadline: { $gte: new Date() }
        })
        .select('title location department description responsibilities requirements applicationDeadline employmentType experienceLevel salaryRange benefits createdAt')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            jobs,
            message: 'Published jobs fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching published jobs:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching published jobs',
            error: error.message
        });
    }
};

// ================ GET JOB BY ID ================
exports.getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const job = await Job.findById(jobId)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        return res.status(200).json({
            success: true,
            job,
            message: 'Job fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching job:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching job',
            error: error.message
        });
    }
};

// ================ UPDATE JOB ================
exports.updateJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Parse arrays if they come as strings
        if (updateData.responsibilities && typeof updateData.responsibilities === 'string') {
            try {
                updateData.responsibilities = JSON.parse(updateData.responsibilities);
            } catch (e) {
                updateData.responsibilities = updateData.responsibilities.split('\n').filter(item => item.trim());
            }
        }

        if (updateData.requirements && typeof updateData.requirements === 'string') {
            try {
                updateData.requirements = JSON.parse(updateData.requirements);
            } catch (e) {
                updateData.requirements = updateData.requirements.split('\n').filter(item => item.trim());
            }
        }

        if (updateData.benefits && typeof updateData.benefits === 'string') {
            try {
                updateData.benefits = JSON.parse(updateData.benefits);
            } catch (e) {
                updateData.benefits = updateData.benefits.split('\n').filter(item => item.trim());
            }
        }

        // Parse salary range
        if (updateData.salaryRange && typeof updateData.salaryRange === 'string') {
            try {
                updateData.salaryRange = JSON.parse(updateData.salaryRange);
            } catch (e) {
                updateData.salaryRange = null;
            }
        }

        // Add updatedBy field
        updateData.updatedBy = req.user.id;

        const updatedJob = await Job.findByIdAndUpdate(
            jobId,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email');

        return res.status(200).json({
            success: true,
            job: updatedJob,
            message: 'Job updated successfully'
        });
    } catch (error) {
        console.error('Error updating job:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating job',
            error: error.message
        });
    }
};

// ================ DELETE JOB ================
exports.deleteJob = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Delete all applications for this job
        await JobApplication.deleteMany({ job: jobId });

        // Delete the job
        await Job.findByIdAndDelete(jobId);

        return res.status(200).json({
            success: true,
            message: 'Job and all related applications deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting job:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting job',
            error: error.message
        });
    }
};

// ================ TOGGLE JOB PUBLICATION STATUS ================
exports.toggleJobPublication = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        job.isPublished = !job.isPublished;
        job.updatedBy = req.user.id;
        await job.save();

        const updatedJob = await Job.findById(jobId)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email');

        return res.status(200).json({
            success: true,
            job: updatedJob,
            message: `Job ${job.isPublished ? 'published' : 'unpublished'} successfully`
        });
    } catch (error) {
        console.error('Error toggling job publication:', error);
        return res.status(500).json({
            success: false,
            message: 'Error toggling job publication',
            error: error.message
        });
    }
};

// ================ GET JOB APPLICATIONS ================
exports.getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        const applications = await JobApplication.find({ job: jobId })
            .populate('job', 'title department location')
            .populate('reviewedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            applications,
            message: 'Job applications fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching job applications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching job applications',
            error: error.message
        });
    }
};

// ================ GET ALL APPLICATIONS (ADMIN) ================
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await JobApplication.find({})
            .populate('job', 'title department location')
            .populate('reviewedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            applications,
            message: 'All applications fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching all applications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
};

// ================ UPDATE APPLICATION STATUS ================
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, notes, interviewDate } = req.body;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID'
            });
        }

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        const updateData = {
            reviewedBy: req.user.id,
            reviewedAt: new Date()
        };

        if (status) updateData.status = status;
        if (notes) updateData.notes = notes;
        if (interviewDate) updateData.interviewDate = new Date(interviewDate);

        const updatedApplication = await JobApplication.findByIdAndUpdate(
            applicationId,
            updateData,
            { new: true, runValidators: true }
        )
        .populate('job', 'title department location')
        .populate('reviewedBy', 'firstName lastName email');

        return res.status(200).json({
            success: true,
            application: updatedApplication,
            message: 'Application status updated successfully'
        });
    } catch (error) {
        console.error('Error updating application status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating application status',
            error: error.message
        });
    }
};

// ================ GET JOBS ANALYTICS ================
exports.getJobsAnalytics = async (req, res) => {
    try {
        const totalJobs = await Job.countDocuments();
        const publishedJobs = await Job.countDocuments({ isPublished: true });
        const draftJobs = await Job.countDocuments({ isPublished: false });
        
        const totalApplications = await JobApplication.countDocuments();
        const pendingApplications = await JobApplication.countDocuments({ status: 'Pending' });
        const shortlistedApplications = await JobApplication.countDocuments({ status: 'Shortlisted' });
        const hiredApplications = await JobApplication.countDocuments({ status: 'Hired' });

        // Get applications by department
        const applicationsByDepartment = await JobApplication.aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobDetails'
                }
            },
            { $unwind: '$jobDetails' },
            {
                $group: {
                    _id: '$jobDetails.department',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get recent applications (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentApplications = await JobApplication.find({
            createdAt: { $gte: thirtyDaysAgo }
        })
        .populate('job', 'title department')
        .select('applicantName email status createdAt')
        .sort({ createdAt: -1 })
        .limit(10);

        return res.status(200).json({
            success: true,
            analytics: {
                jobs: {
                    total: totalJobs,
                    published: publishedJobs,
                    draft: draftJobs
                },
                applications: {
                    total: totalApplications,
                    pending: pendingApplications,
                    shortlisted: shortlistedApplications,
                    hired: hiredApplications
                },
                applicationsByDepartment,
                recentApplications
            },
            message: 'Jobs analytics fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching jobs analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching jobs analytics',
            error: error.message
        });
    }
};
