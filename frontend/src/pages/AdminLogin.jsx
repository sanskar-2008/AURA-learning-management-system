import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormField from '../components/FormField'
import { useAuth } from '../context/AuthContext'
import authApi from '../services/auth'

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    admin_id: '',
    captcha_answer: '',
  })
  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    try {
      const response = await authApi.getAdminCaptcha()
      setCaptchaImage(response.data.captcha.image)
      setForm((prev) => ({ ...prev, captcha_answer: '' }))
      setErrors((prev) => ({ ...prev, captcha_answer: undefined }))
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err.message || 'Failed to load captcha' }))
    } finally {
      setCaptchaLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCaptcha()
  }, [loadCaptcha])

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
      const data = await adminLogin(form)
      navigate(data.redirect_to, { replace: true })
    } catch (error) {
      setErrors(error.errors || { form: error.message })
      await loadCaptcha()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Sign in as Admin</h1>
      <p className="mb-6 text-sm text-slate-600">
        Enter your admin credentials to access the admin portal
      </p>

      {errors.form && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>
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
          placeholder="admin@gmail.com"
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
          placeholder="Enter admin password"
          autoComplete="current-password"
        />
        <FormField
          label="Admin ID"
          id="admin_id"
          value={form.admin_id}
          onChange={handleChange}
          error={errors.admin_id}
          required
          placeholder="Enter admin ID"
          autoComplete="off"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="captcha_answer" className="text-sm font-medium text-slate-700">
              Captcha
            </label>
            <button
              type="button"
              onClick={loadCaptcha}
              disabled={captchaLoading}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            {captchaLoading ? (
              <span className="text-sm text-slate-500">Loading captcha...</span>
            ) : captchaImage ? (
              <img
                src={captchaImage}
                alt="Captcha"
                className="h-14 rounded-md border border-slate-200 bg-white"
              />
            ) : (
              <span className="text-sm text-slate-500">Captcha unavailable</span>
            )}
          </div>
          <FormField
            label="Enter the characters shown"
            id="captcha_answer"
            value={form.captcha_answer}
            onChange={handleChange}
            error={errors.captcha_answer}
            required
            placeholder="Type the captcha text"
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || captchaLoading || !captchaImage}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Signing in...' : 'Sign in as Admin'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          ← Back to regular sign in
        </Link>
      </p>
    </div>
  )
}
