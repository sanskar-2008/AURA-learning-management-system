import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../../components/Alert'
import FormField from '../../components/FormField'
import { useParentContext } from '../../context/ParentContext'
import { PARENT_BASE_PATH } from '../../constants/parentDashboard'
import parentApi from '../../services/parent'

export default function LinkChild() {
  const navigate = useNavigate()
  const { refreshChildren } = useParentContext()
  const [studentNumber, setStudentNumber] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    setFieldErrors({})

    try {
      const response = await parentApi.linkChild(studentNumber.trim())
      setSuccess(response.message || 'Child linked successfully')
      await refreshChildren()
      navigate(PARENT_BASE_PATH, { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to link child')
      setFieldErrors(err.errors || {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Link Your Child</h1>
        <p className="mt-3 text-sm font-medium text-slate-700">
          No child is linked to your account.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Enter your child&apos;s student roll number to connect their account to yours.
        </p>

        <Alert type="success" message={success} onDismiss={() => setSuccess('')} />
        <Alert type="error" message={error} onDismiss={() => setError('')} />

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <FormField
            label="Student Roll Number"
            id="student_number"
            value={studentNumber}
            onChange={(event) => setStudentNumber(event.target.value)}
            error={fieldErrors.student_number}
            placeholder="e.g. ST01"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Linking...' : 'Link Child'}
          </button>
        </form>
      </section>
    </div>
  )
}
