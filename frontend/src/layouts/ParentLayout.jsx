import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import ChildSelector from '../components/ChildSelector'
import LoadingState from '../components/LoadingState'
import { APP_NAME } from '../constants/branding'
import { useAuth } from '../context/AuthContext'
import { ParentProvider, useParentContext } from '../context/ParentContext'
import {
  PARENT_BASE_PATH,
  PARENT_LINK_PATH,
  PARENT_SIDEBAR_LINKS,
} from '../constants/parentDashboard'

function navLinkClass({ isActive }) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-primary-50 text-primary-700'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')
}

function ParentLayoutContent() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { hasChildren, loading } = useParentContext()

  const isLinkPage = location.pathname === PARENT_LINK_PATH

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <p className="text-lg font-semibold text-slate-900">{APP_NAME}</p>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <LoadingState message="Loading parent dashboard..." />
        </div>
      </div>
    )
  }

  if (!hasChildren && !isLinkPage) {
    return <Navigate to={PARENT_LINK_PATH} replace />
  }

  if (isLinkPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
                AC
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{APP_NAME}</p>
                <p className="text-xs text-slate-500">Parent Portal</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to={PARENT_BASE_PATH} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              AC
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{APP_NAME}</p>
              <p className="text-xs text-slate-500">Parent Portal</p>
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
              {PARENT_SIDEBAR_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === PARENT_BASE_PATH}
                  className={navLinkClass}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <ChildSelector />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function ParentLayout() {
  return (
    <ParentProvider>
      <ParentLayoutContent />
    </ParentProvider>
  )
}
