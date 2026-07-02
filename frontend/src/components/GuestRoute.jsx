import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardPath } from '../utils/roles'

export default function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />
  }

  return <Outlet />
}
