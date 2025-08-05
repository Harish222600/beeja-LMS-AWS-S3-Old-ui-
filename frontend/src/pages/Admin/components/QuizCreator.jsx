import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { RiAddLine, RiDeleteBin6Line } from "react-icons/ri"
import { createQuiz, updateQuiz } from "../../../services/operations/quizAPI"

export default function QuizCreator({ subSectionId, existingQuiz, onClose, onSuccess }) {
  const { token } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)
  const [timeLimit, setTimeLimit] = useState(10) // Default 10 minutes
  const [questions, setQuestions] = useState([
    {
        questionText: "",
        questionType: "multipleChoice",
        options: ["", "", "", ""],
        answers: ["", "", "", ""], // For match the following
        correctAnswers: [], // For multiple choice (array of indices)
        correctAnswer: null, // For single answer (single index)
        keywords: [], // For short answer questions
        marks: 5,
        required: true
    }
  ])

  // Refs for question containers to scroll to on validation error
  const questionRefs = useRef([])
  
  // State to track validation errors for visual indicators
  const [validationErrors, setValidationErrors] = useState({})

  // Initialize with existing quiz data if editing
  useEffect(() => {
    if (existingQuiz) {
      if (existingQuiz.questions) {
        const processedQuestions = existingQuiz.questions.map(q => {
          let baseQuestion = {
            questionText: q.questionText || "",
            questionType: q.questionType || "multipleChoice",
            options: [],
            answers: [], // For match the following
            correctAnswers: q.correctAnswers || [],
            correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : null,
            keywords: Array.isArray(q.keywords) ? [...q.keywords] : [], // Deep copy keywords array
            marks: q.marks || 5,
            required: q.required !== undefined ? q.required : true
          };

          // Ensure keywords are properly initialized for short answer questions
          if (q.questionType === "shortAnswer" && !baseQuestion.keywords.length && q.keywords) {
            baseQuestion.keywords = Array.isArray(q.keywords) ? [...q.keywords] : [];
          }

          // Special handling for match the following questions
          if (q.questionType === "matchTheFollowing") {
            // Ensure both options and answers arrays exist and have proper length
            const maxLength = Math.max(
              (q.options || []).length,
              (q.answers || []).length,
              4 // minimum length
            );
            baseQuestion.options = Array(maxLength).fill("").map((_, i) => q.options?.[i] || "");
            baseQuestion.answers = Array(maxLength).fill("").map((_, i) => q.answers?.[i] || "");
          } else {
            // For other question types
            baseQuestion.options = q.options || ["", "", "", ""];
            baseQuestion.answers = q.answers || [];
          }

          // Add code solving specific fields if it's a code solving question
          if (q.questionType === "codeSolve") {
            baseQuestion.programmingLanguage = q.programmingLanguage || 'javascript';
            baseQuestion.starterCode = q.starterCode || '// Write your code here\n';
            baseQuestion.testCases = q.testCases || [{
              input: '',
              expectedOutput: '',
              isHidden: false
            }];
          }

          return baseQuestion;
        });
        
        setQuestions(processedQuestions);
      }
      if (existingQuiz.timeLimit) {
        setTimeLimit(Math.floor(existingQuiz.timeLimit / 60)); // Convert seconds to minutes
      }
    }
  }, [existingQuiz])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  // Add more questions (up to 25)
  const addQuestion = () => {
    if (questions.length < 25) {
      setQuestions([...questions, {
        questionText: "",
        questionType: "multipleChoice",
        options: ["", "", "", ""],
        answers: ["", "", "", ""], // For match the following
        correctAnswers: [],
        correctAnswer: null,
        keywords: [], // For short answer questions
        marks: 5,
        required: true
      }])
    }
  }

  // Remove question (minimum 15)
  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
    }
  }

  // Handle question changes
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
  }

  // Handle option changes
  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
  }

  // Submit quiz
  const onSubmit = async () => {
    // Clear previous validation errors
    setValidationErrors({});
    
    // Validate questions
    const invalidQuestions = [];
    const validationErrorsList = [];
    const newValidationErrors = {};

    questions.forEach((q, index) => {
      const questionErrors = [];
      
      if (!q.questionText.trim()) {
        invalidQuestions.push(index);
        validationErrorsList.push(`Question ${index + 1}: Question text is required`);
        questionErrors.push('questionText');
      }
      
      if (q.questionType === "shortAnswer") {
        // For short answer, check if keywords are provided
        if (!q.keywords || q.keywords.length === 0) {
          invalidQuestions.push(index);
          validationErrorsList.push(`Question ${index + 1}: At least one keyword is required`);
          questionErrors.push('keywords');
        }
      } else if (q.questionType === "matchTheFollowing") {
        if (q.options.some(opt => !opt.trim()) || 
            !q.answers || 
            q.answers.some(ans => !ans || !ans.trim())) {
          invalidQuestions.push(index);
          validationErrorsList.push(`Question ${index + 1}: All match options and answers are required`);
          questionErrors.push('options');
        }
      } else if (q.questionType === "codeSolve") {
        // Validate code solving questions
        if (!q.programmingLanguage) {
          invalidQuestions.push(index);
          validationErrorsList.push(`Question ${index + 1}: Programming language is required`);
          questionErrors.push('programmingLanguage');
        }
        if (!q.testCases || !Array.isArray(q.testCases) || q.testCases.length === 0) {
          invalidQuestions.push(index);
          validationErrorsList.push(`Question ${index + 1}: At least one test case is required`);
          questionErrors.push('testCases');
        } else {
          // Check if all test cases have expected output
          const invalidTestCase = q.testCases.findIndex(testCase => 
            !testCase.expectedOutput || testCase.expectedOutput.trim() === ''
          );
          if (invalidTestCase !== -1) {
            invalidQuestions.push(index);
            validationErrorsList.push(`Question ${index + 1}: Test case ${invalidTestCase + 1} expected output is required`);
            questionErrors.push('testCases');
          }
        }
      } else if (q.questionType === "multipleChoice" || q.questionType === "singleAnswer") {
        // Validate options are filled
        if (q.options.some(opt => !opt.trim())) {
          invalidQuestions.push(index);
          validationErrorsList.push(`Question ${index + 1}: All options are required`);
          questionErrors.push('options');
        }
        
        // Validate correct answers are selected (checkboxes/radio buttons)
        if (q.questionType === "multipleChoice") {
          if (!q.correctAnswers || q.correctAnswers.length === 0) {
            invalidQuestions.push(index);
            validationErrorsList.push(`Question ${index + 1}: Please select at least one correct answer`);
            questionErrors.push('correctAnswers');
          }
        } else if (q.questionType === "singleAnswer") {
          if (q.correctAnswer === null || q.correctAnswer === undefined) {
            invalidQuestions.push(index);
            validationErrorsList.push(`Question ${index + 1}: Please select the correct answer`);
            questionErrors.push('correctAnswer');
          }
        }
      }
      
      if (questionErrors.length > 0) {
        newValidationErrors[index] = questionErrors;
      }
    });

    // Set validation errors for visual indicators
    setValidationErrors(newValidationErrors);

    if (invalidQuestions.length > 0) {
      toast.error(validationErrorsList[0]); // Show the first validation error
      // Scroll to the first invalid question
      if (questionRefs.current[invalidQuestions[0]]) {
        questionRefs.current[invalidQuestions[0]].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true)
    try {
      // Clean up questions data
      const cleanedQuestions = questions.map(q => {
        const base = {
          questionText: q.questionText.trim(),
          questionType: q.questionType,
          marks: q.marks,
          required: q.required
        }

        if (q.questionType === "shortAnswer") {
          return { 
            ...base, 
            options: [],
            keywords: q.keywords || []
          }
        }

        if (q.questionType === "codeSolve") {
          return {
            ...base,
            programmingLanguage: q.programmingLanguage || 'javascript',
            starterCode: q.starterCode || '',
            testCases: q.testCases || [],
            options: [] // Code solving questions don't have options
          }
        }

        if (q.questionType === "matchTheFollowing") {
          return {
            ...base,
            options: q.options.map(opt => opt.trim()),
            answers: q.answers.map(ans => ans.trim()),
            // For match the following, each index maps to its corresponding answer
            correctAnswers: q.options.map((_, index) => index)
          }
        }

        return {
          ...base,
          options: q.options.map(opt => opt.trim()),
          correctAnswers: q.questionType === "multipleChoice" ? (q.correctAnswers || []) : [],
          correctAnswer: q.questionType === "singleAnswer" ? q.correctAnswer : null
        }
      })

      const quizData = {
        subSectionId,
        questions: cleanedQuestions,
        timeLimit: timeLimit * 60 // Convert minutes to seconds
      }
      
      console.log("Submitting quiz data:", quizData)
      
      let result;
      if (existingQuiz) {
        result = await updateQuiz(existingQuiz._id, quizData, token)
      } else {
        result = await createQuiz(quizData, token)
      }

      if (result) {
        console.log("Quiz operation successful:", result)
        onSuccess && onSuccess(result)
        onClose()
      } else {
        throw new Error("No result returned from quiz operation")
      }
    } catch (error) {
      console.error(`Error ${existingQuiz ? 'updating' : 'creating'} quiz:`, error)
      toast.error(error.message || `Failed to ${existingQuiz ? 'update' : 'create'} quiz`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Timer Settings */}
      <div className="bg-richblack-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-richblack-5 mb-4">Quiz Timer Settings</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-richblack-300 mb-2 block">Time Limit (minutes)</label>
            <div className="relative">
              <input
                type="number"
                value={timeLimit}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 1 && value <= 180) {
                      setTimeLimit(value);
                    }
                  }}
                  min="1"
                max="180"
                className="w-full bg-richblack-800 text-richblack-5 rounded-lg p-3 border border-richblack-600 focus:border-yellow-50 focus:outline-none transition-colors"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-50" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
              <p className="text-xs text-richblack-300 mt-1">Set between 1-180 minutes (default: 10 minutes)</p>
          </div>
        </div>
      </div>

      {/* Questions Header */}
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-richblack-5">
          Quiz Questions ({questions.length}/25)
        </p>
        <button
          onClick={addQuestion}
          disabled={questions.length >= 25}
          className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-3 py-2 rounded-lg hover:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RiAddLine />
          Add Question
        </button>
      </div>


      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        {questions.map((question, qIndex) => (
          <div 
            key={qIndex} 
            ref={el => questionRefs.current[qIndex] = el}
            className={`space-y-4 border p-4 rounded-lg transition-colors ${
              validationErrors[qIndex] 
                ? 'border-red-500 bg-red-900/10' 
                : 'border-richblack-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="text-sm text-richblack-5 font-medium">Question {qIndex + 1}</p>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-pink-300 hover:text-pink-200 p-1"
                >
                  <RiDeleteBin6Line />
                </button>
              )}
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <label className="text-sm text-richblack-5">Question Text *</label>
              <textarea
                value={question.questionText}
                onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                placeholder="Enter your question here..."
                className={`w-full bg-richblack-700 text-richblack-5 rounded-lg p-3 min-h-[80px] resize-none border transition-colors ${
                  validationErrors[qIndex]?.includes('questionText')
                    ? 'border-red-500 focus:border-red-400'
                    : 'border-richblack-600 focus:border-yellow-50'
                }`}
                required
              />
              {validationErrors[qIndex]?.includes('questionText') && (
                <span className="text-red-400 text-xs">Question text is required</span>
              )}
            </div>

            {/* Question Type */}
            <div className="space-y-2">
              <label className="text-sm text-richblack-5">Question Type</label>
              <select
                value={question.questionType}
                onChange={(e) => {
                  const newType = e.target.value;
                  const newQuestion = {
                    ...questions[qIndex],
                    questionType: newType
                  };
                  
                  // Initialize code solving specific fields
                  if (newType === 'codeSolve') {
                    newQuestion.programmingLanguage = 'javascript';
                    newQuestion.starterCode = '// Write your code here\n';
                    newQuestion.testCases = [{
                      input: '',
                      expectedOutput: '',
                      isHidden: false
                    }];
                  }
                  
                  // Initialize match the following with 3 pairs
                  if (newType === 'matchTheFollowing') {
                    newQuestion.options = Array(3).fill('');
                    newQuestion.answers = Array(3).fill('');
                  }
                  
                  // Preserve existing data when changing back to matchTheFollowing
                  if (newType === 'matchTheFollowing' && questions[qIndex].questionType === 'matchTheFollowing') {
                    newQuestion.options = questions[qIndex].options || Array(3).fill('');
                    newQuestion.answers = questions[qIndex].answers || Array(3).fill('');
                  }
                  
                  // Preserve keywords when switching to/from shortAnswer
                  if (newType === 'shortAnswer') {
                    // Keep existing keywords if they exist
                    newQuestion.keywords = questions[qIndex].keywords || [];
                  } else if (questions[qIndex].questionType === 'shortAnswer') {
                    // Preserve keywords when switching away from shortAnswer (in case user switches back)
                    newQuestion.keywords = questions[qIndex].keywords || [];
                  }
                  
                  const newQuestions = [...questions];
                  newQuestions[qIndex] = newQuestion;
                  setQuestions(newQuestions);
                }}
                className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3"
              >
                <option value="multipleChoice">Multiple Choice</option>
                <option value="singleAnswer">Single Answer</option>
                <option value="shortAnswer">Short Answer</option>
                <option value="matchTheFollowing">Match the Following</option>
                <option value="codeSolve">Code Solving</option>
              </select>
            </div>

            {/* Code Solving Question Settings */}
            {question.questionType === "codeSolve" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-richblack-5">Programming Language</label>
                  <select
                    value={question.programmingLanguage || 'javascript'}
                    onChange={(e) => handleQuestionChange(qIndex, "programmingLanguage", e.target.value)}
                    className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="ruby">Ruby</option>
                    <option value="csharp">C#</option>
                    <option value="kotlin">Kotlin</option>
                    <option value="typescript">TypeScript</option>
                    <option value="sql">SQL</option>
                    <option value="open">Allow Any Language</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-richblack-5">Starter Code</label>
                  <textarea
                    value={question.starterCode || ''}
                    onChange={(e) => handleQuestionChange(qIndex, "starterCode", e.target.value)}
                    placeholder="// Provide starter code template"
                    className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3 min-h-[120px] font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-richblack-5">Test Cases</label>
                    <button
                      onClick={() => {
                        const newQuestions = [...questions];
                        if (!newQuestions[qIndex].testCases) {
                          newQuestions[qIndex].testCases = [];
                        }
                        newQuestions[qIndex].testCases.push({
                          input: '',
                          expectedOutput: '',
                          isHidden: false
                        });
                        setQuestions(newQuestions);
                      }}
                      className="text-sm text-yellow-50 hover:text-yellow-100"
                    >
                      + Add Test Case
                    </button>
                  </div>
                  <div className="space-y-3">
                    {(question.testCases || []).map((testCase, tIndex) => (
                      <div key={tIndex} className="p-3 bg-richblack-800 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-richblack-300">Test Case {tIndex + 1}</span>
                          {question.testCases.length > 1 && (
                            <button
                              onClick={() => {
                                const newQuestions = [...questions];
                                newQuestions[qIndex].testCases.splice(tIndex, 1);
                                setQuestions(newQuestions);
                              }}
                              className="text-pink-300 hover:text-pink-200"
                            >
                              <RiDeleteBin6Line />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs text-richblack-300">Input</label>
                            <textarea
                              value={testCase.input}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[qIndex].testCases[tIndex].input = e.target.value;
                                setQuestions(newQuestions);
                              }}
                              placeholder="Test case input"
                              className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-2 text-sm font-mono"
                              rows={3}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-richblack-300">Expected Output</label>
                            <textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                newQuestions[qIndex].testCases[tIndex].expectedOutput = e.target.value;
                                setQuestions(newQuestions);
                              }}
                              placeholder="Expected output"
                              className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-2 text-sm font-mono"
                              rows={3}
                              required
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-richblack-300">
                          <input
                            type="checkbox"
                            checked={testCase.isHidden}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[qIndex].testCases[tIndex].isHidden = e.target.checked;
                              setQuestions(newQuestions);
                            }}
                            className="rounded"
                          />
                          Hidden Test Case
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Options (for multiple choice, single answer, and match the following) */}
            {(question.questionType === "multipleChoice" || question.questionType === "singleAnswer" || question.questionType === "matchTheFollowing") && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-richblack-5">
                    {question.questionType === "matchTheFollowing" ? "Match the Following *" : "Options *"}
                  </label>
                  {question.questionType === "matchTheFollowing" && (
                    <>
                      <div className="mb-4">
                        <label className="text-sm text-richblack-5 mb-2 block">Number of Questions (3-7)</label>
                        <select
                          value={question.options?.length || 4}
                          onChange={(e) => {
                            const count = parseInt(e.target.value);
                            const newQuestions = [...questions];
                            // Create arrays of the selected size, preserving existing values
                            newQuestions[qIndex].options = Array(count).fill('').map((_, i) => 
                              question.options[i] || ''
                            );
                            newQuestions[qIndex].answers = Array(count).fill('').map((_, i) => 
                              question.answers?.[i] || ''
                            );
                            setQuestions(newQuestions);
                          }}
                          className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3"
                        >
                          {[3,4,5,6,7].map(num => (
                            <option key={num} value={num}>{num} Questions</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-richblack-300 mb-4">
                        Add questions on the left and their corresponding answers on the right
                      </p>
                    </>
                  )}
                </div>
                <div className="space-y-2">
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      {question.questionType === "matchTheFollowing" ? (
                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              placeholder={`Question ${oIndex + 1}`}
                              className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3 border border-richblack-600 focus:border-yellow-50 transition-colors"
                              required
                            />
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              value={question.answers?.[oIndex] || ''}
                              onChange={(e) => {
                                const newQuestions = [...questions];
                                // Initialize answers array if it doesn't exist
                                if (!newQuestions[qIndex].answers) {
                                  newQuestions[qIndex].answers = Array(newQuestions[qIndex].options.length).fill('');
                                }
                                // Ensure answers array is at least as long as options array
                                while (newQuestions[qIndex].answers.length < newQuestions[qIndex].options.length) {
                                  newQuestions[qIndex].answers.push('');
                                }
                                // Update the answer at the specific index
                                newQuestions[qIndex].answers[oIndex] = e.target.value;
                                setQuestions(newQuestions);
                              }}
                              placeholder={`Answer ${oIndex + 1}`}
                              className="w-full bg-richblack-700 text-richblack-5 rounded-lg p-3 border border-richblack-600 focus:border-yellow-50 transition-colors"
                              required
                            />
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className={`flex-1 bg-richblack-700 text-richblack-5 rounded-lg p-3 border transition-colors ${
                            validationErrors[qIndex]?.includes('options')
                              ? 'border-red-500 focus:border-red-400'
                              : 'border-richblack-600 focus:border-yellow-50'
                          }`}
                          required
                        />
                      )}
                      <label className="flex items-center gap-2 text-sm text-richblack-300">
                      {question.questionType !== "matchTheFollowing" && (
                        <div className={`flex items-center gap-2 ${
                          validationErrors[qIndex]?.includes('correctAnswers') || validationErrors[qIndex]?.includes('correctAnswer')
                            ? 'text-red-400'
                            : 'text-richblack-300'
                        }`}>
                          <input
                            type={question.questionType === "multipleChoice" ? "checkbox" : "radio"}
                            name={`correct-${qIndex}`}
                            checked={question.questionType === "multipleChoice" 
                              ? question.correctAnswers?.includes(oIndex)
                              : question.correctAnswer === oIndex}
                            onChange={() => {
                              const newQuestions = [...questions];
                              if (question.questionType === "multipleChoice") {
                                // Toggle the option in correctAnswers array
                                const currentAnswers = newQuestions[qIndex].correctAnswers || [];
                                if (currentAnswers.includes(oIndex)) {
                                  newQuestions[qIndex].correctAnswers = currentAnswers.filter(i => i !== oIndex);
                                } else {
                                  newQuestions[qIndex].correctAnswers = [...currentAnswers, oIndex];
                                }
                              } else {
                                // Set single correct answer
                                newQuestions[qIndex].correctAnswer = oIndex;
                              }
                              setQuestions(newQuestions);
                              
                              // Clear validation error when a correct answer is selected
                              if (validationErrors[qIndex]) {
                                const newValidationErrors = { ...validationErrors };
                                if (question.questionType === "multipleChoice") {
                                  newValidationErrors[qIndex] = newValidationErrors[qIndex].filter(err => err !== 'correctAnswers');
                                } else {
                                  newValidationErrors[qIndex] = newValidationErrors[qIndex].filter(err => err !== 'correctAnswer');
                                }
                                if (newValidationErrors[qIndex].length === 0) {
                                  delete newValidationErrors[qIndex];
                                }
                                setValidationErrors(newValidationErrors);
                              }
                            }}
                            className={`${
                              validationErrors[qIndex]?.includes('correctAnswers') || validationErrors[qIndex]?.includes('correctAnswer')
                                ? 'border-red-500 focus:border-red-400'
                                : 'text-yellow-50'
                            }`}
                          />
                          Correct Answer
                        </div>
                      )}
                      </label>
                      {(validationErrors[qIndex]?.includes('correctAnswers') || validationErrors[qIndex]?.includes('correctAnswer')) && (
                        <span className="text-red-400 text-xs block mt-1">Please select the correct answer</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Keywords for Short Answer Questions */}
            {question.questionType === "shortAnswer" && (
              <div className="space-y-2">
                <label className="text-sm text-richblack-5">Keywords *</label>
                <div className="space-y-2">
                  {/* Display existing keywords as tags */}
                  {question.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {question.keywords.map((keyword, keywordIndex) => (
                        <div
                          key={keywordIndex}
                          className="flex items-center gap-2 bg-yellow-50 text-richblack-900 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{keyword}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newKeywords = question.keywords.filter((_, index) => index !== keywordIndex);
                              handleQuestionChange(qIndex, "keywords", newKeywords);
                            }}
                            className="text-richblack-600 hover:text-richblack-900 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Input for adding new keywords */}
                  <input
                    type="text"
                    placeholder="Type a keyword and press Enter to add..."
                    className={`w-full bg-richblack-700 text-richblack-5 rounded-lg p-3 border transition-colors ${
                      validationErrors[qIndex]?.includes('keywords')
                        ? 'border-red-500 focus:border-red-400'
                        : 'border-richblack-600 focus:border-yellow-50'
                    }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const keyword = e.target.value.trim();
                        if (keyword && !question.keywords.includes(keyword)) {
                          const newKeywords = [...question.keywords, keyword];
                          handleQuestionChange(qIndex, "keywords", newKeywords);
                          e.target.value = '';
                          
                          // Clear validation error when keywords are added
                          if (validationErrors[qIndex]?.includes('keywords')) {
                            const newValidationErrors = { ...validationErrors };
                            newValidationErrors[qIndex] = newValidationErrors[qIndex].filter(err => err !== 'keywords');
                            if (newValidationErrors[qIndex].length === 0) {
                              delete newValidationErrors[qIndex];
                            }
                            setValidationErrors(newValidationErrors);
                          }
                        }
                      }
                    }}
                  />
                  {validationErrors[qIndex]?.includes('keywords') && (
                    <span className="text-red-400 text-xs">At least one keyword is required</span>
                  )}
                </div>
                <p className="text-xs text-richblack-300">
                  Type a keyword and press Enter to add it as a tag. Student must match at least 50% of these keywords for the answer to be correct.
                </p>
              </div>
            )}

            {/* Marks and Required */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-richblack-5">Marks:</label>
                <input
                  type="number"
                  value={question.marks}
                  onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                  className="w-20 bg-richblack-700 text-richblack-5 rounded-lg p-2"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-richblack-5">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => handleQuestionChange(qIndex, "required", e.target.checked)}
                  className="rounded"
                />
                Required
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t border-richblack-700">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-6 py-2 bg-richblack-700 text-richblack-50 rounded-lg hover:bg-richblack-600 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2 bg-yellow-50 text-richblack-900 rounded-lg hover:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading 
            ? (existingQuiz ? "Updating..." : "Creating...") 
            : (existingQuiz ? "Update Quiz" : "Create Quiz")
          }
        </button>
      </div>
    </div>
  )
}
