import { Link, Outlet } from 'react-router-dom'
import { APP_NAME } from '../constants/branding'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              AC
            </div>
            <span className="text-lg font-semibold text-slate-900">{APP_NAME}</span>
          </Link>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
            Back to Home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Outlet />
      </main>
    </div>
  )
}
