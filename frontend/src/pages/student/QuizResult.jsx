import { Link, useParams } from 'react-router-dom'
import LoadingState from '../../components/LoadingState'
import { STUDENT_BASE_PATH } from '../../constants/studentDashboard'
import { useStudentQuizResult } from '../../hooks/useStudentData'

export default function QuizResult() {
  const { quizId } = useParams()
  const { data, loading, error } = useStudentQuizResult(quizId)

  if (loading) return <LoadingState message="Loading quiz result..." />

  if (error || !data) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Result not found'}
        </div>
        <Link to={`${STUDENT_BASE_PATH}/quizzes`} className="text-sm font-medium text-primary-600">
          ← Back to Quizzes
        </Link>
      </div>
    )
  }

  const { quiz, attempt } = data

  return (
    <div className="space-y-6">
      <Link to={`${STUDENT_BASE_PATH}/quizzes`} className="text-sm font-medium text-primary-600">
        ← Back to Quizzes
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
        <p className="mt-1 text-sm text-slate-600">Quiz submitted successfully</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Score</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {attempt.score}/{attempt.total_marks}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Percentage</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{attempt.percentage}%</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Result</p>
            <p className={`mt-1 text-2xl font-bold ${attempt.passed ? 'text-green-700' : 'text-red-700'}`}>
              {attempt.passed ? 'Pass' : 'Fail'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs uppercase text-slate-500">Time Taken</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {attempt.time_taken_seconds != null
                ? `${Math.floor(attempt.time_taken_seconds / 60)}m ${attempt.time_taken_seconds % 60}s`
                : '—'}
            </p>
          </div>
        </div>

        {attempt.answers && attempt.answers.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Answer Review</h2>
            {attempt.answers.map((answer, index) => (
              <div key={answer.question_id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-medium text-slate-900">
                  {index + 1}. {answer.question_text}
                </p>
                <p className="mt-2 text-sm text-slate-600">Your answer: {answer.answer_text || '—'}</p>
                <p className="mt-1 text-sm text-slate-600">Correct answer: {answer.correct_answer}</p>
                <p className={`mt-2 text-sm font-medium ${answer.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                  {answer.is_correct ? 'Correct' : 'Incorrect'} · {answer.marks_awarded} marks
                </p>
              </div>
            ))}
          </div>
        )}

        {!quiz.show_results_after_submit && (
          <p className="mt-6 text-sm text-slate-600">
            Detailed answers are hidden for this quiz. Your score has been recorded.
          </p>
        )}
      </section>
    </div>
  )
}
