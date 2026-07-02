import { useAuth } from '../context/AuthContext'

export default function DashboardShell({ title, description, roleLabel }) {
  const { user } = useAuth()

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <span className="mb-3 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
          {roleLabel}
        </span>
        <h1 className="mb-3 text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mb-6 max-w-2xl text-slate-600">{description}</p>
        <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-700">
          <p>
            Signed in as <strong>{user?.full_name}</strong> ({user?.email})
          </p>
        </div>
      </div>
    </section>
  )
}
