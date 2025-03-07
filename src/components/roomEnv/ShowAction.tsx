import { Question } from '@/types/api'
import { useState } from 'react'
import Meeting from '../Meeting'

interface ShowActionProps {
  actionType: string
  userId: string
  questions: Question[]
  members: string[]
}

const ShowAction = ({
  actionType,
  userId,
  questions,
  members,
}: ShowActionProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [testCompleted, setTestCompleted] = useState(false)

  if (actionType === 'CALL') {
    return <Meeting members={members} userId={userId} />
  }

  if (actionType === 'TEST') {
    const currentQuestion = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === (questions.length ?? 0) - 1

    const handleAnswerSubmit = () => {
      if (!currentQuestion || !selectedAnswer) return

      const newAnswers = {
        ...userAnswers,
        [currentQuestion.id]: selectedAnswer,
      }
      setUserAnswers(newAnswers)

      if (isLastQuestion) {
        setTestCompleted(true)
      } else {
        setCurrentQuestionIndex((prev) => prev + 1)
        setSelectedAnswer('')
      }
    }

    if (testCompleted) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Test Submitted!</h3>
            <p className="text-gray-600">
              Thank you for completing the test. Your responses have been
              recorded.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Test Session</h3>
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        {currentQuestion && (
          <div>
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-4">{currentQuestion.content}</h4>
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedAnswer === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="hidden"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
                className={`px-6 py-2 rounded-lg font-medium ${
                  selectedAnswer
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLastQuestion ? 'Submit Test' : 'Next Question'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default ShowAction
