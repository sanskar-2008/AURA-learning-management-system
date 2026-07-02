import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} AURA course. All rights reserved.
      </footer>
    </div>
  )
}
