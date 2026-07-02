import { useState } from 'react'
import Alert from '../../components/Alert'
import CourseSearchBar from '../../components/CourseSearchBar'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import UserManagementTable from '../../components/UserManagementTable'
import { useAdminStudents } from '../../hooks/useAdminData'
import adminApi from '../../services/admin'

export default function Students() {
  const [search, setSearch] = useState('')
  const { students, loading, error, refetch } = useAdminStudents({ search })
  const [pendingId, setPendingId] = useState(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleToggleStatus(user) {
    setPendingId(user.id)
    setMessage('')
    setErrorMessage('')
    try {
      const response = await adminApi.updateUserStatus(user.id, !user.is_active)
      setMessage(response.message || 'Account status updated')
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update account status')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Students</h2>
        <p className="mt-1 text-sm text-slate-600">
          {students.length} student{students.length === 1 ? '' : 's'} registered
        </p>
      </div>

      <Alert type="success" message={message} onDismiss={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <CourseSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, email, or roll number..."
      />

      {loading ? (
        <LoadingState message="Loading students..." />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          message={search ? 'No students match your search.' : 'No students have registered yet.'}
        />
      ) : (
        <UserManagementTable
          users={students}
          idLabel="Roll Number"
          idKey="student_number"
          onToggleStatus={handleToggleStatus}
          pendingId={pendingId}
        />
      )}
    </div>
  )
}
