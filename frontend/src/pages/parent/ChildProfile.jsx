import LoadingState from '../../components/LoadingState'
import { useParentContext } from '../../context/ParentContext'
import { useChildProfile } from '../../hooks/useParentData'
import { formatDate } from '../../utils/assignmentStatus'

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  )
}

export default function ChildProfile() {
  const { selectedChildId } = useParentContext()
  const { data, loading, error } = useChildProfile(selectedChildId)
  const profile = data?.profile

  if (loading) {
    return <LoadingState message="Loading child profile..." />
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error || 'Unable to load child profile'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-primary-600">Child Profile</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{profile.full_name}</h1>
        <p className="mt-2 text-sm text-slate-600">Read-only view of your linked child&apos;s information.</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-6 sm:grid-cols-2">
          <ReadOnlyField label="Full Name" value={profile.full_name} />
          <ReadOnlyField label="Student ID" value={profile.student_id} />
          <ReadOnlyField label="Student Roll Number" value={profile.student_number} />
          <ReadOnlyField label="Email" value={profile.email} />
          <ReadOnlyField label="Grade Level" value={profile.grade_level} />
          <ReadOnlyField label="Linked At" value={formatDate(profile.linked_at)} />
        </dl>
      </section>
    </div>
  )
}
