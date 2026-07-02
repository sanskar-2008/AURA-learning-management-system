import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import CourseForm from '../../components/CourseForm'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import teacherApi from '../../services/teacher'

const INITIAL_VALUES = {
  title: '',
  code: '',
  description: '',
}

export default function CreateCourse() {
  const navigate = useNavigate()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

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
      const response = await teacherApi.createCourse(values)
      setSuccessMessage(response.message || 'Course created successfully')
      const courseId = response.data.course.id
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/courses/${courseId}`)
      }, 800)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create course')
      setFieldErrors(err.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${TEACHER_BASE_PATH}/courses`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to My Courses
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Course</h1>
        <p className="mt-2 text-sm text-slate-600">
          Add a new course for students to discover and enroll in.
        </p>

        <div className="mt-6 space-y-4">
          <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
          <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

          <CourseForm
            values={values}
            onChange={handleChange}
            onSubmit={handleSubmit}
            fieldErrors={fieldErrors}
            submitting={submitting}
            submitLabel="Create Course"
            onCancel={() => navigate(`${TEACHER_BASE_PATH}/courses`)}
          />
        </div>
      </section>
    </div>
  )
}
