import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import StatCard from '../../components/StatCard'
import { useParentContext } from '../../context/ParentContext'
import { PARENT_BASE_PATH } from '../../constants/parentDashboard'
import { useChildLearningDashboard } from '../../hooks/useParentData'
import {
  ASSIGNMENT_STATUS_LABELS,
  SUBMISSION_STATUS_LABELS,
  formatDate,
  formatDateTime,
} from '../../utils/assignmentStatus'

function submissionBadgeClass(assignment) {
  if (!assignment.is_submitted) {
    return 'bg-amber-50 text-amber-700'
  }
  if (assignment.submission_status === 'graded') {
    return 'bg-green-50 text-green-700'
  }
  return 'bg-blue-50 text-blue-700'
}

function submissionLabel(assignment) {
  if (!assignment.is_submitted) {
    return ASSIGNMENT_STATUS_LABELS.pending
  }
  return SUBMISSION_STATUS_LABELS[assignment.submission_status] || ASSIGNMENT_STATUS_LABELS.submitted
}

export default function ChildProgress() {
  const { selectedChild, selectedChildId } = useParentContext()
  const { data, loading, error } = useChildLearningDashboard(selectedChildId)

  if (loading) {
    return <LoadingState message="Loading learning dashboard..." />
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Unable to load learning dashboard'}
      </div>
    )
  }

  const progress = data.progress ?? {}
  const courses = data.courses ?? []
  const assignments = data.assignments ?? []
  const courseGrades = data.grades?.course_grades ?? []
  const assignmentGrades = data.grades?.assignment_grades ?? []

  const submittedCount = assignments.filter((item) => item.is_submitted).length
  const pendingCount = assignments.length - submittedCount

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-primary-600">Child Progress</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Learning Dashboard
        </h1>
        {selectedChild && (
          <p className="mt-2 text-sm text-slate-600">
            Tracking progress for {selectedChild.full_name} ({selectedChild.student_number})
          </p>
        )}
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Enrolled Courses"
            value={progress.enrolled_courses ?? 0}
            icon="courses"
            accent="primary"
          />
          <StatCard
            label="Assignments Submitted"
            value={`${progress.submitted_assignments ?? 0}/${progress.total_assignments ?? 0}`}
            icon="assignments"
            accent="amber"
          />
          <StatCard
            label="Average Grade"
            value={progress.average_grade ?? '—'}
            icon="grades"
            accent="green"
          />
          <StatCard
            label="Attendance"
            value={`${progress.attendance_percentage ?? 0}%`}
            icon="attendance"
            accent="green"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Enrolled Courses</h2>
          <Link
            to={`${PARENT_BASE_PATH}/courses`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all courses →
          </Link>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            title="No enrolled courses"
            message="Your child is not enrolled in any active courses yet."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`${PARENT_BASE_PATH}/courses/${course.id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary-200 hover:shadow-md"
              >
                <p className="text-sm font-medium text-primary-600">{course.code}</p>
                <h3 className="mt-0.5 font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-1 truncate text-sm text-slate-600">
                  {course.teacher_name ? `Teacher: ${course.teacher_name}` : 'Teacher: —'}
                </p>
                {course.final_grade && (
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Final grade: {course.final_grade}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Assignment Submissions</h2>
            <p className="mt-1 text-sm text-slate-600">
              {submittedCount} submitted · {pendingCount} pending
            </p>
          </div>
          <Link
            to={`${PARENT_BASE_PATH}/assignments`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all assignments →
          </Link>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments"
            message="There are no assignments for your child's enrolled courses."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Assignment</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Due Date</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Submitted</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{assignment.title}</td>
                    <td className="px-4 py-3 text-slate-700">{assignment.course_title}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(assignment.due_date) || '—'}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {assignment.is_submitted
                        ? formatDateTime(assignment.submitted_at) || 'Yes'
                        : 'No'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${submissionBadgeClass(assignment)}`}
                      >
                        {submissionLabel(assignment)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {assignment.grade != null ? `${assignment.grade}/${assignment.max_points}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Grades</h2>
          <Link
            to={`${PARENT_BASE_PATH}/grades`}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Full grades report →
          </Link>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium text-slate-800">Course Grades</h3>
          {courseGrades.length === 0 ? (
            <p className="text-sm text-slate-600">No final course grades available yet.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Final Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courseGrades.map((grade) => (
                    <tr key={grade.course_id}>
                      <td className="px-4 py-3 text-slate-900">{grade.course_title}</td>
                      <td className="px-4 py-3 text-slate-700">{grade.course_code}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {grade.final_grade || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-medium text-slate-800">Assignment Grades</h3>
          {assignmentGrades.length === 0 ? (
            <p className="text-sm text-slate-600">No graded assignments yet.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Assignment</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignmentGrades.map((grade) => (
                    <tr key={grade.assignment_id}>
                      <td className="px-4 py-3 text-slate-900">{grade.assignment_title}</td>
                      <td className="px-4 py-3 text-slate-700">{grade.course_title}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {grade.grade}/{grade.max_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
