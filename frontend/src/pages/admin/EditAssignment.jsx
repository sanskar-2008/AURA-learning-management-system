import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import AssignmentForm from '../../components/AssignmentForm'
import LoadingState from '../../components/LoadingState'
import { ADMIN_BASE_PATH } from '../../constants/adminDashboard'
import { useAdminAssignmentDetail, useAdminCoursesForSelect } from '../../hooks/useAdminData'
import adminApi from '../../services/admin'
import { toDatetimeLocalValue } from '../../utils/assignmentStatus'

export default function EditAssignment() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const { assignment, loading, error } = useAdminAssignmentDetail(assignmentId)
  const { courses, loading: coursesLoading } = useAdminCoursesForSelect()
  const [values, setValues] = useState({
    title: '',
    course_id: '',
    description: '',
    due_date: '',
    max_points: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!assignment) {
      return
    }
    setValues({
      title: assignment.title,
      course_id: String(assignment.course_id),
      description: assignment.description || '',
      due_date: toDatetimeLocalValue(assignment.due_date),
      max_points: String(assignment.max_points),
    })
  }, [assignment])

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
      const response = await adminApi.updateAssignment(assignmentId, {
        ...values,
        course_id: Number(values.course_id),
        max_points: Number(values.max_points),
      })
      setSuccessMessage(response.message || 'Assignment updated successfully')
      setTimeout(() => {
        navigate(`${ADMIN_BASE_PATH}/assignments`)
      }, 800)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update assignment')
      setFieldErrors(err.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || coursesLoading) {
    return <LoadingState message="Loading assignment..." />
  }

  if (error || !assignment) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Assignment not found'}
        </div>
        <Link
          to={`${ADMIN_BASE_PATH}/assignments`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to Assignments
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${ADMIN_BASE_PATH}/assignments`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to Assignments
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Assignment</h1>
        <p className="mt-2 text-sm text-slate-600">Update the assignment information.</p>

        <div className="mt-6 space-y-4">
          <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
          <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

          <AssignmentForm
            values={values}
            courses={courses}
            onChange={handleChange}
            onSubmit={handleSubmit}
            fieldErrors={fieldErrors}
            submitting={submitting}
            submitLabel="Save Changes"
            onCancel={() => navigate(`${ADMIN_BASE_PATH}/assignments`)}
          />
        </div>
      </section>
    </div>
  )
}
