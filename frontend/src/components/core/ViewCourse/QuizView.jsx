import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { getQuizById, submitQuiz, getQuizStatus } from "../../../services/operations/quizAPI"
import IconBtn from "../../common/IconBtn"
import CodeEditor from "../../common/CodeEditor"
import { IoIosArrowBack } from "react-icons/io"
import { FiClock, FiCheckCircle, FiAlertCircle, FiAward } from "react-icons/fi"
import { HiOutlineQuestionMarkCircle } from "react-icons/hi"
import Xarrow from 'react-xarrows'
import { toast } from "react-hot-toast"

const QuizView = () => {
  const { courseId, sectionId, subSectionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useSelector((state) => state.auth)
  const { courseSectionData, courseEntireData, completedLectures } = useSelector((state) => state.viewCourse)

  const [quizData, setQuizData] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const [quizStatus, setQuizStatus] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [retakeKey, setRetakeKey] = useState(0)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [shuffledAnswers, setShuffledAnswers] = useState({})
  const [notificationsShown, setNotificationsShown] = useState({
    twenty: false,
    ten: false,
    five: false,
    one: false
  })
  const [initialTimeLimit, setInitialTimeLimit] = useState(null)

  // Load quiz data and status
  useEffect(() => {
    const loadQuiz = async () => {
      if (!courseSectionData.length) return
      
      const filteredData = courseSectionData.filter(course => course._id === sectionId)
      const filteredVideoData = filteredData?.[0]?.subSection.filter(data => data._id === subSectionId)
      
      if (filteredVideoData?.[0]?.quiz) {
        const quizId = typeof filteredVideoData[0].quiz === 'object' 
          ? filteredVideoData[0].quiz._id 
          : filteredVideoData[0].quiz
        
        try {
          setLoading(true)
          const [quiz, status] = await Promise.all([
            getQuizById(quizId, token),
            getQuizStatus(quizId, token)
          ])
          setQuizData(quiz)
          setQuizStatus(status)
          const timeLimit = quiz.timeLimit || 10 * 60
          setTimeRemaining(timeLimit)
          setInitialTimeLimit(timeLimit) // Store initial time limit
        } catch (error) {
          console.error("Error loading quiz:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadQuiz()
  }, [courseSectionData, sectionId, subSectionId, token])

  // Timer effect
  useEffect(() => {
    if (quizStarted && timeRemaining > 0 && initialTimeLimit) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          // Smart notification logic - skip if initial time limit matches notification threshold
          const shouldSkip20Min = initialTimeLimit === 1200 // Skip if quiz is exactly 20 minutes
          const shouldSkip10Min = initialTimeLimit === 600  // Skip if quiz is exactly 10 minutes
          const shouldSkip5Min = initialTimeLimit === 300   // Skip if quiz is exactly 5 minutes
          const shouldSkip1Min = initialTimeLimit === 60    // Skip if quiz is exactly 1 minute

          // Check for notification thresholds with smart skipping logic
          if (prev === 1200 && !notificationsShown.twenty && !shouldSkip20Min) { // 20 minutes
            toast.success("20 minutes remaining!", {
              icon: "⏰",
              duration: 4000
            })
            setNotificationsShown(prev => ({ ...prev, twenty: true }))
          }
          else if (prev === 600 && !notificationsShown.ten && !shouldSkip10Min) { // 10 minutes
            toast.success("10 minutes remaining!", {
              icon: "⚠️",
              duration: 4000
            })
            setNotificationsShown(prev => ({ ...prev, ten: true }))
          }
          else if (prev === 300 && !notificationsShown.five && !shouldSkip5Min) { // 5 minutes
            toast.success("5 minutes remaining!", {
              icon: "⚠️",
              duration: 4000
            })
            setNotificationsShown(prev => ({ ...prev, five: true }))
          }
          else if (prev === 60 && !notificationsShown.one && !shouldSkip1Min) { // 1 minute
            toast.success("1 minute remaining!", {
              icon: "🚨",
              duration: 4000
            })
            setNotificationsShown(prev => ({ ...prev, one: true }))
          }

          if (prev <= 1) {
            handleTimerExpiry()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [quizStarted, timeRemaining, notificationsShown, initialTimeLimit])

  // Function to check if shuffled array is in different order than original
  const isShuffledDifferent = (original, shuffled) => {
    return !shuffled.every((item, index) => item.originalIndex === index);
  }

  // Function to shuffle array until it's in a different order
  const shuffleUntilDifferent = (array) => {
    let shuffled;
    do {
      shuffled = [...array].sort(() => Math.random() - 0.5);
    } while (!isShuffledDifferent(array, shuffled));
    return shuffled;
  }

  // Initialize shuffled answers for match the following questions
  useEffect(() => {
    if (quizData && quizData.questions) {
      const newShuffledAnswers = {}
      quizData.questions.forEach(question => {
        if (question.questionType === 'matchTheFollowing') {
          const answersToShow = question.answers || question.options
          const mappedAnswers = answersToShow
            .map((answer, index) => ({ 
              answer, 
              originalIndex: index, 
              letter: String.fromCharCode(65 + index) 
            }))
          
          // Shuffle until we get a different order than original
          const shuffled = shuffleUntilDifferent(mappedAnswers)
          newShuffledAnswers[question._id] = shuffled
        }
      })
      setShuffledAnswers(newShuffledAnswers)
    }
  }, [quizData])

  // Function to handle quiz retake
  const handleQuizRetake = async () => {
    try {
      setLoading(true)
      console.log("Retake Quiz button clicked")
      
      // Reset notifications state for retake
      setNotificationsShown({
        twenty: false,
        ten: false,
        five: false,
        one: false
      })
      
      // Check if quiz is already passed
      if (quizStatus && quizStatus.passed) {
        alert("Quiz already passed. Retakes are not allowed for passed quizzes.")
        setLoading(false)
        return
      }

      // Force reload quiz data to get fresh state
      const [quiz, status] = await Promise.all([
        getQuizById(quizData._id, token),
        getQuizStatus(quizData._id, token)
      ])

      if (!quiz) {
        throw new Error("Could not load quiz data")
      }
      
      // Reset all state to initial values
      setQuizData(quiz)
      setQuizStatus(status)
      setQuizResult(null)
      setCurrentQuestion(0)
      setQuizAnswers({})
      setSelectedQuestion(null)
      setShuffledAnswers({})
      setRetakeKey(prev => prev + 1)
      
      // Reset timer with fallback
      const timeLimit = quiz.timeLimit || 10 * 60
      setTimeRemaining(timeLimit)
      setInitialTimeLimit(timeLimit) // Update initial time limit for retake
      
      // Re-shuffle answers for match the following questions
      if (quiz.questions) {
        const newShuffledAnswers = {}
        quiz.questions.forEach(question => {
          if (question.questionType === 'matchTheFollowing') {
            const answersToShow = question.answers || question.options
            const mappedAnswers = answersToShow
              .map((answer, index) => ({ 
                answer, 
                originalIndex: index, 
                letter: String.fromCharCode(65 + index) 
              }))
            
            // Shuffle until we get a different order than original
            const shuffled = shuffleUntilDifferent(mappedAnswers)
            newShuffledAnswers[question._id] = shuffled
          }
        })
        setShuffledAnswers(newShuffledAnswers)
      }
      
      // Start the quiz immediately after reset
      setQuizStarted(true)
      
      setLoading(false)
      console.log("Quiz state reset and started for retake")
    } catch (error) {
      console.error("Error retaking quiz:", error)
      alert("Error retaking quiz. Please try again.")
      setLoading(false)
    }
  }

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle question click for manual connection
  const handleQuestionClick = (questionIndex) => {
    if (selectedQuestion === questionIndex) {
      setSelectedQuestion(null)
      return
    }
    setSelectedQuestion(questionIndex)
  }

  const handleAnswerClick = (answerIndex) => {
    if (selectedQuestion !== null) {
      const currentQuestionData = quizData.questions[currentQuestion]
      // Check if this connection already exists
      const existingConnection = Object.entries(quizAnswers)
        .find(([key, value]) => 
          key.startsWith(currentQuestionData._id) && 
          parseInt(key.split('_')[1]) === selectedQuestion && 
          value === answerIndex
        )

      if (existingConnection) {
        // Remove the connection if it exists
        const [key] = existingConnection
        const newAnswers = { ...quizAnswers }
        delete newAnswers[key]
        setQuizAnswers(newAnswers)
      } else {
        // Create new connection
        handleQuizAnswer(`${currentQuestionData._id}_${selectedQuestion}`, answerIndex)
      }
      setSelectedQuestion(null)
    }
  }

  // Handle quiz answer selection
  const handleQuizAnswer = (questionId, selectedOption, questionType = 'single') => {
    if (questionType === 'multipleChoice') {
      setQuizAnswers(prev => {
        const currentAnswers = prev[questionId] || []
        const isSelected = currentAnswers.includes(selectedOption)
        
        if (isSelected) {
          return {
            ...prev,
            [questionId]: currentAnswers.filter(option => option !== selectedOption)
          }
        } else {
          return {
            ...prev,
            [questionId]: [...currentAnswers, selectedOption]
          }
        }
      })
    } else if (questionType === 'singleAnswer') {
      setQuizAnswers(prev => ({
        ...prev,
        [questionId]: Number(selectedOption)
      }))
    } else {
      setQuizAnswers(prev => ({
        ...prev,
        [questionId]: selectedOption
      }))
    }
  }


  // Handle timer expiry - auto submit without validation
  const handleTimerExpiry = async () => {
    if (!quizData) return

    setLoading(true)
    try {
      const quizSubmissionData = {
        quizId: quizData._id,
        courseID: courseId,
        subsectionId: subSectionId,
        answers: quizAnswers || {}, // Use empty object if no answers
        timerExpired: true // Add timerExpired flag
      }

      const result = await submitQuiz(quizSubmissionData, token) // timerExpired is already in the data
      if (result) {
        setQuizResult(result)
        setQuizStarted(false) // Stop the quiz after submission
        try {
          const updatedStatus = await getQuizStatus(quizData._id, token)
          setQuizStatus(updatedStatus)
        } catch (error) {
          console.error("Error updating quiz status:", error)
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("Error submitting quiz due to timer expiry.")
    }
    setLoading(false)
  }

  // Submit quiz manually - with validation
  const handleQuizSubmit = async () => {
    if (!quizData) return

    // Validate all questions are answered
    const unansweredQuestions = []
    quizData.questions.forEach((question, index) => {
      const answer = quizAnswers[question._id]
      
      if (question.questionType === 'codeSolve') {
        // For code solving questions, check if code is provided
        if (!answer || !answer.code || answer.code.trim() === '') {
          unansweredQuestions.push(index + 1)
        }
      } else if (question.questionType === 'matchTheFollowing') {
        const hasAllMatches = question.options.every((_, optionIndex) => {
          const matchAnswer = quizAnswers[`${question._id}_${optionIndex}`]
          return matchAnswer !== undefined && matchAnswer !== null && matchAnswer !== ''
        })
        if (!hasAllMatches) {
          unansweredQuestions.push(index + 1)
        }
      } else if (question.questionType === 'multipleChoice') {
        const selectedOptions = quizAnswers[question._id] || []
        if (!Array.isArray(selectedOptions) || selectedOptions.length === 0) {
          unansweredQuestions.push(index + 1)
        }
      } else if (question.questionType === 'singleAnswer') {
        const answerNum = Number(answer)
        if (isNaN(answerNum) && answer !== 0) {
          unansweredQuestions.push(index + 1)
        }
      } else {
        if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
          unansweredQuestions.push(index + 1)
        }
      }
    })

    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions before submitting. Unanswered questions: ${unansweredQuestions.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      const quizSubmissionData = {
        quizId: quizData._id,
        courseID: courseId,
        subsectionId: subSectionId,
        answers: quizAnswers,
        timerExpired: false // Add timerExpired flag for manual submission
      }

      const result = await submitQuiz(quizSubmissionData, token) // timerExpired is already in the data
      if (result) {
        setQuizResult(result)
        setQuizStarted(false) // Stop the quiz after submission
        try {
          const updatedStatus = await getQuizStatus(quizData._id, token)
          setQuizStatus(updatedStatus)
        } catch (error) {
          console.error("Error updating quiz status:", error)
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("Error submitting quiz. Please try again.")
    }
    setLoading(false)
  }

  // Navigate to next lecture
  const goToNextLecture = () => {
    const currentSectionIndx = courseSectionData.findIndex(data => data._id === sectionId)
    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex(data => data._id === subSectionId)

    if (currentSubSectionIndx !== noOfSubsections - 1) {
      const nextSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx + 1]._id
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    } else if (currentSectionIndx < courseSectionData.length - 1) {
      const nextSectionId = courseSectionData[currentSectionIndx + 1]._id
      const nextSubSectionId = courseSectionData[currentSectionIndx + 1].subSection[0]._id
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    } else {
      navigate(`/dashboard/enrolled-courses`)
    }
  }

  // Check if this is the last lecture/quiz in the course
  const isLastItem = () => {
    const currentSectionIndx = courseSectionData.findIndex(data => data._id === sectionId)
    const noOfSubsections = courseSectionData[currentSectionIndx].subSection.length
    const currentSubSectionIndx = courseSectionData[currentSectionIndx].subSection.findIndex(data => data._id === subSectionId)
    
    // Check if it's the last subsection of the last section
    return currentSectionIndx === courseSectionData.length - 1 && currentSubSectionIndx === noOfSubsections - 1
  }

  // Compute result data
  const resultData = quizResult || (quizStatus?.lastAttempt && !quizStarted ? quizStatus.lastAttempt : null)
  const percentage = resultData ? parseFloat(resultData.percentage || 0) : 0
  const isPassed = percentage >= 60

  // Update quizStatus to reflect the correct pass state only if we have a result
  if (quizStatus && resultData) {
    quizStatus.passed = isPassed
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-50 mx-auto mb-4"></div>
          <p className="text-richblack-200">Loading quiz...</p>
        </div>
      </div>
    )
  }

  // Quiz not found state
  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FiAlertCircle className="mx-auto text-6xl text-richblack-400 mb-4" />
          <p className="text-richblack-200">Quiz not found</p>
          <IconBtn
            onClick={() => navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`)}
            text="Back to Lecture"
            customClasses="mt-4"
          />
        </div>
      </div>
    )
  }

  // Quiz result view - show if we have a result and quiz is not started, or if quiz was just submitted
  if ((resultData && !quizStarted) || quizResult) {
    return (
      <div key={retakeKey} className="max-w-4xl mx-auto p-6">
        <div className={`bg-gradient-to-r ${isPassed ? 'from-green-800 to-green-600' : 'from-red-800 to-red-600'} rounded-xl p-8 text-center shadow-xl`}>
          {isPassed ? (
            <FiAward className="mx-auto text-6xl text-white mb-4" />
          ) : (
            <FiAlertCircle className="mx-auto text-6xl text-white mb-4" />
          )}
          <h1 className="text-3xl font-bold text-white mb-4">
            {isPassed ? "Quiz Passed!" : "Quiz Completed"}
          </h1>
          
          <div className="bg-white/10 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
              <div>
                <p className="text-lg font-semibold">Your Score</p>
                <p className="text-3xl font-bold">{resultData.score}/{resultData.totalMarks}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Percentage</p>
                <p className="text-3xl font-bold">{percentage}%</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Status</p>
                <p className="text-xl font-bold">
                  {isPassed ? "Passed" : "Failed"}
                </p>
              </div>
              <div>
                <p className="text-lg font-semibold">Attempts</p>
                <p className="text-3xl font-bold">{quizStatus?.attempts || 1}</p>
              </div>
            </div>
          </div>

          {isPassed && (
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-white text-sm">
                🎉 Congratulations! You have successfully passed this quiz with {percentage}% (Required: 60%). 
                Retakes are not allowed for passed quizzes.
              </p>
            </div>
          )}

          {!isPassed && (
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <p className="text-white text-sm">
                You need at least 60% to pass this quiz. You can retake the quiz to improve your score.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <IconBtn
              onClick={() => navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`)}
              text="Back to Lecture"
              customClasses="px-6 py-3 bg-white text-gray-800 hover:bg-gray-100"
            />
            {!isPassed && (
              <IconBtn
                onClick={handleQuizRetake}
                text="Retake Quiz"
                customClasses="px-6 py-3 bg-yellow-50 text-richblack-900 hover:bg-yellow-100"
              />
            )}
            <IconBtn
              onClick={goToNextLecture}
              text={isLastItem() ? "Go to Course" : "Next Lecture"}
              customClasses="px-6 py-3"
            />
          </div>
        </div>
      </div>
    )
  }

  // Quiz start screen - show if quiz is not started and no result is being displayed
  if (!quizStarted && !quizResult) {
    return (
      <div key={retakeKey} className="max-w-4xl mx-auto p-6">
        <div className="bg-richblack-800 rounded-xl p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-richblack-700 hover:bg-richblack-600 transition-colors"
            >
              <IoIosArrowBack className="text-white text-xl" />
            </button>
            <h1 className="text-3xl font-bold text-white">Quiz Instructions</h1>
          </div>

          <div className="bg-richblack-700 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">{quizData.title}</h2>
            <p className="text-richblack-200 mb-4">{quizData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-richblack-200">
              <div className="flex items-center gap-2">
                <HiOutlineQuestionMarkCircle className="text-yellow-50" />
                <span>Questions: {quizData.questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="text-yellow-50" />
                <span>Time Limit: {formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Quiz Status Display */}
          {quizStatus && quizStatus.attempts > 0 && (
            <div className="bg-richblack-700 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Previous Attempts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-richblack-200">
                <div>
                  <p className="text-sm">Attempts Made</p>
                  <p className="text-xl font-bold text-white">{quizStatus.attempts}</p>
                </div>
                <div>
                  <p className="text-sm">Best Score</p>
                  <p className="text-xl font-bold text-white">
                    {quizStatus.lastAttempt.percentage}%
                  </p>
                </div>
                <div>
                  <p className="text-sm">Status</p>
                  <p className={`text-xl font-bold ${parseFloat(quizStatus.lastAttempt.percentage) >= 60 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(quizStatus.lastAttempt.percentage) >= 60 ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-800/20 border border-yellow-600 rounded-lg p-4 mb-6">
            <h3 className="text-yellow-200 font-semibold mb-2">Important Instructions:</h3>
            <ul className="text-yellow-100 space-y-1 text-sm">
              <li>• Answer all questions before submitting</li>
              <li>• You cannot go back once you start the quiz</li>
              <li>• The quiz will auto-submit when time runs out</li>
              <li>• Make sure you have a stable internet connection</li>
              <li>• You need at least 60% to pass this quiz</li>
              {quizStatus && quizStatus.passed && (
                <li className="text-green-300">• You have already passed this quiz. Retakes are not allowed.</li>
              )}
            </ul>
          </div>

          <div className="text-center">
            {quizStatus && quizStatus.passed ? (
              <div className="space-y-4">
                <div className="bg-green-800/20 border border-green-600 rounded-lg p-4">
                  <FiAward className="mx-auto text-4xl text-green-400 mb-2" />
                  <p className="text-green-200 font-semibold">Quiz Already Passed!</p>
                  <p className="text-green-300 text-sm">
                    You scored {quizStatus.lastAttempt.percentage}% on {new Date(quizStatus.lastAttempt.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <IconBtn
                  onClick={() => navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${subSectionId}`)}
                  text="Back to Lecture"
                  customClasses="px-8 py-3 text-lg"
                />
              </div>
            ) : (
              <IconBtn
                onClick={() => {
                  // Reset notifications when starting quiz
                  setNotificationsShown({
                    twenty: false,
                    ten: false,
                    five: false,
                    one: false
                  })
                  // Set initial time limit if not already set
                  if (!initialTimeLimit && timeRemaining) {
                    setInitialTimeLimit(timeRemaining)
                  }
                  setQuizStarted(true)
                }}
                text={quizStatus && quizStatus.attempts > 0 ? "Retake Quiz" : "Start Quiz"}
                customClasses="px-8 py-3 text-lg"
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Quiz taking interface
  const currentQuestionData = quizData.questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-richblack-800 rounded-xl p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">{quizData.title}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-50">
              <FiClock />
              <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-richblack-200">
          <span>Question {currentQuestion + 1} of {quizData.questions.length}</span>
          <div className="w-64 bg-richblack-700 rounded-full h-2">
            <div 
              className="bg-yellow-50 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-richblack-800 rounded-xl p-6 mb-6 shadow-xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          {currentQuestionData.questionText}
          <span className="text-sm text-richblack-300 ml-2">
            ({currentQuestionData.marks} {currentQuestionData.marks === 1 ? 'mark' : 'marks'})
          </span>
        </h2>

        {/* Code Solving Questions */}
        {currentQuestionData.questionType === 'codeSolve' && (
          <div className="space-y-4">
            <div className="bg-richblack-700 p-4 rounded-lg mb-4">
              <h4 className="text-lg font-semibold text-richblack-5 mb-2">Problem Description</h4>
              <p className="text-richblack-200 mb-4">{currentQuestionData.questionText}</p>
              
              {currentQuestionData.programmingLanguage !== 'open' && (
                <div className="mb-4">
                  <span className="text-sm text-richblack-300">Language: </span>
                  <span className="text-yellow-50 font-medium capitalize">
                    {currentQuestionData.programmingLanguage}
                  </span>
                </div>
              )}
            </div>
            
            <CodeEditor
              language={currentQuestionData.programmingLanguage === 'open' ? 'javascript' : currentQuestionData.programmingLanguage}
              starterCode={
                (quizAnswers[currentQuestionData._id] && quizAnswers[currentQuestionData._id].code) || 
                currentQuestionData.starterCode || 
                ''
              }
              onChange={(code) => {
                const currentAnswer = quizAnswers[currentQuestionData._id] || {};
                const language = currentQuestionData.programmingLanguage === 'open' 
                  ? (currentAnswer.language || 'javascript') 
                  : currentQuestionData.programmingLanguage;
                handleQuizAnswer(currentQuestionData._id, { 
                  code, 
                  language 
                });
              }}
              testCases={currentQuestionData.testCases || []}
              showInput={true}
              showOutput={true}
              allowLanguageChange={currentQuestionData.programmingLanguage === 'open'}
              height="350px"
            />
          </div>
        )}

        {/* Multiple Choice Questions */}
        {currentQuestionData.questionType === 'multipleChoice' && (
          <div className="space-y-3">
            <p className="text-sm text-richblack-300 mb-4">Select all that apply:</p>
            {currentQuestionData.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 p-3 bg-richblack-700 rounded-lg cursor-pointer hover:bg-richblack-600 transition-colors">
                <input
                  type="checkbox"
                  checked={(quizAnswers[currentQuestionData._id] || []).includes(optionIndex)}
                  onChange={() => handleQuizAnswer(currentQuestionData._id, optionIndex, 'multipleChoice')}
                  className="w-4 h-4 text-yellow-50 bg-richblack-600 border-richblack-500 rounded focus:ring-yellow-50"
                />
                <span className="text-richblack-25">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Single Answer Questions */}
        {currentQuestionData.questionType === 'singleAnswer' && (
          <div className="space-y-3">
            {currentQuestionData.options.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-3 p-3 bg-richblack-700 rounded-lg cursor-pointer hover:bg-richblack-600 transition-colors">
                <input
                  type="radio"
                  name={`question-${currentQuestionData._id}`}
                  value={optionIndex}
                  checked={quizAnswers[currentQuestionData._id] === optionIndex}
                  onChange={() => handleQuizAnswer(currentQuestionData._id, optionIndex, 'singleAnswer')}
                  className="w-4 h-4 text-yellow-50 bg-richblack-600 border-richblack-500 focus:ring-yellow-50"
                />
                <span className="text-richblack-25">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Short Answer Questions */}
        {currentQuestionData.questionType === 'shortAnswer' && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter your answer..."
              value={quizAnswers[currentQuestionData._id] || ''}
              onChange={(e) => handleQuizAnswer(currentQuestionData._id, e.target.value)}
              className="w-full p-4 bg-richblack-700 text-richblack-25 rounded-lg border border-richblack-600 focus:border-yellow-50 focus:outline-none transition-colors"
              maxLength={200}
            />
            <p className="text-xs text-richblack-400">Maximum 200 characters</p>
          </div>
        )}

        {/* Long Answer Questions */}
        {currentQuestionData.questionType === 'longAnswer' && (
          <div className="space-y-2">
            <textarea
              placeholder="Enter your detailed answer..."
              value={quizAnswers[currentQuestionData._id] || ''}
              onChange={(e) => handleQuizAnswer(currentQuestionData._id, e.target.value)}
              className="w-full p-4 bg-richblack-700 text-richblack-25 rounded-lg border border-richblack-600 focus:border-yellow-50 focus:outline-none resize-vertical transition-colors"
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-richblack-400">Maximum 1000 characters</p>
          </div>
        )}

        {/* Match the Following Questions */}
        {currentQuestionData.questionType === 'matchTheFollowing' && (
          <div className="space-y-4">
            <p className="text-sm text-richblack-300 mb-6">Click on a question and then click on its matching answer to create a connection:</p>
            
            <div className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative min-h-[400px]">
                {/* Left Column - Questions */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-yellow-50 mb-4 text-center">Questions</h4>
                  {currentQuestionData.options.map((option, optionIndex) => (
                    <div 
                      key={`q-${optionIndex}`}
                      id={`question-${optionIndex}`}
                      className={`p-4 bg-richblack-700 rounded-lg border-2 ${
                        selectedQuestion === optionIndex 
                          ? 'border-yellow-50' 
                          : Object.keys(quizAnswers).some(key => 
                              key.startsWith(currentQuestionData._id) && 
                              parseInt(key.split('_')[1]) === optionIndex
                            )
                          ? 'border-green-500'
                          : 'border-richblack-600'
                      } hover:border-yellow-50 transition-colors cursor-pointer relative z-10`}
                      onClick={() => handleQuestionClick(optionIndex)}
                    >
                      <div className="flex items-center">
                        <span className="text-richblack-25 flex-1">{option}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column - Shuffled Answers */}
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-yellow-50 mb-4 text-center">Answers</h4>
                  {(() => {
                    const questionShuffledAnswers = shuffledAnswers[currentQuestionData._id] || []
                    
                    return questionShuffledAnswers.map((item, displayIndex) => (
                      <div 
                        key={`a-${displayIndex}`}
                        id={`answer-${item.originalIndex}`}
                        className={`p-4 bg-richblack-700 rounded-lg border-2 ${
                          Object.values(quizAnswers).includes(item.originalIndex)
                            ? 'border-green-500'
                            : 'border-richblack-600'
                        } hover:border-yellow-50 transition-colors cursor-pointer relative z-10`}
                        onClick={() => handleAnswerClick(item.originalIndex)}
                      >
                        <div className="flex items-center">
                          <span className="text-richblack-25 flex-1">{item.answer}</span>
                        </div>
                      </div>
                    ))
                  })()}
                </div>

                {/* Connection Lines */}
                {Object.entries(quizAnswers)
                  .filter(([key]) => key.startsWith(currentQuestionData._id))
                  .map(([key, value]) => {
                    const questionIndex = parseInt(key.split('_')[1])
                    const colors = [
                      "#22C55E", // Green for question 1
                      "#3B82F6", // Blue for question 2
                      "#F59E0B", // Orange for question 3
                      "#EF4444"  // Red for question 4
                    ]
                    const arrowColor = colors[questionIndex] || "#22C55E"
                    
                    return (
                      <Xarrow
                        key={key}
                        start={`question-${questionIndex}`}
                        end={`answer-${value}`}
                        color={arrowColor}
                        strokeWidth={2}
                        path="grid"
                        gridBreak="50%"
                        startAnchor="right"
                        endAnchor="left"
                        showHead={true}
                        headSize={6}
                        headColor={arrowColor}
                        curveness={0}
                        dashness={{ strokeLen: 10, nonStrokeLen: 5, animation: -2 }}
                      />
                    )
                  })
                }
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-8 p-6 bg-richblack-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-yellow-50">Progress</h4>
                <span className="text-sm text-richblack-300">
                  {currentQuestionData.options.filter((_, index) => 
                    quizAnswers[`${currentQuestionData._id}_${index}`] !== undefined
                  ).length}/{currentQuestionData.options.length} Matched
                </span>
              </div>
              
              <div className="w-full bg-richblack-800 rounded-full h-2">
                <div 
                  className="bg-yellow-50 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(currentQuestionData.options.filter((_, index) => 
                      quizAnswers[`${currentQuestionData._id}_${index}`] !== undefined
                    ).length / currentQuestionData.options.length) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  setQuizAnswers(prevAnswers => {
                    const newAnswers = { ...prevAnswers }
                    Object.keys(newAnswers).forEach(key => {
                      if (key.startsWith(currentQuestionData._id)) {
                        delete newAnswers[key]
                      }
                    })
                    return newAnswers
                  })
                }}
                className="px-6 py-2 bg-richblack-700 text-yellow-50 rounded-lg hover:bg-richblack-600 transition-all duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                </svg>
                Reset Matches
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-yellow-800/20 border border-yellow-600 rounded-lg">
              <p className="text-yellow-200 text-sm">
                <strong>Instructions:</strong> Click on a question and then click on its matching answer to create a connection. Click the same combination again to remove the connection, or use the Reset button to clear all matches and start over.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-6">
        <IconBtn
          disabled={currentQuestion === 0}
          onClick={() => setCurrentQuestion(prev => prev - 1)}
          text="Previous"
          customClasses={`px-6 py-3 ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        <div className="flex gap-4">
          {currentQuestion < quizData.questions.length - 1 ? (
            <IconBtn
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              text="Next"
              customClasses="px-6 py-3"
            />
          ) : (
            <IconBtn
              onClick={handleQuizSubmit}
              text="Submit Quiz"
              customClasses="px-6 py-3 bg-green-600 hover:bg-green-700"
            />
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-6 bg-richblack-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Question Navigation</h3>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {quizData.questions.map((_, index) => {
            const isAnswered = (() => {
              const question = quizData.questions[index]
              const answer = quizAnswers[question._id]
              
              if (question.questionType === 'codeSolve') {
                return answer && answer.code && answer.code.trim() !== ''
              } else if (question.questionType === 'matchTheFollowing') {
                return question.options.every((_, optionIndex) => {
                  const matchAnswer = quizAnswers[`${question._id}_${optionIndex}`]
                  return matchAnswer !== undefined && matchAnswer !== null && matchAnswer !== ''
                })
              } else if (question.questionType === 'multipleChoice') {
                const selectedOptions = quizAnswers[question._id] || []
                return Array.isArray(selectedOptions) && selectedOptions.length > 0
              } else if (question.questionType === 'singleAnswer') {
                const answerNum = Number(answer)
                return !isNaN(answerNum) || answer === 0
              } else {
                return answer && (typeof answer !== 'string' || answer.trim() !== '')
              }
            })()

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                  currentQuestion === index
                    ? 'bg-yellow-50 text-richblack-900'
                    : isAnswered
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-richblack-700 text-richblack-300 hover:bg-richblack-600'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-50 rounded"></div>
            <span className="text-richblack-300">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-richblack-300">Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-richblack-700 rounded"></div>
            <span className="text-richblack-300">Not Answered</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizView
