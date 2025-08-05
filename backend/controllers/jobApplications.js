const JobApplication = require('../models/jobApplication');
const Job = require('../models/job');
const { uploadResumeToS3 } = require('../utils/s3Uploader');
const { generateSignedUrl } = require('../utils/s3Uploader');
const mongoose = require('mongoose');
const axios = require('axios');

// ================ SUBMIT JOB APPLICATION ================
exports.submitApplication = async (req, res) => {
    try {
        const {
            jobId,
            applicantName,
            email,
            phone,
            coverLetter,
            experience,
            portfolio,
            linkedinProfile,
            expectedSalary,
            availableStartDate,
            source
        } = req.body;

        console.log('Submit application request:', {
            jobId,
            applicantName,
            email,
            phone,
            hasResume: !!req.files?.resume
        });

        // Validate required fields
        if (!jobId || !applicantName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Job ID, name, email, and phone are required'
            });
        }

        // Validate job ID
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid job ID'
            });
        }

        // Check if job exists and is published
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (!job.isPublished) {
            return res.status(400).json({
                success: false,
                message: 'This job is not currently accepting applications'
            });
        }

        // Check if application deadline has passed
        if (new Date() > job.applicationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Application deadline has passed'
            });
        }

        // Check if user has already applied for this job
        const existingApplication = await JobApplication.findOne({
            job: jobId,
            email: email.toLowerCase()
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }

        // Validate and upload resume
        const resumeFile = req.files?.resume?.[0];
        if (!resumeFile) {
            return res.status(400).json({
                success: false,
                message: 'Resume file is required'
            });
        }

        // Check file type (PDF, DOC, DOCX)
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(resumeFile.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Resume must be a PDF, DOC, or DOCX file'
            });
        }

        // Check file size (max 5MB)
        if (resumeFile.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: 'Resume file size must be less than 5MB'
            });
        }

        console.log('Uploading resume to S3...');
        
        // Upload resume to S3
        const resumeUpload = await uploadResumeToS3(resumeFile, 'documents', null, null);
        console.log('✅ Resume uploaded to S3:', resumeUpload.secure_url);

        console.log('Resume uploaded successfully:', resumeUpload.secure_url);

        // Create application
        const applicationData = {
            job: jobId,
            applicantName: applicantName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            resume: {
                url: resumeUpload.secure_url,
                publicId: resumeUpload.public_id,
                originalName: resumeFile.originalname
            },
            coverLetter: coverLetter?.trim(),
            experience: experience?.trim(),
            portfolio: portfolio?.trim(),
            linkedinProfile: linkedinProfile?.trim(),
            expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
            availableStartDate: availableStartDate ? new Date(availableStartDate) : undefined,
            source: source || 'Website'
        };

        const newApplication = await JobApplication.create(applicationData);

        // Update job application count
        await Job.findByIdAndUpdate(jobId, {
            $inc: { applicationCount: 1 }
        });

        console.log('Application submitted successfully:', newApplication._id);

        // Populate job details for response
        const populatedApplication = await JobApplication.findById(newApplication._id)
            .populate('job', 'title department location');

        return res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application: populatedApplication
        });

    } catch (error) {
        console.error('Error submitting application:', error);
        
        // Handle duplicate key error (email + job combination)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error submitting application',
            error: error.message
        });
    }
};

// ================ GET APPLICATION BY ID ================
exports.getApplicationById = async (req, res) => {
    try {
        const { applicationId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID'
            });
        }

        const application = await JobApplication.findById(applicationId)
            .populate('job', 'title department location employmentType experienceLevel')
            .populate('reviewedBy', 'firstName lastName email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        return res.status(200).json({
            success: true,
            application,
            message: 'Application fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching application:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching application',
            error: error.message
        });
    }
};

// ================ DELETE APPLICATION ================
exports.deleteApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

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

        // Delete the application
        await JobApplication.findByIdAndDelete(applicationId);

        // Update job application count
        await Job.findByIdAndUpdate(application.job, {
            $inc: { applicationCount: -1 }
        });

        return res.status(200).json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting application:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting application',
            error: error.message
        });
    }
};

// ================ GET APPLICATIONS BY EMAIL ================
exports.getApplicationsByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const applications = await JobApplication.find({
            email: email.toLowerCase()
        })
        .populate('job', 'title department location employmentType')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            applications,
            message: 'Applications fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching applications by email:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
};

// ================ BULK UPDATE APPLICATION STATUS ================
exports.bulkUpdateApplicationStatus = async (req, res) => {
    try {
        const { applicationIds, status, notes } = req.body;

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Application IDs array is required'
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        // Validate all application IDs
        const invalidIds = applicationIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid application IDs: ${invalidIds.join(', ')}`
            });
        }

        const updateData = {
            status,
            reviewedBy: req.user.id,
            reviewedAt: new Date()
        };

        if (notes) {
            updateData.notes = notes;
        }

        const result = await JobApplication.updateMany(
            { _id: { $in: applicationIds } },
            updateData
        );

        return res.status(200).json({
            success: true,
            message: `${result.modifiedCount} applications updated successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk updating applications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating applications',
            error: error.message
        });
    }
};

// ================ GET APPLICATION STATISTICS ================
exports.getApplicationStatistics = async (req, res) => {
    try {
        const { jobId } = req.params;

        let matchCondition = {};
        if (jobId) {
            if (!mongoose.Types.ObjectId.isValid(jobId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid job ID'
                });
            }
            matchCondition.job = new mongoose.Types.ObjectId(jobId);
        }

        // Get status distribution
        const statusStats = await JobApplication.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get applications over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const applicationsOverTime = await JobApplication.aggregate([
            {
                $match: {
                    ...matchCondition,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get source distribution
        const sourceStats = await JobApplication.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            statistics: {
                statusDistribution: statusStats,
                applicationsOverTime,
                sourceDistribution: sourceStats
            },
            message: 'Application statistics fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching application statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching application statistics',
            error: error.message
        });
    }
};

// ================ DOWNLOAD RESUME ================
exports.downloadResume = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Validate application ID
        if (!mongoose.Types.ObjectId.isValid(applicationId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid application ID'
            });
        }

        // Find application
        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        if (!application.resume || !application.resume.url) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Return the resume URL and metadata for frontend to handle download
        const originalName = application.resume.originalName || 'resume.pdf';
        const fileExtension = originalName.split('.').pop();
        const fileName = `${application.applicantName.replace(/\s+/g, '_')}_resume.${fileExtension}`;

        return res.status(200).json({
            success: true,
            data: {
                url: application.resume.url,
                filename: fileName,
                originalName: application.resume.originalName,
                applicantName: application.applicantName
            }
        });
    } catch (error) {
        console.error('Error in downloadResume:', error);
        return res.status(500).json({
            success: false,
            message: 'Error processing download request'
        });
    }
};
