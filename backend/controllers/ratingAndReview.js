const User = require('../models/user')
const Course = require('../models/course')
const RatingAndReview = require('../models/ratingAndReview')
const mongoose = require('mongoose');

// ================ Create Rating ================
exports.createRating = async (req, res) => {
    try {
        // get data
        const { rating, review, courseId } = req.body;

        const userId = req.user.id;

        // validation
        if (!rating || !review || !courseId) {
            return res.status(401).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate rating is between 1-5
        if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // check user is enrollded in course ?
        const courseDetails = await Course.findOne({ 
            _id: courseId,
            studentsEnrolled: { $in: [userId] }
        });

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: 'Student is not enrolled in the course'
            });
        }


        // check user already reviewd ?
        const alreadyReviewd = await RatingAndReview.findOne(
            { course:courseId, user:userId }
        );

        if (alreadyReviewd) {
            return res.status(403).json({
                success: false,
                message: 'Course is already reviewed by the user'
            });
        }

        // create entry in DB
        const ratingReview = await RatingAndReview.create({
            user:userId, course:courseId, rating, review
        });


        // link this rating to course 
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratingReview._id
                }
            },
            { new: true })


        // console.log(updatedCourseDetails);
        //return response
        return res.status(200).json({
            success: true,
            data:ratingReview,
            message: "Rating and Review created Successfully",
        })
    }
    catch (error) {
        console.log('Error while creating rating and review');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while creating rating and review',
        })
    }
}




// ================ Get Average Rating ================
exports.getAverageRating = async (req, res) => {
    try {
            //get course ID
            const courseId = req.body.courseId;
            //calculate avg rating

            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { 
                            $round: [{ $avg: "$rating" }, 1]
                        }
                    }
                }
            ])

            //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }
            
            //if no rating/Review exist
            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}





// ================ Get All Rating And Reviews ================
exports.getAllRatingReview = async(req, res)=>{
    try{
        const allReviews = await RatingAndReview.find({})
        .sort({rating:'desc'})
        .populate({
            path:'user',
            select:'firstName lastName email image'
        })
        .populate({
            path:'course',
            select:'courseName'
        })
        .exec();

        return res.status(200).json({
            success:true,
            data:allReviews,
            message:"All reviews fetched successfully"
        });
    }
    catch(error){
        console.log('Error while fetching all ratings');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching all ratings',
        })
    }
}

// ================ Get Selected Reviews Only ================
exports.getSelectedReviews = async(req, res)=>{
    try{
        const selectedReviews = await RatingAndReview.find({ isSelected: true })
        .sort({rating:'desc'})
        .populate({
            path:'user',
            select:'firstName lastName email image'
        })
        .populate({
            path:'course',
            select:'courseName'
        })
        .exec();

        return res.status(200).json({
            success:true,
            data:selectedReviews,
            message:"Selected reviews fetched successfully"
        });
    }
    catch(error){
        console.log('Error while fetching selected ratings');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching selected ratings',
        })
    }
}

// ================ Admin: Get All Reviews for Management ================
exports.getAllReviewsForAdmin = async(req, res)=>{
    try{
        const allReviews = await RatingAndReview.find({})
        .sort({createdAt: 'desc'})
        .populate({
            path:'user',
            select:'firstName lastName email image'
        })
        .populate({
            path:'course',
            select:'courseName'
        })
        .exec();

        return res.status(200).json({
            success:true,
            data:allReviews,
            message:"All reviews fetched successfully for admin"
        });
    }
    catch(error){
        console.log('Error while fetching all ratings for admin');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while fetching all ratings for admin',
        })
    }
}

// ================ Admin: Toggle Review Selection ================
exports.toggleReviewSelection = async(req, res)=>{
    try{
        const { reviewId } = req.params;

        if (!reviewId) {
            return res.status(400).json({
                success: false,
                message: "Review ID is required"
            });
        }

        const review = await RatingAndReview.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Toggle the isSelected field
        review.isSelected = !review.isSelected;
        await review.save();

        // Populate the updated review for response
        const updatedReview = await RatingAndReview.findById(reviewId)
        .populate({
            path:'user',
            select:'firstName lastName email image'
        })
        .populate({
            path:'course',
            select:'courseName'
        })
        .exec();

        return res.status(200).json({
            success:true,
            data:updatedReview,
            message:`Review ${review.isSelected ? 'selected' : 'deselected'} successfully`
        });
    }
    catch(error){
        console.log('Error while toggling review selection');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while toggling review selection',
        })
    }
}

// ================ Admin: Bulk Update Review Selection ================
exports.bulkUpdateReviewSelection = async(req, res)=>{
    try{
        const { reviewIds, isSelected } = req.body;

        if (!reviewIds || !Array.isArray(reviewIds)) {
            return res.status(400).json({
                success: false,
                message: "Review IDs array is required"
            });
        }

        if (typeof isSelected !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "isSelected must be a boolean value"
            });
        }

        const result = await RatingAndReview.updateMany(
            { _id: { $in: reviewIds } },
            { isSelected: isSelected }
        );

        return res.status(200).json({
            success:true,
            data: {
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            },
            message:`${result.modifiedCount} reviews ${isSelected ? 'selected' : 'deselected'} successfully`
        });
    }
    catch(error){
        console.log('Error while bulk updating review selection');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while bulk updating review selection',
        })
    }
}

// ================ Admin: Delete Review ================
exports.deleteReview = async(req, res)=>{
    try{
        const { reviewId } = req.params;

        if (!reviewId) {
            return res.status(400).json({
                success: false,
                message: "Review ID is required"
            });
        }

        // Find the review first to get course ID
        const review = await RatingAndReview.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Remove review from course's ratingAndReviews array
        await Course.findByIdAndUpdate(
            review.course,
            {
                $pull: {
                    ratingAndReviews: reviewId
                }
            }
        );

        // Delete the review
        await RatingAndReview.findByIdAndDelete(reviewId);

        return res.status(200).json({
            success:true,
            
        });
    }
    catch(error){
        console.log('Error while deleting review');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error while deleting review',
        })
    }
}
