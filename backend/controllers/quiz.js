const Quiz = require('../models/quiz');
const CourseProgress = require('../models/courseProgress');
const SubSection = require('../models/subSection');
const Course = require('../models/course');
const { executeCode } = require('../services/codeExecution');
const { handleNewContentAddition } = require('../utils/certificateRegeneration');

// Create a new quiz
exports.createQuiz = async (req, res) => {
    try {
        const { subSectionId, questions, timeLimit } = req.body;

        if (!subSectionId || !questions) {
            return res.status(400).json({
                success: false,
                message: 'SubSection ID and questions are required'
            });
        }

        // Validate questions array
        if (!Array.isArray(questions) || questions.length < 1 || questions.length > 25) {
            return res.status(400).json({
                success: false,
                message: 'Questions must be an array with 1 to 25 items'
            });
        }

        // Validate timeLimit if provided
        if (timeLimit !== undefined) {
            if (typeof timeLimit !== 'number' || timeLimit < 1 * 60 || timeLimit > 180 * 60) {
                return res.status(400).json({
                    success: false,
                    message: 'Time limit must be between 1 minute (60 seconds) and 3 hours (10800 seconds)'
                });
            }
        }

        // Validate code solving questions
        for (const question of questions) {
            if (question.questionType === 'codeSolve') {
                if (!question.testCases || !Array.isArray(question.testCases) || question.testCases.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Code solving questions must have at least one test case'
                    });
                }
                
                // Validate test cases
                for (const testCase of question.testCases) {
                    if (!testCase.expectedOutput || testCase.expectedOutput.trim() === '') {
                        return res.status(400).json({
                            success: false,
                            message: 'All test cases must have expected output'
                        });
                    }
                }
                
                // Validate programming language
                const validLanguages = ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'ruby', 'csharp', 'kotlin', 'typescript', 'sql', 'open'];
                if (!question.programmingLanguage || !validLanguages.includes(question.programmingLanguage)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Code solving questions must have a valid programming language'
                    });
                }
            }
        }

        // Check if quiz already exists for this subsection
        const existingQuiz = await Quiz.findOne({ subSection: subSectionId });
        if (existingQuiz) {
            return res.status(400).json({
                success: false,
                message: 'Quiz already exists for this subsection'
            });
        }

        // Create quiz data
        const quizData = {
            subSection: subSectionId,
            questions
        };

        // Add timeLimit if provided, otherwise use default
        if (timeLimit !== undefined) {
            quizData.timeLimit = timeLimit;
        }

        // Create quiz
        const quiz = await Quiz.create(quizData);

        // Update subsection with quiz reference
        await SubSection.findByIdAndUpdate(subSectionId, { quiz: quiz._id });

        // Handle certificate regeneration for students who completed the course
        try {
            // Find the section that contains this subsection
            const Section = require('../models/section');
            const section = await Section.findOne({
                subSection: subSectionId
            });
            
            if (section) {
                const course = await Course.findOne({
                    courseContent: section._id
                });

                if (course) {
                    await handleNewContentAddition(
                        course._id,
                        'quiz',
                        {
                            subSectionId,
                            quizId: quiz._id,
                            questionsCount: questions.length,
                            timeLimit: quiz.timeLimit
                        }
                    );
                }
            }
        } catch (certError) {
            console.error('Error handling certificate regeneration for new quiz:', certError);
            // Don't fail the quiz creation if certificate regeneration fails
        }

        return res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: quiz
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating quiz',
            error: error.message
        });
    }
};

// Update an existing quiz
exports.updateQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { questions, timeLimit } = req.body;

        if (!questions) {
            return res.status(400).json({
                success: false,
                message: 'Questions are required'
            });
        }

        // Validate questions array
        if (!Array.isArray(questions) || questions.length < 1 || questions.length > 25) {
            return res.status(400).json({
                success: false,
                message: 'Questions must be an array with 1 to 25 items'
            });
        }

        // Validate timeLimit if provided
        if (timeLimit !== undefined) {
            if (typeof timeLimit !== 'number' || timeLimit < 1 * 60 || timeLimit > 180 * 60) {
                return res.status(400).json({
                    success: false,
                    message: 'Time limit must be between 1 minute (60 seconds) and 3 hours (10800 seconds)'
                });
            }
        }

        // Validate code solving questions
        for (const question of questions) {
            if (question.questionType === 'codeSolve') {
                if (!question.testCases || !Array.isArray(question.testCases) || question.testCases.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Code solving questions must have at least one test case'
                    });
                }
                
                // Validate test cases
                for (const testCase of question.testCases) {
                    if (!testCase.expectedOutput || testCase.expectedOutput.trim() === '') {
                        return res.status(400).json({
                            success: false,
                            message: 'All test cases must have expected output'
                        });
                    }
                }

                // Validate programming language
                const validLanguages = ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'ruby', 'csharp', 'kotlin', 'typescript', 'sql', 'open'];
                if (!question.programmingLanguage || !validLanguages.includes(question.programmingLanguage)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Code solving questions must have a valid programming language'
                    });
                }
            }
        }

        // Create update data
        const updateData = { questions };
        if (timeLimit !== undefined) {
            updateData.timeLimit = timeLimit;
        }

        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            updateData,
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Handle certificate regeneration for quiz updates
        try {
            // Find the subsection that contains this quiz
            const subSection = await SubSection.findOne({ quiz: quizId });
            
            if (subSection) {
                // Find the section that contains this subsection
                const Section = require('../models/section');
                const section = await Section.findOne({
                    subSection: subSection._id
                });
                
                if (section) {
                    const course = await Course.findOne({
                        courseContent: section._id
                    });

                    if (course) {
                        await handleNewContentAddition(
                            course._id,
                            'quiz_update',
                            {
                                subSectionId: subSection._id,
                                quizId: quiz._id,
                                questionsCount: questions.length,
                                timeLimit: quiz.timeLimit,
                                updateType: 'modification'
                            }
                        );
                    }
                }
            }
        } catch (certError) {
            console.error('Error handling certificate regeneration for quiz update:', certError);
            // Don't fail the quiz update if certificate regeneration fails
        }

        return res.status(200).json({
            success: true,
            message: 'Quiz updated successfully',
            data: quiz
        });
    } catch (error) {
        console.error('Error updating quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Error updating quiz',
            error: error.message
        });
    }
};

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({})
            .populate('subSection', 'title')
            .select('_id title description createdAt')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        console.error('Error fetching all quizzes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching quizzes',
            error: error.message
        });
    }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching quiz',
            error: error.message
        });
    }
};

// Get quiz results
exports.getQuizResults = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const courseProgress = await CourseProgress.findOne({
            userId,
            'quizResults.quiz': quizId
        });

        if (!courseProgress) {
            return res.status(404).json({
                success: false,
                message: 'No quiz results found'
            });
        }

        const quizResult = courseProgress.quizResults.find(
            result => result.quiz.toString() === quizId
        );

        return res.status(200).json({
            success: true,
            data: quizResult
        });
    } catch (error) {
        console.error('Error fetching quiz results:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching quiz results',
            error: error.message
        });
    }
};

// Validate section access
exports.validateSectionAccess = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const userId = req.user.id;

        // Get all subsections in the section with quizzes
        const subsections = await SubSection.find({
            section: sectionId,
            quiz: { $exists: true }
        }).sort('createdAt');

        if (!subsections.length) {
            return res.status(200).json({
                success: true,
                canAccess: true
            });
        }

        // Get user's course progress
        const courseProgress = await CourseProgress.findOne({ userId });
        
        if (!courseProgress) {
            return res.status(200).json({
                success: true,
                canAccess: subsections[0]._id === sectionId
            });
        }

        // Check if all previous quizzes are passed with 60% or higher
        for (const subsection of subsections) {
            if (subsection._id === sectionId) {
                break;
            }
            
            if (!courseProgress.passedQuizzes.includes(subsection._id)) {
                return res.status(200).json({
                    success: true,
                    canAccess: false,
                    message: 'Pass previous quizzes with at least 60% to unlock this section'
                });
            }
        }

        return res.status(200).json({
            success: true,
            canAccess: true
        });
    } catch (error) {
        console.error('Error validating section access:', error);
        return res.status(500).json({
            success: false,
            message: 'Error validating section access',
            error: error.message
        });
    }
};

// Submit quiz answers and validate
// Get quiz status (passed/failed/attempts)
exports.getQuizStatus = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.user.id;

        const courseProgress = await CourseProgress.findOne({
            userId,
            'quizResults.quiz': quizId
        });

        if (!courseProgress) {
            return res.status(200).json({
                success: true,
                data: {
                    attempts: 0,
                    passed: false,
                    lastAttempt: null
                }
            });
        }

        const quizResult = courseProgress.quizResults.find(
            result => result.quiz.toString() === quizId
        );

        if (!quizResult) {
            return res.status(200).json({
                success: true,
                data: {
                    attempts: 0,
                    passed: false,
                    lastAttempt: null
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                attempts: quizResult.attempts,
                passed: quizResult.passed,
                lastAttempt: {
                    score: quizResult.score,
                    totalMarks: quizResult.totalMarks,
                    percentage: quizResult.percentage,
                    completedAt: quizResult.completedAt
                }
            }
        });
    } catch (error) {
        console.error('Error getting quiz status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error getting quiz status',
            error: error.message
        });
    }
};

exports.submitQuiz = async (req, res) => {
    console.log('=== QUIZ SUBMISSION START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User:', req.user);
    
    try {
        const { quizId, courseID, subsectionId, answers, timerExpired } = req.body;
        const userId = req.user?.id;

        console.log('Extracted data:', { quizId, courseID, subsectionId, userId, timerExpired });

        // Validate user
        if (!userId) {
            console.log('ERROR: User not authenticated');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (!quizId) {
            console.log('ERROR: quizId missing');
            return res.status(400).json({
                success: false,
                message: 'quizId is required'
            });
        }

        if (!courseID) {
            console.log('ERROR: courseID missing');
            return res.status(400).json({
                success: false,
                message: 'courseID is required'
            });
        }

        if (!subsectionId) {
            console.log('ERROR: subsectionId missing');
            return res.status(400).json({
                success: false,
                message: 'subsectionId is required'
            });
        }

        // Validate answers object
        if (!answers || typeof answers !== 'object') {
            console.log('ERROR: answers object invalid');
            return res.status(400).json({
                success: false,
                message: 'answers object is required'
            });
        }

        console.log('All validations passed, finding quiz...');

        // Find quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            console.log('ERROR: Quiz not found for ID:', quizId);
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        console.log('Quiz found:', quiz.title || 'Untitled Quiz');

        // Find existing course progress
        console.log('Finding course progress for:', { userId, courseID });
        let courseProgress = await CourseProgress.findOne({ userId, courseID });
        console.log('Found course progress:', courseProgress ? 'Yes' : 'No');
        
        // Check if quiz is already passed
        const existingResult = courseProgress?.quizResults?.find(
            result => result.quiz.toString() === quiz._id.toString() && result.passed
        );
        console.log('Existing quiz result:', existingResult ? 'Yes (Passed)' : 'No');
        
        if (existingResult) {
            console.log('Quiz already passed, returning existing result');
            return res.status(400).json({
                success: false,
                message: 'Quiz already passed. Retakes not allowed for passed quizzes.',
                data: {
                    score: existingResult.score,
                    totalMarks: existingResult.totalMarks,
                    percentage: existingResult.percentage,
                    passed: true
                }
            });
        }

        console.log('Starting score calculation...');

        // Validate required questions and calculate score
        let score = 0;
        let totalMarks = 0;
        const unansweredQuestions = [];

        for (let i = 0; i < quiz.questions.length; i++) {
            const question = quiz.questions[i];
            const questionId = question._id.toString();
            
            totalMarks += question.marks;

            // Check if question is answered based on question type
            let isAnswered = false;
            let isCorrect = false;

            // Check if answer exists for this question
            const answer = answers[questionId];

            if (question.questionType === 'codeSolve') {
                // For code solving questions
                isAnswered = answer && typeof answer.code === 'string' && answer.code.trim() !== '';
                
                if (isAnswered) {
                    // Execute code against test cases
                    try {
                        const testResults = await Promise.all(question.testCases.map(async testCase => {
                            const result = await executeCode(
                                answer.code,
                                question.programmingLanguage === 'open' ? answer.language : question.programmingLanguage,
                                testCase.input
                            );
                            
                            // Clean up output (remove trailing newlines, etc)
                            const cleanOutput = (output) => output.trim().replace(/\r\n/g, '\n');
                            const expectedOutput = cleanOutput(testCase.expectedOutput);
                            const actualOutput = cleanOutput(result.data.stdout || '');
                            
                            return {
                                passed: expectedOutput === actualOutput,
                                input: testCase.input,
                                expectedOutput,
                                actualOutput,
                                error: result.data.stderr || null
                            };
                        }));

                        // Question is correct if all test cases pass
                        isCorrect = testResults.every(result => result.passed);
                        
                        // Store test results for feedback
                        answer.testResults = testResults;
                    } catch (error) {
                        console.error('Code execution error:', error);
                        isCorrect = false;
                        answer.error = error.message;
                    }
                }
            } else if (question.questionType === 'matchTheFollowing') {
                // For match the following, check if all pairs are answered
                const hasAllMatches = question.options.every((_, optionIndex) => 
                    answers[`${questionId}_${optionIndex}`] !== undefined && 
                    answers[`${questionId}_${optionIndex}`] !== ''
                );
                isAnswered = hasAllMatches;
                
                if (isAnswered) {
                    // Check if ALL matches are correct - if any one is wrong, entire question is wrong
                    isCorrect = question.options.every((_, optionIndex) => {
                        const userAnswer = answers[`${questionId}_${optionIndex}`];
                        // The correct answer should match the option index
                        return parseInt(userAnswer) === optionIndex;
                    });
                }
            } else if (question.questionType === 'multipleChoice') {
                // For multiple choice questions
                const answer = answers[questionId];
                isAnswered = Array.isArray(answer) && answer.length > 0;
                
                if (isAnswered && question.correctAnswers && question.correctAnswers.length > 0) {
                    // Check if selected answers match correct answers
                    const selectedIndices = answer.sort();
                    const correctIndices = question.correctAnswers.sort();
                    isCorrect = selectedIndices.length === correctIndices.length && 
                               selectedIndices.every((val, index) => val === correctIndices[index]);
                }
            } else if (question.questionType === 'singleAnswer') {
                // For single answer questions
                const answer = answers[questionId];
                isAnswered = answer !== undefined && answer !== null;
                
                if (isAnswered) {
                    const correctNum = Number(question.correctAnswer);
                    const answerNum = Number(answer);
                    isCorrect = answerNum === correctNum;
                }
            } else {
                // For other question types (shortAnswer, longAnswer)
                const answer = answers[questionId];
                isAnswered = answer !== undefined && answer !== null && 
                           (typeof answer === 'string' ? answer.trim() !== '' : true);
                
                // For short answer questions, check if at least 50% of keywords match
                if (isAnswered && question.questionType === 'shortAnswer') {
                  if (!question.keywords || question.keywords.length === 0) {
                    isCorrect = true; // If no keywords defined, consider it correct
                  } else {
                    const studentAnswer = answer.toLowerCase();
                    const matchedKeywords = question.keywords.filter(keyword => 
                      studentAnswer.includes(keyword.toLowerCase())
                    );
                    isCorrect = matchedKeywords.length >= Math.ceil(question.keywords.length * 0.5);
                  }
                } else if (isAnswered) {
                  isCorrect = true; // For other text answers (like longAnswer)
                }
            }

            // Track unanswered required questions (only if timer hasn't expired)
            if (question.required && !isAnswered && !timerExpired) {
                return res.status(400).json({
                    success: false,
                    message: `Answer required for question ${i + 1}`
                });
            }

            // Add to score if correct
            if (isCorrect) {
                score += question.marks;
            }
        }

        console.log('Score calculation complete:', { score, totalMarks });

        // Only validate required questions if timer hasn't expired
        if (!timerExpired && unansweredQuestions.length > 0) {
            console.log('Unanswered questions found:', unansweredQuestions);
            return res.status(400).json({
                success: false,
                message: `Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`
            });
        }

        // Calculate percentage
        const percentage = (score / totalMarks) * 100;
        const passed = percentage >= 60;

        console.log('Starting course progress update...');

        // Simplified course progress update
        if (!courseProgress) {
            console.log('Creating new course progress');
            try {
                courseProgress = new CourseProgress({
                    userId,
                    courseID,
                    completedVideos: [],
                    completedQuizzes: passed ? [subsectionId] : [],
                    passedQuizzes: passed ? [subsectionId] : [],
                    quizResults: [{
                        quiz: quiz._id,
                        subSection: subsectionId,
                        score,
                        totalMarks,
                        percentage,
                        passed,
                        attempts: 1,
                        completedAt: new Date()
                    }]
                });
                await courseProgress.save();
                console.log('Course progress created successfully');
            } catch (saveError) {
                console.error('Error creating course progress:', saveError);
                throw saveError;
            }
        } else {
            console.log('Updating existing course progress');
            try {
                // Find existing quiz result
                const existingQuizResultIndex = courseProgress.quizResults.findIndex(
                    result => result.quiz.toString() === quiz._id.toString()
                );

                const newQuizResult = {
                    quiz: quiz._id,
                    subSection: subsectionId,
                    score,
                    totalMarks,
                    percentage,
                    passed,
                    attempts: existingQuizResultIndex >= 0 ? courseProgress.quizResults[existingQuizResultIndex].attempts + 1 : 1,
                    completedAt: new Date()
                };

                if (existingQuizResultIndex >= 0) {
                    // Update existing result
                    courseProgress.quizResults[existingQuizResultIndex] = newQuizResult;
                } else {
                    // Add new result
                    courseProgress.quizResults.push(newQuizResult);
                }

                // Update completed and passed quizzes if passed
                if (passed) {
                    if (!courseProgress.completedQuizzes.includes(subsectionId)) {
                        courseProgress.completedQuizzes.push(subsectionId);
                    }
                    if (!courseProgress.passedQuizzes.includes(subsectionId)) {
                        courseProgress.passedQuizzes.push(subsectionId);
                    }
                }

                await courseProgress.save();
                console.log('Course progress updated successfully');
            } catch (updateError) {
                console.error('Error updating course progress:', updateError);
                throw updateError;
            }
        }

        console.log('Sending success response...');

        return res.status(200).json({
            success: true,
            message: passed ? 'Quiz passed successfully!' : 'Quiz submitted successfully, but did not meet passing score.',
            data: {
                score,
                totalMarks,
                percentage: percentage.toFixed(1),
                passed,
                requiredPercentage: 60
            }
        });
    } catch (error) {
        console.error('=== QUIZ SUBMISSION ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Request data:', {
            quizId: req.body?.quizId,
            courseID: req.body?.courseID,
            subsectionId: req.body?.subsectionId,
            userId: req.user?.id,
            timerExpired: req.body?.timerExpired
        });

        // Check for specific error types
        if (error.name === 'ValidationError') {
            console.error('Validation Error Details:', error.errors);
            return res.status(400).json({
                success: false,
                message: 'Validation error while submitting quiz',
                error: error.message,
                details: error.errors
            });
        }

        if (error.name === 'CastError') {
            console.error('Cast Error Details:', error);
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format',
                error: error.message
            });
        }

        if (error.name === 'MongoError' || error.name === 'MongoServerError') {
            console.error('MongoDB Error Details:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error while submitting quiz',
                error: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error submitting quiz',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
