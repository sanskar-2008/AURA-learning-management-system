import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import AssignmentForm from '../../components/AssignmentForm'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherCourses } from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'

const INITIAL_VALUES = {
  title: '',
  course_id: '',
  description: '',
  due_date: '',
  max_points: '100',
}

export default function CreateAssignment() {
  const navigate = useNavigate()
  const { courses, loading: coursesLoading } = useTeacherCourses()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [file, setFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(event) {
    setFile(event.target.files?.[0] ?? null)
    setFieldErrors((prev) => ({ ...prev, file: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description)
      formData.append('course_id', values.course_id)
      formData.append('due_date', values.due_date)
      formData.append('max_points', values.max_points)
      if (file) {
        formData.append('file', file)
      }

      const response = await teacherApi.createAssignment(formData)
      setSuccessMessage(response.message || 'Assignment created successfully')
      const assignmentId = response.data.assignment.id
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/assignments/${assignmentId}`)
      }, 800)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create assignment')
      setFieldErrors(err.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  if (coursesLoading) {
    return <LoadingState message="Loading courses..." />
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${TEACHER_BASE_PATH}/assignments`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to Assignments
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Assignment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Create a new assignment for one of your courses.
        </p>

        {courses.length === 0 ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            You need to create a course before adding assignments.{' '}
            <Link to={`${TEACHER_BASE_PATH}/create`} className="font-medium underline">
              Create a course
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
            <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

            <AssignmentForm
              values={values}
              courses={courses}
              onChange={handleChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
              fieldErrors={fieldErrors}
              submitting={submitting}
              submitLabel="Create Assignment"
              onCancel={() => navigate(`${TEACHER_BASE_PATH}/assignments`)}
              key={fileInputKey}
            />
          </div>
        )}
      </section>
    </div>
  )
}
