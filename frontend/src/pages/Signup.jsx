import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'
import { ROLES } from '../utils/roles'

const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: 'Student' },
  { value: ROLES.TEACHER, label: 'Teacher' },
  { value: ROLES.PARENT, label: 'Parent' },
]

const AUTO_ID_HINTS = {
  [ROLES.STUDENT]: 'A student ID (e.g. ST01, ST02) will be assigned automatically.',
  [ROLES.TEACHER]: 'A teacher ID (e.g. TE01, TE02) will be assigned automatically.',
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    role: ROLES.STUDENT,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const data = await signup(form)
      navigate(data.redirect_to, { replace: true })
    } catch (error) {
      setErrors(error.errors || { form: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Create account</h1>
      <p className="mb-6 text-sm text-slate-600">
        Students, teachers, and parents can register here
      </p>

      {errors.form && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Role" id="role" error={errors.role} required>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.role ? 'border-red-400' : 'border-slate-300'
            }`}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        {AUTO_ID_HINTS[form.role] && (
          <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800">
            {AUTO_ID_HINTS[form.role]}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            id="first_name"
            value={form.first_name}
            onChange={handleChange}
            error={errors.first_name}
            required
            autoComplete="given-name"
          />
          <FormField
            label="Last name"
            id="last_name"
            value={form.last_name}
            onChange={handleChange}
            error={errors.last_name}
            required
            autoComplete="family-name"
          />
        </div>

        <FormField
          label="Email"
          id="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          required
          autoComplete="email"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="Password"
            id="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="new-password"
          />
          <FormField
            label="Confirm password"
            id="confirm_password"
            type="password"
            value={form.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}
