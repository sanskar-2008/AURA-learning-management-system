import { useState } from 'react'
import { Link } from 'react-router-dom'
import CourseSearchBar from '../../components/CourseSearchBar'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherCourses } from '../../hooks/useTeacherData'

export default function EnrolledStudents() {
  const [search, setSearch] = useState('')
  const { courses, loading, error } = useTeacherCourses({ search })

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Enrolled Students</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select a course to view students who enrolled themselves.
        </p>
      </div>

      <CourseSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search courses..."
      />

      {courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          message={
            search
              ? 'No courses match your search.'
              : 'Create a course first to see enrolled students.'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => (
            <article
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-primary-600">{course.code}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">{course.title}</h3>
              <p className="mt-3 text-sm text-slate-600">
                {course.enrolled_count ?? 0} enrolled student
                {(course.enrolled_count ?? 0) === 1 ? '' : 's'}
              </p>
              <Link
                to={`${TEACHER_BASE_PATH}/courses/${course.id}?students=1`}
                className="mt-5 inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                View Students
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
