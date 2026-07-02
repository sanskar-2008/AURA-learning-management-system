import { Link } from 'react-router-dom'
import NavCard from '../../components/NavCard'
import StatCard from '../../components/StatCard'
import LoadingState from '../../components/LoadingState'
import { useAuth } from '../../context/AuthContext'
import { useParentContext } from '../../context/ParentContext'
import { PARENT_BASE_PATH, PARENT_NAV_ITEMS } from '../../constants/parentDashboard'
import { useParentDashboard } from '../../hooks/useParentData'

export default function ParentOverview() {
  const { user } = useAuth()
  const { selectedChildId, selectedChild } = useParentContext()
  const { data, loading, error } = useParentDashboard(selectedChildId)

  if (loading) {
    return <LoadingState message="Loading dashboard..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  const summary = data?.summary ?? {}

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-primary-600">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Hello, {user?.first_name}!
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Parent ID: {user?.parent_id || '—'}
        </p>
        {selectedChild && (
          <p className="mt-1 text-sm text-slate-500">
            Viewing child: {selectedChild.full_name} ({selectedChild.student_number})
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Enrolled Courses"
            value={summary.total_enrolled_courses ?? 0}
            icon="courses"
            accent="primary"
          />
          <StatCard
            label="Pending Assignments"
            value={summary.pending_assignments ?? 0}
            icon="assignments"
            accent="amber"
          />
          <StatCard
            label="Attendance Percentage"
            value={summary.attendance_percentage ?? '0%'}
            icon="attendance"
            accent="green"
          />
          <StatCard
            label="Outstanding Fees"
            value={summary.outstanding_fees ?? 0}
            icon="fees"
            accent="primary"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary-700">Child Learning Dashboard</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              View courses, grades, and assignment submissions
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Track your child&apos;s academic progress in one place.
            </p>
          </div>
          <Link
            to={`${PARENT_BASE_PATH}/progress`}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            Open Learning Dashboard
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {PARENT_NAV_ITEMS.map((item) => (
            <NavCard key={item.path} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}
