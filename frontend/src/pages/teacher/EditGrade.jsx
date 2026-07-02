import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import GradeForm from '../../components/GradeForm'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import {
  useCourseEnrolledStudents,
  useTeacherAssignments,
  useTeacherGradeDetail,
} from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'

export default function EditGrade() {
  const { courseId, gradeId } = useParams()
  const navigate = useNavigate()
  const { grade, loading, error } = useTeacherGradeDetail(courseId, gradeId)
  const { students, loading: studentsLoading } = useCourseEnrolledStudents(courseId)
  const { assignments } = useTeacherAssignments({ courseId })
  const [values, setValues] = useState({
    student_id: '',
    assignment_id: '',
    evaluation_name: '',
    marks_obtained: '',
    maximum_marks: '',
    remarks: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!grade) return
    setValues({
      student_id: String(grade.student_id),
      assignment_id: grade.assignment_id ? String(grade.assignment_id) : '',
      evaluation_name: grade.evaluation_name,
      marks_obtained: String(grade.marks_obtained),
      maximum_marks: String(grade.maximum_marks),
      remarks: grade.remarks || '',
    })
  }, [grade])

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
      const response = await teacherApi.updateGrade(courseId, gradeId, {
        student_id: Number(values.student_id),
        assignment_id: values.assignment_id ? Number(values.assignment_id) : null,
        evaluation_name: values.evaluation_name,
        marks_obtained: Number(values.marks_obtained),
        maximum_marks: Number(values.maximum_marks),
        remarks: values.remarks,
      })
      setSuccessMessage(response.message || 'Marks updated successfully')
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/courses/${courseId}/grades`)
      }, 800)
    } catch (err) {
      setFieldErrors(err.errors || {})
      setErrorMessage(err.message || 'Failed to update marks')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || studentsLoading) {
    return <LoadingState message="Loading grade record..." />
  }

  if (error || !grade) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Grade record not found'}
        </div>
        <Link
          to={`${TEACHER_BASE_PATH}/courses/${courseId}/grades`}
          className="text-sm font-medium text-primary-600"
        >
          ← Back to course grades
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${TEACHER_BASE_PATH}/courses/${courseId}/grades`}
        className="text-sm font-medium text-primary-600"
      >
        ← Back to course grades
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Marks</h1>
        <p className="mt-2 text-sm text-slate-600">Update marks, grade, and remarks for this evaluation.</p>

        <div className="mt-6 space-y-4">
          <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
          <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

          <GradeForm
            values={values}
            setValues={setValues}
            onChange={handleChange}
            onSubmit={handleSubmit}
            fieldErrors={fieldErrors}
            submitting={submitting}
            submitLabel="Update Marks"
            students={students}
            assignments={assignments}
            disableStudentSelect
            onCancel={() => navigate(`${TEACHER_BASE_PATH}/courses/${courseId}/grades`)}
          />
        </div>
      </section>
    </div>
  )
}
