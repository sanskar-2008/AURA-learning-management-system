import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import CourseForm from '../../components/CourseForm'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherCourseDetail } from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'

export default function EditCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { course, loading, error } = useTeacherCourseDetail(courseId)
  const [values, setValues] = useState({
    title: '',
    code: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!course) {
      return
    }

    setValues({
      title: course.title,
      code: course.code,
      description: course.description || '',
    })
  }, [course])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

    try {
      const response = await teacherApi.updateCourse(courseId, values)
      setSuccessMessage(response.message || 'Course updated successfully')
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/courses/${courseId}`)
      }, 800)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update course')
      setFieldErrors(err.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading course..." />
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
        to={`${TEACHER_BASE_PATH}/courses/${courseId}`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to course details
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Course</h1>
        <p className="mt-2 text-sm text-slate-600">Update your course information.</p>

        <div className="mt-6 space-y-4">
          <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
          <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

          <CourseForm
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            fieldErrors={fieldErrors}
            submitting={submitting}
            submitLabel="Save Changes"
            onCancel={() => navigate(`${TEACHER_BASE_PATH}/courses/${courseId}`)}
          />
        </div>
      </section>
    </div>
  )
}
