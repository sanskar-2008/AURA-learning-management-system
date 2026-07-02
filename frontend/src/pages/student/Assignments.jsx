import AssignmentCard from '../../components/AssignmentCard'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { useStudentAssignments } from '../../hooks/useStudentData'

export default function Assignments() {
  const { assignments, loading, error } = useStudentAssignments()

  if (loading) {
    return <LoadingState message="Loading assignments..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <EmptyState
        title="No assignments available"
        message="You have no assignments from your enrolled courses yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
        <p className="mt-1 text-sm text-slate-600">
          {assignments.length} assignment{assignments.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} />
        ))}
      </div>
    </div>
  )
}
