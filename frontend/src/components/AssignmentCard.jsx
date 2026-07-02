import { Link } from 'react-router-dom'
import { STUDENT_BASE_PATH } from '../constants/studentDashboard'
import { ASSIGNMENT_STATUS_LABELS, formatDate, formatDateTime } from '../utils/assignmentStatus'

function statusStyles(status) {
  return status === 'submitted'
    ? 'bg-green-50 text-green-700'
    : 'bg-amber-50 text-amber-700'
}

export default function AssignmentCard({
  assignment,
  basePath = STUDENT_BASE_PATH,
  showSubmit = true,
  showTeacherActions = false,
  readOnly = false,
}) {
  const detailPath = `${basePath}/assignments/${assignment.id}`
  const submissionsPath = `${detailPath}?submissions=1`

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary-600">{assignment.course_title}</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">{assignment.title}</h3>
        </div>
        {!showTeacherActions && assignment.status && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles(assignment.status)}`}>
            {ASSIGNMENT_STATUS_LABELS[assignment.status] || assignment.status}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1 text-sm text-slate-600">
        {assignment.due_date && <p>Due: {formatDate(assignment.due_date)}</p>}
        {assignment.max_points != null && <p>Total marks: {assignment.max_points}</p>}
        {assignment.created_at && <p>Created: {formatDate(assignment.created_at)}</p>}
        {typeof assignment.submission_count === 'number' && (
          <p>{assignment.submission_count} submission{assignment.submission_count === 1 ? '' : 's'}</p>
        )}
        {assignment.submitted_at && <p>Submitted: {formatDateTime(assignment.submitted_at)}</p>}
        {assignment.grade != null && <p>Grade: {assignment.grade}</p>}
        {assignment.submission_status && (
          <p>Submission status: {assignment.submission_status}</p>
        )}
      </div>

      {!readOnly && (
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to={detailPath}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View Details
          </Link>

          {showTeacherActions && (
            <Link
              to={submissionsPath}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View Submissions
            </Link>
          )}

          {showSubmit && !assignment.is_submitted && (
            <Link
              to={detailPath}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Submit
            </Link>
          )}
        </div>
      )}
    </article>
  )
}
