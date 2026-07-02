import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { useStudentGrades } from '../../hooks/useStudentData'

export default function Grades() {
  const { grades, loading, error } = useStudentGrades()

  if (loading) {
    return <LoadingState message="Loading your marks and grades..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">My Marks & Grades</h1>
        <p className="mt-1 text-sm text-slate-600">
          View marks, grades, and teacher remarks for your evaluations.
        </p>
      </header>

      {grades.length === 0 ? (
        <EmptyState
          title="No marks available yet"
          message="Your teacher has not entered any marks for you yet."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Evaluation</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Marks</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Grade</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Remarks</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date Evaluated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grades.map((grade) => (
                <tr key={grade.id}>
                  <td className="px-4 py-3 text-slate-900">
                    <div>{grade.course_title}</div>
                    <div className="text-xs text-slate-500">{grade.course_code}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{grade.evaluation_name}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {grade.marks_obtained}/{grade.maximum_marks} ({grade.percentage}%)
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{grade.grade}</td>
                  <td className="px-4 py-3 text-slate-600">{grade.remarks || '—'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {grade.evaluated_at ? new Date(grade.evaluated_at).toLocaleDateString() : '—'}
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
