const mongoose = require("mongoose")

const courseProgressSchema = new mongoose.Schema({
    courseID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        },
    ],
    completedQuizzes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        }
    ],
    passedQuizzes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubSection",
        }
    ],
    quizResults: [
        {
            quiz: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Quiz"
            },
            subSection: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubSection"
            },
            score: Number,
            totalMarks: Number,
            percentage: Number,
            passed: {
                type: Boolean,
                default: false
            },
            attempts: {
                type: Number,
                default: 1
            },
            completedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true // This will add createdAt and updatedAt fields automatically
})



module.exports = mongoose.model("CourseProgress", courseProgressSchema)

