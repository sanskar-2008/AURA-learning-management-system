import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import LoadingState from '../../components/LoadingState'
import { STUDENT_BASE_PATH } from '../../constants/studentDashboard'
import { useCourseDetail } from '../../hooks/useStudentData'
import studentApi from '../../services/student'

export default function CourseDetail() {
  const { courseId } = useParams()
  const { course, loading, error, refetch } = useCourseDetail(courseId)
  const [enrolling, setEnrolling] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleEnroll() {
    setEnrolling(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await studentApi.enrollInCourse(course.id)
      setSuccessMessage(response.message || 'Successfully enrolled in the course')
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Enrollment failed')
    } finally {
      setEnrolling(false)
    }
  }

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
          to={`${STUDENT_BASE_PATH}/search`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to courses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${STUDENT_BASE_PATH}/search`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to courses
      </Link>

      <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-primary-600">{course.code}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{course.title}</h1>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {course.teacher_name && (
            <div>
              <dt className="text-sm text-slate-500">Teacher</dt>
              <dd className="mt-1 font-medium text-slate-900">{course.teacher_name}</dd>
            </div>
          )}
          <div>
            <dt className="text-sm text-slate-500">Credits</dt>
            <dd className="mt-1 font-medium text-slate-900">{course.credits}</dd>
          </div>
          {course.start_date && (
            <div>
              <dt className="text-sm text-slate-500">Start date</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {new Date(course.start_date).toLocaleDateString()}
              </dd>
            </div>
          )}
          {course.end_date && (
            <div>
              <dt className="text-sm text-slate-500">End date</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {new Date(course.end_date).toLocaleDateString()}
              </dd>
            </div>
          )}
          {course.is_enrolled && (
            <div>
              <dt className="text-sm text-slate-500">Enrollment status</dt>
              <dd className="mt-1 font-medium capitalize text-slate-900">
                {course.enrollment_status}
              </dd>
            </div>
          )}
        </dl>

        {course.description && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{course.description}</p>
          </div>
        )}

        <div className="mt-8">
          {course.is_enrolled ? (
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                You are enrolled in this course
              </span>
              <Link
                to={`${STUDENT_BASE_PATH}/courses/${course.id}/materials`}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                View Learning Materials
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleEnroll}
              disabled={enrolling}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {enrolling ? 'Enrolling...' : 'Enroll in this course'}
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
