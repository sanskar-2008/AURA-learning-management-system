import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
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
      const data = await login(form)
      const redirectTo = location.state?.from || data.redirect_to
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrors(error.errors || { form: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Sign in</h1>
      <p className="mb-6 text-sm text-slate-600">
        Access your AURA course account
      </p>

      {errors.form && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errors.form}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email"
          id="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email || errors.credentials}
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
          Sign up
        </Link>
      </p>

      <p className="mt-3 text-center text-sm text-slate-600">
        <Link to="/login/admin" className="font-medium text-primary-600 hover:text-primary-700">
          Sign in as Admin
        </Link>
      </p>
    </div>
  )
}
