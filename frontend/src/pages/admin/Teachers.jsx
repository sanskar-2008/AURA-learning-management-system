import { useState } from 'react'
import Alert from '../../components/Alert'
import CourseSearchBar from '../../components/CourseSearchBar'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import UserManagementTable from '../../components/UserManagementTable'
import { useAdminTeachers } from '../../hooks/useAdminData'
import adminApi from '../../services/admin'

export default function Teachers() {
  const [search, setSearch] = useState('')
  const { teachers, loading, error, refetch } = useAdminTeachers({ search })
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
        <h2 className="text-lg font-semibold text-slate-900">Teachers</h2>
        <p className="mt-1 text-sm text-slate-600">
          {teachers.length} teacher{teachers.length === 1 ? '' : 's'} registered
        </p>
      </div>

      <Alert type="success" message={message} onDismiss={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <CourseSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name, email, or teacher ID..."
      />

      {loading ? (
        <LoadingState message="Loading teachers..." />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : teachers.length === 0 ? (
        <EmptyState
          title="No teachers found"
          message={search ? 'No teachers match your search.' : 'No teachers have registered yet.'}
        />
      ) : (
        <UserManagementTable
          users={teachers}
          idLabel="Teacher ID"
          idKey="employee_id"
          onToggleStatus={handleToggleStatus}
          pendingId={pendingId}
        />
      )}
    </div>
  )
}
