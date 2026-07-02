import { useEffect, useState } from 'react'
import Alert from '../../components/Alert'
import FormField from '../../components/FormField'
import LoadingState from '../../components/LoadingState'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useAdminProfile } from '../../hooks/useAdminData'
import adminApi from '../../services/admin'
import { formatDate } from '../../utils/assignmentStatus'

function ReadOnlyField({ label, value, children }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children || value || '—'}</dd>
    </div>
  )
}

export default function Profile() {
  const { checkAuth } = useAuth()
  const { profile, loading, error, refetch } = useAdminProfile()

  const [showEditForm, setShowEditForm] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
      })
    }
  }, [profile])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

    try {
      const response = await adminApi.updateProfile(form)
      setSuccessMessage(response.message || 'Profile updated successfully')
      setShowEditForm(false)
      await refetch()
      if (checkAuth) {
        await checkAuth()
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile')
      setFieldErrors(err.errors || {})
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading profile..." />
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Profile not found'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-primary-600">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My Profile</h1>
        <p className="mt-2 text-sm text-slate-600">View and update your admin account details.</p>
      </header>

      <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Account Information</h2>
          <p className="mt-1 text-sm text-slate-500">Your admin account details.</p>
        </div>

        {showEditForm ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="First Name"
                id="first_name"
                value={form.first_name}
                onChange={handleChange}
                error={fieldErrors.first_name}
                required
              />
              <FormField
                label="Last Name"
                id="last_name"
                value={form.last_name}
                onChange={handleChange}
                error={fieldErrors.last_name}
                required
              />
            </div>
            <FormField
              label="Email"
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={fieldErrors.email}
              required
            />

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="grid gap-6 sm:grid-cols-2">
              <ReadOnlyField label="Full Name" value={profile.full_name} />
              <ReadOnlyField label="Email" value={profile.email} />
              <ReadOnlyField label="Role" value="Administrator" />
              <ReadOnlyField label="Account Status">
                <StatusBadge status={profile.account_status} />
              </ReadOnlyField>
              <ReadOnlyField label="Account Creation Date" value={formatDate(profile.created_at)} />
            </dl>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setShowEditForm(true)}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
              >
                Edit Profile
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
