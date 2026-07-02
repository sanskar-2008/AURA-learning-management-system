import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import FormField from '../../components/FormField'
import LoadingState from '../../components/LoadingState'
import { STUDENT_BASE_PATH } from '../../constants/studentDashboard'
import { useAssignmentDetail } from '../../hooks/useStudentData'
import { downloadAuthenticatedFile } from '../../services/http'
import studentApi from '../../services/student'
import { ASSIGNMENT_STATUS_LABELS, formatDate, formatDateTime } from '../../utils/assignmentStatus'

export default function AssignmentDetail() {
  const { assignmentId } = useParams()
  const { assignment, loading, error, refetch } = useAssignmentDetail(assignmentId)
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  async function handleDownload(url, fileName) {
    setDownloading(true)
    try {
      await downloadAuthenticatedFile(url, fileName || 'download')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

    if (!content.trim() && !file) {
      setFieldErrors({ content: 'Please provide your answer text or upload a file' })
      setErrorMessage('Please provide your answer text or upload a file')
      setSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('content', content)
      if (file) {
        formData.append('file', file)
      }

      const response = await studentApi.submitAssignment(assignment.id, formData)
      setSuccessMessage(response.message || 'Assignment submitted successfully')
      setContent('')
      setFile(null)
      setFileInputKey((key) => key + 1)
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Submission failed')
      setFieldErrors(err.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading assignment..." />
  }

  if (error || !assignment) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Assignment not found'}
        </div>
        <Link
          to={`${STUDENT_BASE_PATH}/assignments`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to assignments
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${STUDENT_BASE_PATH}/assignments`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to assignments
      </Link>

      <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-primary-600">{assignment.course_title}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{assignment.title}</h1>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Status</dt>
            <dd className="mt-1 font-medium capitalize text-slate-900">
              {ASSIGNMENT_STATUS_LABELS[assignment.status] || assignment.status}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Max points</dt>
            <dd className="mt-1 font-medium text-slate-900">{assignment.max_points}</dd>
          </div>
          {assignment.due_date && (
            <div>
              <dt className="text-sm text-slate-500">Due date</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatDate(assignment.due_date)}
              </dd>
            </div>
          )}
          {assignment.submitted_at && (
            <div>
              <dt className="text-sm text-slate-500">Submitted at</dt>
              <dd className="mt-1 font-medium text-slate-900">
                {formatDateTime(assignment.submitted_at)}
              </dd>
            </div>
          )}
          {assignment.grade !== null && (
            <div>
              <dt className="text-sm text-slate-500">Grade</dt>
              <dd className="mt-1 font-medium text-slate-900">{assignment.grade}</dd>
            </div>
          )}
        </dl>

        {assignment.description && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{assignment.description}</p>
          </div>
        )}

        {assignment.has_attachment && assignment.attachment_url && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Assignment File</h2>
            <p className="mt-1 text-sm text-slate-600">{assignment.attachment_name}</p>
            <button
              type="button"
              onClick={() => handleDownload(assignment.attachment_url, assignment.attachment_name)}
              disabled={downloading}
              className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60"
            >
              {downloading ? 'Downloading...' : 'Download Assignment File'}
            </button>
          </div>
        )}

        {assignment.is_submitted ? (
          <div className="mt-8 space-y-4 rounded-xl bg-slate-50 p-5">
            <h2 className="text-sm font-semibold text-slate-900">Your submission</h2>
            {assignment.content && (
              <p className="text-sm leading-relaxed text-slate-700">{assignment.content}</p>
            )}
            {assignment.file_url && (
              <div className="text-sm text-slate-600">
                {assignment.file_name ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(assignment.file_url, assignment.file_name)}
                    disabled={downloading}
                    className="font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
                  >
                    Download submitted file ({assignment.file_name})
                  </button>
                ) : (
                  <a
                    href={assignment.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {assignment.file_url}
                  </a>
                )}
              </div>
            )}
            {assignment.feedback && (
              <div>
                <p className="text-sm font-medium text-slate-900">Feedback</p>
                <p className="mt-1 text-sm text-slate-600">{assignment.feedback}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-900">Submit assignment</h2>
            <p className="text-sm text-slate-600">
              Provide your answer in text, upload a file, or both.
            </p>

            <FormField label="Your answer" id="content" error={fieldErrors.content}>
              <textarea
                id="content"
                name="content"
                rows={6}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 ${
                  fieldErrors.content ? 'border-red-400' : 'border-slate-300'
                }`}
                placeholder="Write your submission here..."
              />
            </FormField>

            <FormField label="Upload file (PDF or document)" id="file" error={fieldErrors.file}>
              <input
                key={fileInputKey}
                id="file"
                name="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null)
                  setFieldErrors((prev) => ({ ...prev, file: undefined }))
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 ${
                  fieldErrors.file ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              <p className="mt-2 text-xs text-slate-500">
                Allowed: PDF, DOC, DOCX, TXT, ZIP, PNG, JPG (max 25 MB).
              </p>
            </FormField>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit assignment'}
            </button>
          </form>
        )}
      </article>
    </div>
  )
}
