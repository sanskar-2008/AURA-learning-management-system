import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import LoadingState from '../../components/LoadingState'
import SubmissionsSection from '../../components/SubmissionsSection'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherAssignmentDetail } from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'
import { downloadAuthenticatedFile } from '../../services/http'
import { formatDate } from '../../utils/assignmentStatus'

export default function AssignmentDetail() {
  const { assignmentId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const submissionsSectionRef = useRef(null)
  const { assignment, loading, error } = useTeacherAssignmentDetail(assignmentId)
  const [showSubmissions, setShowSubmissions] = useState(searchParams.get('submissions') === '1')
  const [deleting, setDeleting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    setShowSubmissions(searchParams.get('submissions') === '1')
  }, [searchParams])

  useEffect(() => {
    if (showSubmissions && submissionsSectionRef.current) {
      submissionsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showSubmissions, assignment])

  function openSubmissionsSection() {
    setShowSubmissions(true)
    setSearchParams({ submissions: '1' }, { replace: true })
  }

  function closeSubmissionsSection() {
    setShowSubmissions(false)
    setSearchParams({}, { replace: true })
  }

  async function handleDownloadAttachment() {
    if (!assignment?.file_url) return
    setDownloading(true)
    try {
      await downloadAuthenticatedFile(assignment.file_url, assignment.file_name || 'assignment-file')
    } catch (err) {
      setErrorMessage(err.message || 'Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this assignment? This action cannot be undone and will remove all submissions.',
    )
    if (!confirmed) {
      return
    }

    setDeleting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const response = await teacherApi.deleteAssignment(assignmentId)
      setSuccessMessage(response.message || 'Assignment deleted successfully')
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/assignments`)
      }, 800)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete assignment')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading assignment details..." />
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
        to={`${TEACHER_BASE_PATH}/assignments`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to Assignments
      </Link>

      <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-primary-600">{assignment.course_title}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{assignment.title}</h1>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Course</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {assignment.course_code} — {assignment.course_title}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Due Date</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatDate(assignment.due_date) || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Total Marks</dt>
            <dd className="mt-1 font-medium text-slate-900">{assignment.max_points}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Created Date</dt>
            <dd className="mt-1 font-medium text-slate-900">
              {formatDate(assignment.created_at) || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Submissions</dt>
            <dd className="mt-1 font-medium text-slate-900">{assignment.submission_count ?? 0}</dd>
          </div>
        </dl>

        {assignment.description && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Description
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{assignment.description}</p>
          </div>
        )}

        {assignment.has_file && (
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-sm font-semibold text-slate-900">Assignment File</h2>
            <p className="mt-1 text-sm text-slate-600">{assignment.file_name}</p>
            <button
              type="button"
              onClick={handleDownloadAttachment}
              disabled={downloading}
              className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60"
            >
              {downloading ? 'Downloading...' : 'Download Attachment'}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={showSubmissions ? closeSubmissionsSection : openSubmissionsSection}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {showSubmissions ? 'Hide Submissions' : 'View Submissions'}
          </button>
          <Link
            to={`${TEACHER_BASE_PATH}/assignments/${assignment.id}/edit`}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Edit Assignment
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Delete Assignment'}
          </button>
        </div>
      </article>

      {showSubmissions && (
        <section ref={submissionsSectionRef} className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">Student Submissions</h2>
            <p className="mt-1 text-sm text-slate-600">{assignment.title}</p>
          </div>
          <SubmissionsSection assignmentId={assignmentId} />
        </section>
      )}
    </div>
  )
}
