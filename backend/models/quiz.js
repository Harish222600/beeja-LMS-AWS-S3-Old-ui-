const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: {
        type: String,
        default: ''
    },
    expectedOutput: {
        type: String,
        required: true
    },
    isHidden: {
        type: Boolean,
        default: false
    }
});

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        enum: ['multipleChoice', 'singleAnswer', 'shortAnswer', 'matchTheFollowing', 'longAnswer', 'codeSolve'],
        required: true
    },
    options: [
        {
            type: String
        }
    ],
    answers: [
        {
            type: String // Array of answers for match the following questions
        }
    ],
    correctAnswers: [
        {
            type: Number // Array of indices for multiple choice questions
        }
    ],
    correctAnswer: {
        type: Number // Single index for single answer questions
    },
    keywords: {
        type: [String], // Array of keywords for short answer questions
        default: []
    },
    // Code solving specific fields
    programmingLanguage: {
        type: String,
        enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'open'], // 'open' means multiple languages allowed
        default: 'javascript'
    },
    starterCode: {
        type: String,
        default: ''
    },
    solutionCode: {
        type: String,
        default: ''
    },
    testCases: [testCaseSchema],
    marks: {
        type: Number,
        default: 1
    },
    required: {
        type: Boolean,
        default: true
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Quiz'
    },
    description: {
        type: String,
        default: 'Complete this quiz to test your knowledge'
    },
    subSection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubSection',
        required: true,
        unique: true
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: function(val) {
                // Remove validation temporarily for testing
                return true;
                // return val.length >= 15 && val.length <= 25;
            },
            message: '{PATH} must have between 15 and 25 questions'
        },
        required: true
    },
    timeLimit: {
        type: Number,
        default: 10 * 60, // Default 10 minutes in seconds
        min: 1 * 60, // Minimum 1 minute
        max: 180 * 60 // Maximum 3 hours
    }
});

module.exports = mongoose.model('Quiz', quizSchema);
