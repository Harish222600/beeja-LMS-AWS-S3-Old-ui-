import { useState } from "react"
import { RiAddLine, RiDeleteBin6Line } from "react-icons/ri"
import IconBtn from "../../../../common/IconBtn"

export default function QuizForm({ register, setValue, getValues, errors, watch }) {
  const [questions, setQuestions] = useState([{
    questionText: "",
    questionType: "multipleChoice",
    options: ["", "", "", ""],
    matchOptions: [],  // For match the following questions
    marks: 5,
    required: true
  }])

  const addQuestion = () => {
    if (questions.length < 25) {
      setQuestions([...questions, {
        questionText: "",
        questionType: "multipleChoice",
        options: ["", "", "", ""],
        matchOptions: [],  // For match the following questions
        marks: 5,
        required: true
      }])
    }
  }

  const handleMatchOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions]
    if (!newQuestions[questionIndex].matchOptions) {
      newQuestions[questionIndex].matchOptions = ["", "", "", ""]
    }
    newQuestions[questionIndex].matchOptions[optionIndex] = value
    setQuestions(newQuestions)
    setValue("questions", newQuestions)
  }

  const removeQuestion = (index) => {
    if (questions.length > 15) {
      const newQuestions = [...questions]
      newQuestions.splice(index, 1)
      setQuestions(newQuestions)
      setValue("questions", newQuestions)
    }
  }

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions]
    newQuestions[index][field] = value
    setQuestions(newQuestions)
    setValue("questions", newQuestions)
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = value
    setQuestions(newQuestions)
    setValue("questions", newQuestions)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-richblack-5">Quiz Questions</p>
        <IconBtn 
          text="Add Question"
          onclick={addQuestion}
          disabled={questions.length >= 25}
        >
          <RiAddLine />
        </IconBtn>
      </div>
      
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="space-y-4 border border-richblack-700 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-richblack-5">Question {qIndex + 1}</p>
            {questions.length > 15 && (
              <button
                onClick={() => removeQuestion(qIndex)}
                className="text-pink-200 hover:text-pink-300"
              >
                <RiDeleteBin6Line />
              </button>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <input
              type="text"
              value={question.questionText}
              onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
              placeholder="Enter question text"
              className="form-style w-full"
            />

            <div className="flex flex-col space-y-2">
              <select
                value={question.questionType}
                onChange={(e) => {
                  const newType = e.target.value;
                  const newQuestion = { ...questions[qIndex] };
                  newQuestion.questionType = newType;
                  
                  // Reset options based on question type
                  if (newType === 'matchTheFollowing') {
                    newQuestion.options = ['', '', '', ''] // Left side items
                    newQuestion.matchOptions = ['', '', '', ''] // Right side items
                  } else if (newType === 'multipleChoice' || newType === 'singleAnswer') {
                    newQuestion.options = ['', '', '', '']
                    delete newQuestion.matchOptions
                  } else {
                    newQuestion.options = []
                    delete newQuestion.matchOptions
                  }
                  
                  const newQuestions = [...questions];
                  newQuestions[qIndex] = newQuestion;
                  setQuestions(newQuestions);
                  setValue("questions", newQuestions);
                }}
                className="form-style w-full"
              >
                <option value="multipleChoice">Multiple Choice</option>
                <option value="singleAnswer">Single Answer</option>
                <option value="shortAnswer">Short Answer</option>
                <option value="longAnswer">Long Answer</option>
                <option value="matchTheFollowing">Match the Following</option>
              </select>

              {/* Multiple Choice or Single Answer Questions */}
              {(question.questionType === "multipleChoice" || question.questionType === "singleAnswer") && (
                <div className="space-y-2">
                  <p className="text-sm text-richblack-300">Enter options:</p>
                  {question.options.map((option, oIndex) => (
                    <input
                      key={oIndex}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className="form-style w-full"
                    />
                  ))}
                </div>
              )}

              {/* Match the Following Questions */}
              {question.questionType === "matchTheFollowing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-richblack-300">Left side items:</p>
                      {question.options.map((option, oIndex) => (
                        <input
                          key={oIndex}
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Item ${oIndex + 1}`}
                          className="form-style w-full"
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-richblack-300">Right side items:</p>
                      {question.matchOptions?.map((option, oIndex) => (
                        <input
                          key={oIndex}
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newQuestions = [...questions]
                            newQuestions[qIndex].matchOptions[oIndex] = e.target.value
                            setQuestions(newQuestions)
                            setValue("questions", newQuestions)
                          }}
                          placeholder={`Match ${String.fromCharCode(65 + oIndex)}`}
                          className="form-style w-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Short Answer Questions */}
              {question.questionType === "shortAnswer" && (
                <div className="space-y-2">
                  <p className="text-sm text-richblack-300">
                    Students will be able to enter a short text answer (max 200 characters)
                  </p>
                </div>
              )}

              {/* Long Answer Questions */}
              {question.questionType === "longAnswer" && (
                <div className="space-y-2">
                  <p className="text-sm text-richblack-300">
                    Students will be able to enter a detailed answer (max 1000 characters)
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={question.marks}
                onChange={(e) => handleQuestionChange(qIndex, "marks", parseInt(e.target.value))}
                placeholder="Marks"
                min="1"
                className="form-style w-24"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) => handleQuestionChange(qIndex, "required", e.target.checked)}
                  className="form-checkbox"
                />
                <span className="text-sm text-richblack-5">Required</span>
              </label>
            </div>
          </div>
        </div>
      ))}

      {questions.length < 15 && (
        <p className="text-pink-200 text-sm">
          Add at least {15 - questions.length} more questions
        </p>
      )}
    </div>
  )
}
