import { useState } from 'react'
import Alert from './Alert'
import CourseCard from './CourseCard'
import CourseSearchBar from './CourseSearchBar'
import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import { useCourseBrowse } from '../hooks/useStudentData'
import studentApi from '../services/student'

export default function CourseCatalog({
  title,
  enrollableOnly = false,
  includeEnrolled = false,
  compact = false,
}) {
  const [search, setSearch] = useState('')
  const [enrollingId, setEnrollingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const browseEnrollableOnly = enrollableOnly && !includeEnrolled

  const { courses, loading, error, refetch } = useCourseBrowse({
    enrollableOnly: browseEnrollableOnly,
    search,
  })

  async function handleEnroll(courseId) {
    setEnrollingId(courseId)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await studentApi.enrollInCourse(courseId)
      setSuccessMessage(response.message || 'Successfully enrolled in the course')
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Enrollment failed')
    } finally {
      setEnrollingId(null)
    }
  }

  const enrolledCount = courses.filter((course) => course.is_enrolled).length
  const availableCount = courses.length - enrolledCount

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {includeEnrolled
            ? 'Browse courses, enroll in new ones, or click a course to view details.'
            : enrollableOnly
              ? 'Search courses you can enroll in'
              : 'Search and explore courses'}
        </p>
      </div>

      <CourseSearchBar value={search} onChange={setSearch} />

      <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      {loading && <LoadingState message="Loading courses..." />}

      {!loading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <EmptyState
          title="No courses found"
          message={
            search
              ? 'No courses match your search.'
              : browseEnrollableOnly
                ? 'No courses are available for enrollment right now.'
                : 'No courses are available right now.'
          }
        />
      )}

      {!loading && !error && courses.length > 0 && (
        <>
          {includeEnrolled && (
            <p className="text-sm text-slate-600">
              {enrolledCount} enrolled · {availableCount} available to enroll
            </p>
          )}

          <div className={compact ? 'space-y-3' : 'grid gap-4 md:grid-cols-2'}>
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                enrolling={enrollingId === course.id}
                compact={compact}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
