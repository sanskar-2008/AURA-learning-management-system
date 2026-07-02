import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { useParentContext } from '../../context/ParentContext'
import { PARENT_BASE_PATH } from '../../constants/parentDashboard'
import { useChildCourses } from '../../hooks/useParentData'
import { truncateWords } from '../../utils/text'

export default function ChildCourses() {
  const { selectedChildId } = useParentContext()
  const { data, loading, error } = useChildCourses(selectedChildId)
  const courses = data?.courses ?? []

  if (loading) {
    return <LoadingState message="Loading courses..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No enrolled courses"
        message="Your child is not enrolled in any active courses yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Child Courses</h1>
        <p className="mt-1 text-sm text-slate-600">
          {courses.length} enrolled course{courses.length === 1 ? '' : 's'} (read-only)
        </p>
      </header>

      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`${PARENT_BASE_PATH}/courses/${course.id}`}
            className="block w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
          >
            <p className="truncate text-sm font-medium text-primary-600">{course.code}</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{course.title}</h2>
            {course.description && (
              <p className="mt-2 text-sm text-slate-600">
                {truncateWords(course.description, 6)}
              </p>
            )}
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              {course.teacher_name && <p className="truncate">Teacher: {course.teacher_name}</p>}
              {course.enrollment_status && <p>Status: {course.enrollment_status}</p>}
              {course.final_grade && <p>Final Grade: {course.final_grade}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
