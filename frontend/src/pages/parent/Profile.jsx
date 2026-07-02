import { useEffect, useState } from 'react'
import Alert from '../../components/Alert'
import FormField from '../../components/FormField'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { useParentProfile } from '../../hooks/useParentData'
import parentApi from '../../services/parent'
import { formatDate } from '../../utils/assignmentStatus'

const ACCOUNT_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
}

function ProfileSection({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  )
}

function ReadOnlyField({ label, value, children }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{children || value || '—'}</dd>
    </div>
  )
}

function StatusBadge({ status }) {
  const isActive = status === 'active'
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
      }`}
    >
      {ACCOUNT_STATUS_LABELS[status] || status || '—'}
    </span>
  )
}

export default function Profile() {
  const { checkAuth } = useAuth()
  const { profile, loading, error, refetch, setProfile } = useParentProfile()

  const [showEditForm, setShowEditForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const [personalForm, setPersonalForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileFieldErrors, setProfileFieldErrors] = useState({})
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordFieldErrors, setPasswordFieldErrors] = useState({})

  useEffect(() => {
    if (!profile) {
      return
    }

    setPersonalForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
    })
  }, [profile])

  function openEditForm() {
    setShowPasswordForm(false)
    setPasswordSuccess('')
    setPasswordError('')
    setPasswordFieldErrors({})
    setProfileSuccess('')
    setProfileError('')
    setProfileFieldErrors({})
    setShowEditForm(true)
  }

  function openPasswordForm() {
    setShowEditForm(false)
    setProfileSuccess('')
    setProfileError('')
    setProfileFieldErrors({})
    setPasswordSuccess('')
    setPasswordError('')
    setPasswordFieldErrors({})
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: '',
    })
    setShowPasswordForm(true)
  }

  function handlePersonalChange(event) {
    const { name, value } = event.target
    setPersonalForm((prev) => ({ ...prev, [name]: value }))
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setSavingProfile(true)
    setProfileSuccess('')
    setProfileError('')
    setProfileFieldErrors({})

    try {
      const response = await parentApi.updateProfile(personalForm)
      setProfile(response.data.profile)
      setProfileSuccess(response.message || 'Profile updated successfully')
      await checkAuth()
      setShowEditForm(false)
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile')
      setProfileFieldErrors(err.errors || {})
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setChangingPassword(true)
    setPasswordSuccess('')
    setPasswordError('')
    setPasswordFieldErrors({})

    try {
      const response = await parentApi.changePassword(passwordForm)
      setPasswordSuccess(response.message || 'Password changed successfully')
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })
      setShowPasswordForm(false)
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password')
      setPasswordFieldErrors(err.errors || {})
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading profile..." />
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Unable to load profile'}
        </div>
        <button
          type="button"
          onClick={refetch}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-primary-600">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">My Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          View and update your parent account details.
        </p>
      </header>

      <Alert type="success" message={profileSuccess} onDismiss={() => setProfileSuccess('')} />
      <Alert type="success" message={passwordSuccess} onDismiss={() => setPasswordSuccess('')} />

      <ProfileSection title="Account Information" description="Your parent account details.">
        <dl className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Full Name" value={profile.full_name} />
          <ReadOnlyField label="Parent ID" value={profile.parent_id} />
          <ReadOnlyField label="Email" value={profile.email} />
          <ReadOnlyField label="Account Status">
            <StatusBadge status={profile.account_status} />
          </ReadOnlyField>
          <ReadOnlyField label="Account Creation Date" value={formatDate(profile.created_at)} />
        </dl>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            onClick={openEditForm}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={openPasswordForm}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Change Password
          </button>
        </div>
      </ProfileSection>

      {showEditForm && (
        <ProfileSection title="Personal Information" description="Update your name and email address.">
          <Alert type="error" message={profileError} onDismiss={() => setProfileError('')} />

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="First Name"
                id="first_name"
                name="first_name"
                value={personalForm.first_name}
                onChange={handlePersonalChange}
                error={profileFieldErrors.first_name}
                required
                autoComplete="given-name"
              />
              <FormField
                label="Last Name"
                id="last_name"
                name="last_name"
                value={personalForm.last_name}
                onChange={handlePersonalChange}
                error={profileFieldErrors.last_name}
                required
                autoComplete="family-name"
              />
            </div>

            <FormField
              label="Email"
              id="email"
              name="email"
              type="email"
              value={personalForm.email}
              onChange={handlePersonalChange}
              error={profileFieldErrors.email}
              required
              autoComplete="email"
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
                disabled={savingProfile}
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </ProfileSection>
      )}

      {showPasswordForm && (
        <ProfileSection
          title="Security"
          description="Change your password. Use a strong password you do not use elsewhere."
        >
          <Alert type="error" message={passwordError} onDismiss={() => setPasswordError('')} />

          <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5">
            <FormField
              label="Current Password"
              id="current_password"
              name="current_password"
              type="password"
              value={passwordForm.current_password}
              onChange={handlePasswordChange}
              error={passwordFieldErrors.current_password}
              required
              autoComplete="current-password"
            />
            <FormField
              label="New Password"
              id="new_password"
              name="new_password"
              type="password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              error={passwordFieldErrors.new_password}
              required
              autoComplete="new-password"
            />
            <FormField
              label="Confirm New Password"
              id="confirm_password"
              name="confirm_password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordChange}
              error={passwordFieldErrors.confirm_password}
              required
              autoComplete="new-password"
            />

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </ProfileSection>
      )}
    </div>
  )
}
