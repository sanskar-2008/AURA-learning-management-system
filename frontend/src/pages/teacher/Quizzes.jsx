import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherQuizzes } from '../../hooks/useTeacherData'
import { quizStatusClass, quizStatusLabel } from '../../utils/quiz'
import teacherApi from '../../services/teacher'
import { useState } from 'react'
import Alert from '../../components/Alert'

export default function Quizzes() {
  const { quizzes, loading, error, refetch } = useTeacherQuizzes()
  const [pendingId, setPendingId] = useState(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDelete(quiz) {
    if (!window.confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return
    setPendingId(quiz.id)
    setMessage('')
    setErrorMessage('')
    try {
      const response = await teacherApi.deleteQuiz(quiz.id)
      setMessage(response.message || 'Quiz deleted successfully')
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete quiz')
    } finally {
      setPendingId(null)
    }
  }

  if (loading) return <LoadingState message="Loading quizzes..." />

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quizzes & Tests</h1>
          <p className="mt-1 text-sm text-slate-600">Create and manage online quizzes for your courses.</p>
        </div>
        <Link
          to={`${TEACHER_BASE_PATH}/quizzes/create`}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Create Quiz
        </Link>
      </div>

      <Alert type="success" message={message} onDismiss={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      {quizzes.length === 0 ? (
        <EmptyState title="No quizzes yet" message="Create your first quiz to get started." />
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <article
              key={quiz.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${quizStatusClass(quiz.status)}`}>
                    {quizStatusLabel(quiz.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {quiz.course_code} · {quiz.question_count} questions · {quiz.total_marks} marks · {quiz.duration} min
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(quiz.start_time).toLocaleString()} — {new Date(quiz.end_time).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  to={`${TEACHER_BASE_PATH}/quizzes/${quiz.id}/results`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Results
                </Link>
                <Link
                  to={`${TEACHER_BASE_PATH}/quizzes/${quiz.id}/edit`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(quiz)}
                  disabled={pendingId === quiz.id}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                >
                  {pendingId === quiz.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
