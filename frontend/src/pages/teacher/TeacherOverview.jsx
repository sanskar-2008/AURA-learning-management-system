import NavCard from '../../components/NavCard'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import {
  TEACHER_NAV_ITEMS,
  TEACHER_SUMMARY,
} from '../../constants/teacherDashboard'

export default function TeacherOverview() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-primary-600">Welcome back</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Hello, {user?.first_name}!
        </h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          Teacher ID: {user?.employee_id || '—'}
        </p>
        <p className="mt-1 text-sm text-slate-500">Dashboard overview</p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total Courses"
            value={TEACHER_SUMMARY.total_courses}
            icon="courses"
            accent="primary"
          />
          <StatCard
            label="Total Students"
            value={TEACHER_SUMMARY.total_students}
            icon="students"
            accent="amber"
          />
          <StatCard
            label="Active Assignments"
            value={TEACHER_SUMMARY.active_assignments}
            icon="assignments"
            accent="green"
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Quick Access</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TEACHER_NAV_ITEMS.map((item) => (
            <NavCard key={item.path} {...item} />
          ))}
        </div>
      </section>
    </div>
  )
}
