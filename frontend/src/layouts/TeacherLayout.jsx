import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../constants/branding'
import { useAuth } from '../context/AuthContext'
import { TEACHER_BASE_PATH, TEACHER_SIDEBAR_LINKS } from '../constants/teacherDashboard'

function navLinkClass({ isActive }) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-primary-50 text-primary-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

export default function TeacherLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to={TEACHER_BASE_PATH} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              AC
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{APP_NAME}</p>
              <p className="text-xs text-slate-500">Teacher Portal</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="mb-6 lg:mb-0">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Navigation
            </p>
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {TEACHER_SIDEBAR_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === TEACHER_BASE_PATH}
                  className={navLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
