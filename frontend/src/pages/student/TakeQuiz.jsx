import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import LoadingState from '../../components/LoadingState'
import { STUDENT_BASE_PATH } from '../../constants/studentDashboard'
import { useStudentQuizDetail } from '../../hooks/useStudentData'
import studentApi from '../../services/student'

export default function TakeQuiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const { quiz, loading, error } = useStudentQuizDetail(quizId)
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!quiz) return
    setSecondsLeft(quiz.duration * 60)
  }, [quiz])

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  useEffect(() => {
    if (secondsLeft === 0 && quiz && !submitting) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  function setAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(event) {
    if (event) event.preventDefault()
    if (!quiz || submitting) return

    setSubmitting(true)
    setErrorMessage('')

    const timeTaken = quiz.duration * 60 - (secondsLeft ?? 0)

    try {
      await studentApi.submitQuiz(quizId, {
        answers: quiz.questions.map((q) => ({
          question_id: q.id,
          answer: answers[q.id] || '',
        })),
        time_taken_seconds: timeTaken,
      })
      navigate(`${STUDENT_BASE_PATH}/quizzes/${quizId}/result`)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit quiz')
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState message="Loading quiz..." />

  if (error || !quiz) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Quiz not available'}
        </div>
        <Link to={`${STUDENT_BASE_PATH}/quizzes`} className="text-sm font-medium text-primary-600">
          ← Back to Quizzes
        </Link>
      </div>
    )
  }

  const minutes = Math.floor((secondsLeft ?? 0) / 60)
  const seconds = (secondsLeft ?? 0) % 60

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{quiz.course_title}</p>
        </div>
        <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Time left: {minutes}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {quiz.questions.map((question, index) => (
          <section key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-medium text-slate-900">
              {index + 1}. {question.question_text}{' '}
              <span className="text-sm font-normal text-slate-500">({question.marks} marks)</span>
            </p>

            {question.question_type === 'mcq' && (
              <div className="mt-4 space-y-2">
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={opt}
                      checked={answers[question.id] === opt}
                      onChange={() => setAnswer(question.id, opt)}
                    />
                    <span className="font-medium uppercase">{opt}.</span>
                    <span>{question[`option_${opt}`]}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'true_false' && (
              <div className="mt-4 flex gap-6 text-sm">
                {['true', 'false'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={opt}
                      checked={answers[question.id] === opt}
                      onChange={() => setAnswer(question.id, opt)}
                    />
                    {opt === 'true' ? 'True' : 'False'}
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'short_answer' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Your answer"
              />
            )}
          </section>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </form>
    </div>
  )
}
