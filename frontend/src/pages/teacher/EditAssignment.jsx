import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import AssignmentForm from '../../components/AssignmentForm'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherAssignmentDetail, useTeacherCourses } from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'
import { toDatetimeLocalValue } from '../../utils/assignmentStatus'

export default function EditAssignment() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const { assignment, loading, error } = useTeacherAssignmentDetail(assignmentId)
  const { courses, loading: coursesLoading } = useTeacherCourses()
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
  const [file, setFile] = useState(null)
  const [removeFile, setRemoveFile] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)

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

  function handleFileChange(event) {
    setFile(event.target.files?.[0] ?? null)
    setRemoveFile(false)
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
      if (removeFile) {
        formData.append('remove_file', 'true')
      }
      if (file) {
        formData.append('file', file)
      }

      const response = await teacherApi.updateAssignment(assignmentId, formData)
      setSuccessMessage(response.message || 'Assignment updated successfully')
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/assignments/${assignmentId}`)
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
          to={`${TEACHER_BASE_PATH}/assignments`}
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
        to={`${TEACHER_BASE_PATH}/assignments/${assignmentId}`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to assignment details
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Assignment</h1>
        <p className="mt-2 text-sm text-slate-600">Update your assignment information.</p>

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
            submitLabel="Save Changes"
            onCancel={() => navigate(`${TEACHER_BASE_PATH}/assignments/${assignmentId}`)}
            currentFileName={assignment.file_name || ''}
            removeFile={removeFile}
            onRemoveFileChange={setRemoveFile}
            key={fileInputKey}
          />
        </div>
      </section>
    </div>
  )
}
