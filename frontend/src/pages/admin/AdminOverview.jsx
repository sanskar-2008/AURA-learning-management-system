import NavCard from '../../components/NavCard'
import StatCard from '../../components/StatCard'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_NAV_ITEMS } from '../../constants/adminDashboard'
import { useAdminDashboard } from '../../hooks/useAdminData'

export default function AdminOverview() {
  const { user } = useAuth()
  const { summary, loading, error } = useAdminDashboard()

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-primary-600">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Hello, {user?.first_name}!
        </h1>
        <p className="mt-2 text-sm text-slate-500">System administration overview</p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Summary</h2>
        {loading ? (
          <LoadingState message="Loading dashboard..." />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Students"
              value={summary?.total_students ?? 0}
              icon="students"
              accent="primary"
            />
            <StatCard
              label="Total Teachers"
              value={summary?.total_teachers ?? 0}
              icon="child"
              accent="amber"
            />
            <StatCard
              label="Total Courses"
              value={summary?.total_courses ?? 0}
              icon="courses"
              accent="green"
            />
            <StatCard
              label="Total Assignments"
              value={summary?.total_assignments ?? 0}
              icon="assignments"
              accent="primary"
            />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavCard key={item.path} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}
