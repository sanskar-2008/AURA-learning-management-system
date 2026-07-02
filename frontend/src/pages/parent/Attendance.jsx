import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import StatCard from '../../components/StatCard'
import { useParentContext } from '../../context/ParentContext'
import { useChildAttendance } from '../../hooks/useParentData'
import { formatDate } from '../../utils/assignmentStatus'

function statusBadgeClass(status) {
  switch (status) {
    case 'present':
      return 'bg-green-50 text-green-700'
    case 'late':
      return 'bg-amber-50 text-amber-700'
    case 'excused':
      return 'bg-blue-50 text-blue-700'
    default:
      return 'bg-red-50 text-red-700'
  }
}

export default function Attendance() {
  const { selectedChildId } = useParentContext()
  const { data, loading, error } = useChildAttendance(selectedChildId)

  if (loading) {
    return <LoadingState message="Loading attendance..." />
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Unable to load attendance'}
      </div>
    )
  }

  const records = data.records ?? []

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="mt-1 text-sm text-slate-600">Your child&apos;s attendance records.</p>
      </header>

      <StatCard
        label="Attendance Percentage"
        value={`${data.attendance_percentage ?? 0}%`}
        icon="attendance"
        accent="green"
      />

      {records.length === 0 ? (
        <EmptyState
          title="No attendance records"
          message="No attendance has been recorded for your child yet."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-slate-900">{formatDate(record.date)}</td>
                  <td className="px-4 py-3 text-slate-700">{record.course_title || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeClass(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{record.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
