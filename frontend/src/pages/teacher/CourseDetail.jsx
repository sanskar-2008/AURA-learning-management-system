import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import EnrolledStudentsSection from '../../components/EnrolledStudentsSection'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherCourseDetail } from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'
import { formatDate } from '../../utils/assignmentStatus'

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const studentsSectionRef = useRef(null)
  const { course, loading, error } = useTeacherCourseDetail(courseId)
  const [showStudents, setShowStudents] = useState(searchParams.get('students') === '1')
  const [deleting, setDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const shouldShow = searchParams.get('students') === '1'
    setShowStudents(shouldShow)
  }, [searchParams])

  useEffect(() => {
    if (showStudents && studentsSectionRef.current) {
      studentsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showStudents, course])

  function openStudentsSection() {
    setShowStudents(true)
    setSearchParams({ students: '1' }, { replace: true })
  }

  function closeStudentsSection() {
    setShowStudents(false)
    setSearchParams({}, { replace: true })
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this course? This action cannot be undone and will remove all enrollments and assignments.',
    )
    if (!confirmed) {
      return
    }

    setDeleting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await teacherApi.deleteCourse(courseId)
      setSuccessMessage(response.message || 'Course deleted successfully')
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/courses`)
      }, 800)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete course')
    } finally {
      setDeleting(false)
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
          to={`${TEACHER_BASE_PATH}/courses`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to My Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${TEACHER_BASE_PATH}/courses`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to My Courses
      </Link>

      <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-primary-600">{course.code}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{course.title}</h1>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Teacher</dt>
            <dd className="mt-1 font-medium text-slate-900">{course.teacher_name || '—'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Created Date</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatDate(course.created_at) || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Enrolled Students</dt>
            <dd className="mt-1 font-medium text-slate-900">{course.enrolled_count ?? 0}</dd>
          </div>
        </dl>

        {course.description && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{course.description}</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={`${TEACHER_BASE_PATH}/courses/${course.id}/materials?type=video`}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Upload Video
          </Link>
          <Link
            to={`${TEACHER_BASE_PATH}/courses/${course.id}/materials?type=pdf`}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
          >
            Upload PDF Notes
          </Link>
          <Link
            to={`${TEACHER_BASE_PATH}/courses/${course.id}/materials`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            All Materials
          </Link>
          <Link
            to={`${TEACHER_BASE_PATH}/courses/${course.id}/grades`}
            className="rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 transition hover:bg-green-100"
          >
            Enter Marks
          </Link>
          <button
            type="button"
            onClick={showStudents ? closeStudentsSection : openStudentsSection}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {showStudents ? 'Hide Enrolled Students' : 'View Enrolled Students'}
          </button>
          <Link
            to={`${TEACHER_BASE_PATH}/courses/${course.id}/edit`}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Edit Course
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete Course'}
          </button>
        </div>
      </article>

      {showStudents && (
        <section ref={studentsSectionRef} className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">Enrolled Students</h2>
            <p className="mt-1 text-sm text-slate-600">{course.title}</p>
          </div>
          <EnrolledStudentsSection courseId={courseId} />
        </section>
      )}
    </div>
  )
}
