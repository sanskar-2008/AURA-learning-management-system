import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { STUDENT_BASE_PATH } from '../../constants/studentDashboard'
import { useStudentQuizzes } from '../../hooks/useStudentData'
import { quizStatusClass, quizStatusLabel } from '../../utils/quiz'

export default function Quizzes() {
  const { quizzes, loading, error } = useStudentQuizzes()

  if (loading) return <LoadingState message="Loading quizzes..." />

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Quizzes & Tests</h1>
        <p className="mt-1 text-sm text-slate-600">Attempt available quizzes for your enrolled courses.</p>
      </header>

      {quizzes.length === 0 ? (
        <EmptyState title="No quizzes available" message="Your teachers have not published any quizzes yet." />
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <article
              key={quiz.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${quizStatusClass(quiz.status)}`}>
                    {quizStatusLabel(quiz.status)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {quiz.course_title} · {quiz.question_count} questions · {quiz.duration} min · {quiz.total_marks} marks
                </p>
                {quiz.has_attempted && (
                  <p className="mt-1 text-xs text-green-700">Already attempted</p>
                )}
              </div>
              <div className="flex gap-2">
                {quiz.can_attempt && (
                  <Link
                    to={`${STUDENT_BASE_PATH}/quizzes/${quiz.id}/attempt`}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    {quiz.has_attempted ? 'Retake Quiz' : 'Start Quiz'}
                  </Link>
                )}
                {quiz.has_attempted && (
                  <Link
                    to={`${STUDENT_BASE_PATH}/quizzes/${quiz.id}/result`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    View Result
                  </Link>
                )}
                {!quiz.can_attempt && !quiz.has_attempted && (
                  <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-500">Not available</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
