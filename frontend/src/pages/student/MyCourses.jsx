import { Link } from 'react-router-dom'
import CourseCard from '../../components/CourseCard'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { useStudentCourses } from '../../hooks/useStudentData'

export default function MyCourses() {
  const { courses, loading, error } = useStudentCourses()

  if (loading) {
    return <LoadingState message="Loading your courses..." />
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
        message="You are not enrolled in any courses yet."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">My Courses</h2>
        <p className="mt-1 text-sm text-slate-600">
          {courses.length} enrolled course{courses.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="grid gap-3">
        {courses.map((course) => (
          <CourseCard key={course.enrollment_id} course={course} showEnroll={false} compact />
        ))}
      </div>
    </div>
  )
}
