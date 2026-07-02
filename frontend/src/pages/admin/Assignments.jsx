import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert'
import CourseSearchBar from '../../components/CourseSearchBar'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { ADMIN_BASE_PATH } from '../../constants/adminDashboard'
import { useAdminAssignments } from '../../hooks/useAdminData'
import adminApi from '../../services/admin'
import { formatDate } from '../../utils/assignmentStatus'

export default function Assignments() {
  const [search, setSearch] = useState('')
  const { assignments, loading, error, refetch } = useAdminAssignments({ search })
  const [pendingId, setPendingId] = useState(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDelete(assignment) {
    const confirmed = window.confirm(
      `Delete "${assignment.title}"? This will also remove student submissions. This action cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setPendingId(assignment.id)
    setMessage('')
    setErrorMessage('')
    try {
      const response = await adminApi.deleteAssignment(assignment.id)
      setMessage(response.message || 'Assignment deleted successfully')
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete assignment')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
        <p className="mt-1 text-sm text-slate-600">
          {assignments.length} assignment{assignments.length === 1 ? '' : 's'} in the system
        </p>
      </div>

      <Alert type="success" message={message} onDismiss={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <CourseSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by title, description, or course..."
      />

      {loading ? (
        <LoadingState message="Loading assignments..." />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          message={
            search ? 'No assignments match your search.' : 'No assignments have been created yet.'
          }
        />
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900">{assignment.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {assignment.course_code} · {assignment.course_title}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Due {formatDate(assignment.due_date)} · {assignment.max_points} marks ·{' '}
                  {assignment.submission_count} submission
                  {assignment.submission_count === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`${ADMIN_BASE_PATH}/assignments/${assignment.id}/edit`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(assignment)}
                  disabled={pendingId === assignment.id}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingId === assignment.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
