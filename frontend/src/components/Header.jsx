import { Link, useNavigate } from 'react-router-dom'
import { APP_NAME } from '../constants/branding'
import { useAuth } from '../context/AuthContext'
import { getDashboardPath } from '../utils/roles'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            AC
          </div>
          <span className="text-lg font-semibold text-slate-900">{APP_NAME}</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link
                to={getDashboardPath(user.role)}
                className="font-medium text-slate-700 hover:text-primary-600"
              >
                Dashboard
              </Link>
              <span className="text-slate-500">{user.full_name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium text-slate-700 hover:text-primary-600">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-primary-600 px-3 py-1.5 font-medium text-white transition hover:bg-primary-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
