import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import GradeForm from '../../components/GradeForm'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import {
  useCourseEnrolledStudents,
  useTeacherAssignments,
  useTeacherCourseGrades,
} from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'

const INITIAL_VALUES = {
  student_id: '',
  assignment_id: '',
  evaluation_name: '',
  marks_obtained: '',
  maximum_marks: '100',
  remarks: '',
}

export default function CourseGrades() {
  const { courseId } = useParams()
  const { course, grades, loading, error, refetch } = useTeacherCourseGrades(courseId)
  const { students, loading: studentsLoading } = useCourseEnrolledStudents(courseId)
  const { assignments } = useTeacherAssignments({ courseId })
  const [values, setValues] = useState(INITIAL_VALUES)
  const [submitting, setSubmitting] = useState(false)
  const [pendingId, setPendingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

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
      const response = await teacherApi.createGrade(courseId, {
        student_id: Number(values.student_id),
        assignment_id: values.assignment_id ? Number(values.assignment_id) : null,
        evaluation_name: values.evaluation_name,
        marks_obtained: Number(values.marks_obtained),
        maximum_marks: Number(values.maximum_marks),
        remarks: values.remarks,
      })
      setSuccessMessage(response.message || 'Marks saved successfully')
      setValues(INITIAL_VALUES)
      await refetch()
    } catch (err) {
      setFieldErrors(err.errors || {})
      setErrorMessage(err.message || 'Failed to save marks')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(grade) {
    const confirmed = window.confirm(
      `Delete marks for ${grade.student_name} (${grade.evaluation_name})?`,
    )
    if (!confirmed) return

    setPendingId(grade.id)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const response = await teacherApi.deleteGrade(courseId, grade.id)
      setSuccessMessage(response.message || 'Marks deleted successfully')
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete marks')
    } finally {
      setPendingId(null)
    }
  }

  if (loading || studentsLoading) {
    return <LoadingState message="Loading course grades..." />
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Course not found'}
        </div>
        <Link to={`${TEACHER_BASE_PATH}/grades`} className="text-sm font-medium text-primary-600">
          ← Back to Marks & Grades
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link to={`${TEACHER_BASE_PATH}/grades`} className="text-sm font-medium text-primary-600">
        ← Back to Marks & Grades
      </Link>

      <div>
        <p className="text-sm font-medium text-primary-600">{course.code}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{course.title}</h1>
        <p className="mt-1 text-sm text-slate-600">Enter and manage marks for enrolled students.</p>
      </div>

      <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Enter Marks</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select a student and enter marks. Grade is calculated automatically.
        </p>

        {students.length === 0 ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No students are enrolled in this course yet.
          </div>
        ) : (
          <div className="mt-6">
            <GradeForm
              values={values}
              setValues={setValues}
              onChange={handleChange}
              onSubmit={handleSubmit}
              fieldErrors={fieldErrors}
              submitting={submitting}
              submitLabel="Save Marks"
              students={students}
              assignments={assignments}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Submitted Marks</h2>
        {grades.length === 0 ? (
          <EmptyState title="No marks yet" message="Use the form above to enter the first marks." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Student</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Evaluation</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Marks</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Grade</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Remarks</th>
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
                    <td className="px-4 py-3 text-slate-700">{grade.evaluation_name}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {grade.marks_obtained}/{grade.maximum_marks} ({grade.percentage}%)
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{grade.grade}</td>
                    <td className="px-4 py-3 text-slate-600">{grade.remarks || '—'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {grade.evaluated_at ? new Date(grade.evaluated_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`${TEACHER_BASE_PATH}/courses/${courseId}/grades/${grade.id}/edit`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(grade)}
                          disabled={pendingId === grade.id}
                          className="font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
                        >
                          {pendingId === grade.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
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
