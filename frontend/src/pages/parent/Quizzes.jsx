import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { useParentContext } from '../../context/ParentContext'
import { useChildQuizResults } from '../../hooks/useParentData'

export default function ParentQuizzes() {
  const { selectedChildId } = useParentContext()
  const { results, loading, error } = useChildQuizResults(selectedChildId)

  if (loading) return <LoadingState message="Loading quiz results..." />

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Quiz Results</h1>
        <p className="mt-1 text-sm text-slate-600">View your child&apos;s quiz scores and results.</p>
      </header>

      {results.length === 0 ? (
        <EmptyState title="No quiz results" message="Your child has not attempted any quizzes yet." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Quiz</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Score</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Percentage</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Result</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="px-4 py-3 text-slate-900">{result.quiz_title}</td>
                  <td className="px-4 py-3 text-slate-700">{result.course_title}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {result.score}/{result.total_marks}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{result.percentage}%</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {result.passed ? 'Pass' : 'Fail'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {result.submitted_at ? new Date(result.submitted_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
