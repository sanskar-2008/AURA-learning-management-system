import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherCourses, useTeacherGrades } from '../../hooks/useTeacherData'

export default function Grades() {
  const { courses, loading: coursesLoading } = useTeacherCourses()
  const { grades, loading: gradesLoading, error } = useTeacherGrades()

  if (coursesLoading || gradesLoading) {
    return <LoadingState message="Loading marks and grades..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Marks & Grades</h1>
        <p className="mt-1 text-sm text-slate-600">
          Evaluate students, enter marks, and manage grades for your courses.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
        {courses.length === 0 ? (
          <EmptyState title="No courses yet" message="Create a course before entering marks." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                to={`${TEACHER_BASE_PATH}/courses/${course.id}/grades`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-300 hover:shadow-md"
              >
                <p className="text-sm font-medium text-primary-600">{course.code}</p>
                <h3 className="mt-1 font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-2 text-xs text-slate-500">
                  {course.enrolled_count ?? 0} enrolled students
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">All Submitted Marks</h2>
        {grades.length === 0 ? (
          <EmptyState
            title="No marks entered yet"
            message="Select a course above to enter marks for enrolled students."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Course</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Evaluation</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Marks</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Grade</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((grade) => (
                  <tr key={grade.id}>
                    <td className="px-4 py-3 text-slate-900">
                      <div>{grade.student_name}</div>
                      <div className="text-xs text-slate-500">{grade.student_number}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{grade.course_title}</td>
                    <td className="px-4 py-3 text-slate-700">{grade.evaluation_name}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {grade.marks_obtained}/{grade.maximum_marks}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{grade.grade}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {grade.evaluated_at ? new Date(grade.evaluated_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`${TEACHER_BASE_PATH}/courses/${grade.course_id}/grades/${grade.id}/edit`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
