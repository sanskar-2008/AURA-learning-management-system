import NavCard from '../../components/NavCard'
import StatCard from '../../components/StatCard'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { STUDENT_NAV_ITEMS } from '../../constants/studentDashboard'
import { useStudentDashboard } from '../../hooks/useStudentData'

export default function StudentOverview() {
  const { user } = useAuth()
  const { data, loading, error } = useStudentDashboard()

  const summary = data?.summary ?? {
    enrolled_courses: 0,
    pending_assignments: 0,
    completed_assignments: 0,
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-primary-600">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Hello, {user?.first_name}!
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Student ID: {user?.student_number || '—'}
        </p>
        <p className="mt-1 text-sm text-slate-500">Dashboard overview</p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Summary</h2>
        {loading ? (
          <LoadingState message="Loading summary..." />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Total Enrolled Courses"
              value={summary.enrolled_courses}
              icon="chart"
              accent="primary"
            />
            <StatCard
              label="Pending Assignments"
              value={summary.pending_assignments}
              icon="clock"
              accent="amber"
            />
            <StatCard
              label="Completed Assignments"
              value={summary.completed_assignments}
              icon="check"
              accent="green"
            />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {STUDENT_NAV_ITEMS.map((item) => (
            <NavCard key={item.path} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}
