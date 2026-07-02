import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import StatCard from '../../components/StatCard'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherQuizResults } from '../../hooks/useTeacherData'

export default function QuizResults() {
  const { quizId } = useParams()
  const { data, loading, error } = useTeacherQuizResults(quizId)

  if (loading) return <LoadingState message="Loading quiz results..." />

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Quiz not found'}
      </div>
    )
  }

  const { quiz, attempts, summary } = data

  return (
    <div className="space-y-8">
      <Link to={`${TEACHER_BASE_PATH}/quizzes`} className="text-sm font-medium text-primary-600">
        ← Back to Quizzes
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {quiz.course_code} · {quiz.question_count} questions · {quiz.total_marks} total marks
          </p>
        </div>
        <Link
          to={`${TEACHER_BASE_PATH}/courses/${quiz.course_id}/grades`}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View in Gradebook
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Attempts" value={summary.total_attempts} icon="assignments" accent="primary" />
        <StatCard label="Average Score" value={summary.average_score} icon="grades" accent="amber" />
        <StatCard label="Passed" value={summary.pass_count} icon="grades" accent="green" />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Student Scores</h2>
        <p className="mb-4 text-sm text-slate-600">
          Quiz marks are automatically added to Marks &amp; Grades when students submit.
        </p>
        {attempts.length === 0 ? (
          <EmptyState title="No attempts yet" message="Students have not submitted this quiz yet." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Percentage</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Result</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Time Taken</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td className="px-4 py-3 text-slate-900">
                      <div>{attempt.student_name}</div>
                      <div className="text-xs text-slate-500">{attempt.student_number}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {attempt.score}/{attempt.total_marks}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{attempt.percentage}%</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {attempt.passed ? 'Pass' : 'Fail'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {attempt.time_taken_seconds != null
                        ? `${Math.floor(attempt.time_taken_seconds / 60)}m ${attempt.time_taken_seconds % 60}s`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
