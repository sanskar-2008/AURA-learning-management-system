import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import { useCourseEnrolledStudents } from '../hooks/useTeacherData'
import { formatDate } from '../utils/assignmentStatus'

export default function EnrolledStudentsSection({ courseId }) {
  const { students, loading, error } = useCourseEnrolledStudents(courseId)

  if (loading) {
    return <LoadingState message="Loading enrolled students..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!students || students.length === 0) {
    return (
      <EmptyState
        title="No enrolled students"
        message="No students have enrolled in this course yet. Students must enroll themselves from the student portal."
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
              <th className="px-6 py-3 text-left font-medium text-slate-500">Name</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Email</th>
              <th className="px-6 py-3 text-left font-medium text-slate-500">Enrolled Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map((student) => (
              <tr key={student.enrollment_id}>
                <td className="px-6 py-4 font-medium text-slate-900">{student.student_number}</td>
                <td className="px-6 py-4 text-slate-700">{student.full_name}</td>
                <td className="px-6 py-4 text-slate-700">{student.email}</td>
                <td className="px-6 py-4 text-slate-700">
                  {formatDate(student.enrolled_at) || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
