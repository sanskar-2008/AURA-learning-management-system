import { Link } from 'react-router-dom'
import DashboardIcon from './DashboardIcon'

export default function NavCard({ title, description, to, path, icon }) {
  return (
    <Link
      to={to || path}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary-200 hover:shadow-md"
    >
      <div className="mb-4 inline-flex rounded-xl bg-primary-50 p-3 text-primary-600 transition group-hover:bg-primary-100">
        <DashboardIcon name={icon} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <span className="mt-4 inline-flex text-sm font-medium text-primary-600 group-hover:text-primary-700">
        Open →
      </span>
    </Link>
  )
}
