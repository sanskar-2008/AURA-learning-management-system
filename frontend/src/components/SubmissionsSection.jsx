import { useState } from 'react'
import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import { useAssignmentSubmissions } from '../hooks/useTeacherData'
import { downloadAuthenticatedFile } from '../services/http'
import { SUBMISSION_STATUS_LABELS, formatDateTime } from '../utils/assignmentStatus'

function submissionStatusStyles(status) {
  if (status === 'late') {
    return 'bg-red-50 text-red-700'
  }
  if (status === 'graded') {
    return 'bg-green-50 text-green-700'
  }
  return 'bg-blue-50 text-blue-700'
}

export default function SubmissionsSection({ assignmentId }) {
  const { submissions, loading, error } = useAssignmentSubmissions(assignmentId)
  const [downloadingId, setDownloadingId] = useState(null)

  async function handleDownload(submission) {
    if (!submission.file_url) return
    if (!submission.has_file && submission.file_url.startsWith('http')) {
      window.open(submission.file_url, '_blank', 'noopener,noreferrer')
      return
    }

    setDownloadingId(submission.id)
    try {
      await downloadAuthenticatedFile(
        submission.file_url,
        submission.file_name || 'submission-file',
      )
    } catch (err) {
      window.alert(err.message || 'Failed to download file')
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) {
    return <LoadingState message="Loading submissions..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyState
        title="No submissions yet"
        message="No students have submitted this assignment yet."
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Student ID</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Student Name</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Submission Date</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Submitted File</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="px-6 py-4 font-medium text-slate-900">{submission.student_number}</td>
                <td className="px-6 py-4 text-slate-700">{submission.student_name}</td>
                <td className="px-6 py-4 text-slate-700">
                  {formatDateTime(submission.submitted_at) || '—'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${submissionStatusStyles(submission.submission_status)}`}
                  >
                    {SUBMISSION_STATUS_LABELS[submission.submission_status] ||
                      submission.submission_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700">
                  {submission.file_url ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(submission)}
                      disabled={downloadingId === submission.id}
                      className="font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
                    >
                      {downloadingId === submission.id
                        ? 'Downloading...'
                        : submission.file_name || 'Download'}
                    </button>
                  ) : submission.content ? (
                    'Text only'
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
