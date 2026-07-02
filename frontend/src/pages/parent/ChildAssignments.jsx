import AssignmentCard from '../../components/AssignmentCard'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { useParentContext } from '../../context/ParentContext'
import { useChildAssignments } from '../../hooks/useParentData'

export default function ChildAssignments() {
  const { selectedChildId } = useParentContext()
  const { data, loading, error } = useChildAssignments(selectedChildId)
  const assignments = data?.assignments ?? []

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
        title="No assignments"
        message="There are no assignments for your child's enrolled courses."
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Child Assignments</h1>
        <p className="mt-1 text-sm text-slate-600">
          {assignments.length} assignment{assignments.length === 1 ? '' : 's'}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((assignment) => (
          <AssignmentCard key={assignment.id} assignment={assignment} readOnly showSubmit={false} />
        ))}
      </div>
    </div>
  )
}
