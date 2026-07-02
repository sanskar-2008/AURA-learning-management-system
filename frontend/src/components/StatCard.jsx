import DashboardIcon from './DashboardIcon'

export default function StatCard({ label, value, icon, accent = 'primary' }) {
  const accentStyles = {
    primary: 'bg-primary-50 text-primary-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${accentStyles[accent]}`}>
          <DashboardIcon name={icon} className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
