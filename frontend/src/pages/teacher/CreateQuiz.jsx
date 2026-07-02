import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import LoadingState from '../../components/LoadingState'
import QuizForm, { createEmptyQuestion } from '../../components/QuizForm'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherCourses } from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'

const INITIAL_VALUES = {
  title: '',
  course_id: '',
  description: '',
  start_time: '',
  end_time: '',
  duration: '30',
  passing_percentage: '50',
  allow_multiple_attempts: false,
  show_results_after_submit: true,
  questions: [createEmptyQuestion()],
}

export default function CreateQuiz() {
  const navigate = useNavigate()
  const { courses, loading: coursesLoading } = useTeacherCourses()
  const [values, setValues] = useState(INITIAL_VALUES)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleQuestionChange(index, field, value) {
    setValues((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i !== index) return q
        const updated = { ...q, [field]: value }
        if (field === 'question_type') {
          if (value === 'true_false') {
            updated.correct_answer = 'true'
            updated.option_a = 'True'
            updated.option_b = 'False'
            updated.option_c = ''
            updated.option_d = ''
          } else if (value === 'mcq') {
            updated.correct_answer = 'a'
          } else if (value === 'short_answer') {
            updated.correct_answer = ''
            updated.option_a = ''
            updated.option_b = ''
            updated.option_c = ''
            updated.option_d = ''
          }
        }
        return updated
      }),
    }))
  }

  function handleAddQuestion() {
    setValues((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }))
  }

  function handleRemoveQuestion(index) {
    setValues((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

    const nextErrors = {}
    if (!values.title.trim()) nextErrors.title = 'Quiz title is required'
    if (!values.course_id) nextErrors.course_id = 'Please select a course'
    if (!values.start_time) nextErrors.start_time = 'Start date and time is required'
    if (!values.end_time) nextErrors.end_time = 'End date and time is required'
    if (values.start_time && values.end_time && new Date(values.end_time) <= new Date(values.start_time)) {
      nextErrors.end_time = 'End date must be after start date'
    }
    if (!values.duration || Number(values.duration) <= 0) {
      nextErrors.duration = 'Time limit must be greater than zero'
    }

    values.questions.forEach((q, index) => {
      if (!q.question_text.trim()) {
        nextErrors[`questions.${index}.question_text`] = 'Question text is required'
      }
      if (q.question_type === 'mcq') {
        if (!q.option_a || !q.option_b || !q.option_c || !q.option_d) {
          nextErrors[`questions.${index}.options`] = 'All four options are required'
        }
      }
      if (q.question_type === 'short_answer' && !q.correct_answer.trim()) {
        nextErrors[`questions.${index}.correct_answer`] = 'Expected answer is required'
      }
      if (!q.marks || Number(q.marks) <= 0) {
        nextErrors[`questions.${index}.marks`] = 'Marks must be greater than zero'
      }
    })

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setErrorMessage(Object.values(nextErrors)[0])
      return
    }

    setSubmitting(true)

    try {
      const response = await teacherApi.createQuiz({
        ...values,
        course_id: Number(values.course_id),
        duration: Number(values.duration),
        passing_percentage: Number(values.passing_percentage),
        questions: values.questions.map((q) => ({
          ...q,
          marks: Number(q.marks),
        })),
      })
      setSuccessMessage(response.message || 'Quiz created successfully')
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/quizzes/${response.data.quiz.id}/results`)
      }, 800)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create quiz')
      setFieldErrors(err.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  if (coursesLoading) {
    return <LoadingState message="Loading courses..." />
  }

  return (
    <div className="space-y-6">
      <Link to={`${TEACHER_BASE_PATH}/quizzes`} className="text-sm font-medium text-primary-600">
        ← Back to Quizzes
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Quiz</h1>
        <p className="mt-2 text-sm text-slate-600">Build an online quiz with MCQ, True/False, or short answer questions.</p>

        <div className="mt-6 space-y-4">
          <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
          <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

          {courses.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Create a course before adding quizzes.
            </div>
          ) : (
            <QuizForm
              values={values}
              courses={courses}
              onChange={handleChange}
              onQuestionChange={handleQuestionChange}
              onAddQuestion={handleAddQuestion}
              onRemoveQuestion={handleRemoveQuestion}
              onSubmit={handleSubmit}
              fieldErrors={fieldErrors}
              submitting={submitting}
              submitLabel="Create Quiz"
              onCancel={() => navigate(`${TEACHER_BASE_PATH}/quizzes`)}
            />
          )}
        </div>
      </section>
    </div>
  )
}
