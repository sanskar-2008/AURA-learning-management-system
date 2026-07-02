import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import StatCard from '../../components/StatCard'
import { useParentContext } from '../../context/ParentContext'
import { useChildGrades, useChildProgress } from '../../hooks/useParentData'

export default function Grades() {
  const { selectedChildId } = useParentContext()
  const { data: gradesData, loading: gradesLoading, error: gradesError } = useChildGrades(selectedChildId)
  const { data: progressData, loading: progressLoading, error: progressError } = useChildProgress(selectedChildId)

  const loading = gradesLoading || progressLoading
  const error = gradesError || progressError

  if (loading) {
    return <LoadingState message="Loading grades..." />
  }

  if (error || !gradesData) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Unable to load grades'}
      </div>
    )
  }

  const courseGrades = gradesData.course_grades ?? []
  const assignmentGrades = gradesData.assignment_grades ?? []
  const markRecords = gradesData.mark_records ?? []
  const progress = progressData?.progress

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Grades & Progress</h1>
        <p className="mt-1 text-sm text-slate-600">View your child&apos;s academic performance.</p>
      </header>

      {progress && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Progress Summary</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Enrolled Courses" value={progress.enrolled_courses ?? 0} icon="courses" accent="primary" />
            <StatCard
              label="Submitted Assignments"
              value={`${progress.submitted_assignments ?? 0}/${progress.total_assignments ?? 0}`}
              icon="assignments"
              accent="amber"
            />
            <StatCard
              label="Average Grade"
              value={progress.average_grade ?? '—'}
              icon="grades"
              accent="green"
            />
            <StatCard
              label="Attendance"
              value={`${progress.attendance_percentage ?? 0}%`}
              icon="attendance"
              accent="green"
            />
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Course Grades</h2>
        {courseGrades.length === 0 ? (
          <EmptyState title="No course grades" message="Final course grades are not available yet." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Final Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courseGrades.map((grade) => (
                  <tr key={grade.course_id}>
                    <td className="px-4 py-3 text-slate-900">{grade.course_title}</td>
                    <td className="px-4 py-3 text-slate-700">{grade.course_code}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{grade.final_grade || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Assignment Grades</h2>
        {assignmentGrades.length === 0 ? (
          <EmptyState title="No assignment grades" message="Graded assignments will appear here." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Assignment</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignmentGrades.map((grade) => (
                  <tr key={grade.assignment_id}>
                    <td className="px-4 py-3 text-slate-900">{grade.assignment_title}</td>
                    <td className="px-4 py-3 text-slate-700">{grade.course_title}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {grade.grade}/{grade.max_points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Teacher Marks & Grades</h2>
        {markRecords.length === 0 ? (
          <EmptyState title="No marks entered yet" message="Teacher-evaluated marks will appear here." />
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
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {markRecords.map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-4 py-3 text-slate-900">{grade.course_title}</td>
                    <td className="px-4 py-3 text-slate-700">{grade.evaluation_name}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {grade.marks_obtained}/{grade.maximum_marks}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{grade.grade}</td>
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
      </section>
    </div>
  )
}
