import { useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../../components/Alert'
import CourseSearchBar from '../../components/CourseSearchBar'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { ADMIN_BASE_PATH } from '../../constants/adminDashboard'
import { useAdminCourses } from '../../hooks/useAdminData'
import adminApi from '../../services/admin'
import { truncateWords } from '../../utils/text'

export default function Courses() {
  const [search, setSearch] = useState('')
  const { courses, loading, error, refetch } = useAdminCourses({ search })
  const [pendingId, setPendingId] = useState(null)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `Delete "${course.title}"? This will also remove its assignments and enrollments. This action cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setPendingId(course.id)
    setMessage('')
    setErrorMessage('')
    try {
      const response = await adminApi.deleteCourse(course.id)
      setMessage(response.message || 'Course deleted successfully')
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete course')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
        <p className="mt-1 text-sm text-slate-600">
          {courses.length} course{courses.length === 1 ? '' : 's'} in the system
        </p>
      </div>

      <Alert type="success" message={message} onDismiss={() => setMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <CourseSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by title, code, or description..."
      />

      {loading ? (
        <LoadingState message="Loading courses..." />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          message={search ? 'No courses match your search.' : 'No courses have been created yet.'}
        />
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{course.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {course.code}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {truncateWords(course.description, 6)}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Teacher: {course.teacher_name || '—'} · {course.enrolled_count} enrolled
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`${ADMIN_BASE_PATH}/courses/${course.id}/edit`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(course)}
                  disabled={pendingId === course.id}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingId === course.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
