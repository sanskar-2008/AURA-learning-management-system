import { useState } from 'react'
import { Link } from 'react-router-dom'
import CourseCard from '../../components/CourseCard'
import CourseSearchBar from '../../components/CourseSearchBar'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherCourses } from '../../hooks/useTeacherData'

export default function MyCourses() {
  const [search, setSearch] = useState('')
  const { courses, loading, error } = useTeacherCourses({ search })

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My Courses</h2>
          <p className="mt-1 text-sm text-slate-600">
            {courses.length} course{courses.length === 1 ? '' : 's'} created
          </p>
        </div>
        <Link
          to={`${TEACHER_BASE_PATH}/create`}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Create Course
        </Link>
      </div>

      <CourseSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by title, code, or description..."
      />

      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          message={
            search
              ? 'No courses match your search. Try a different keyword.'
              : 'You have not created any courses yet. Create your first course to get started.'
          }
        />
      ) : (
        <div className="grid gap-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showEnroll={false}
              showStudentsLink
              showMaterialsLink
              basePath={TEACHER_BASE_PATH}
              compact
            />
          ))}
        </div>
      )}
    </div>
  )
}
