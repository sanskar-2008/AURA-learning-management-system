import { Link, useParams } from 'react-router-dom'
import LoadingState from '../../components/LoadingState'
import { useParentContext } from '../../context/ParentContext'
import { PARENT_BASE_PATH } from '../../constants/parentDashboard'
import { useChildCourse } from '../../hooks/useParentData'
import { formatDate } from '../../utils/assignmentStatus'

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value ?? '—'}</dd>
    </div>
  )
}

export default function ChildCourseDetail() {
  const { courseId } = useParams()
  const { selectedChildId } = useParentContext()
  const { data, loading, error } = useChildCourse(selectedChildId, Number(courseId))
  const course = data?.course

  if (loading) {
    return <LoadingState message="Loading course details..." />
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Course not found'}
        </div>
        <Link
          to={`${PARENT_BASE_PATH}/courses`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Back to courses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`${PARENT_BASE_PATH}/courses`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to courses
        </Link>
      </div>

      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-primary-600">{course.code}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{course.title}</h1>
        {course.description && (
          <p className="mt-3 text-sm text-slate-600">{course.description}</p>
        )}
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Course Details</h2>
        <dl className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Teacher" value={course.teacher_name} />
          <ReadOnlyField label="Credits" value={course.credits} />
          <ReadOnlyField label="Enrollment Status" value={course.enrollment_status} />
          <ReadOnlyField label="Enrolled At" value={formatDate(course.enrolled_at)} />
          <ReadOnlyField label="Start Date" value={formatDate(course.start_date)} />
          <ReadOnlyField label="End Date" value={formatDate(course.end_date)} />
          <ReadOnlyField label="Final Grade" value={course.final_grade} />
          <ReadOnlyField label="Course Active" value={course.is_active ? 'Yes' : 'No'} />
        </dl>
      </section>
    </div>
  )
}
