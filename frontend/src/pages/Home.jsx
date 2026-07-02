import { useApp } from '../context/AppContext'
import { useHealthCheck } from '../hooks/useHealthCheck'

export default function Home() {
  const { appName } = useApp()
  const { status, loading, error } = useHealthCheck()

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-primary-600">
          Welcome
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900">
          {appName}
        </h1>
        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-slate-600">
          A modern learning management platform built with React, Flask, and SQLite.
          Sign up as a student, teacher, or parent — or sign in to access your dashboard.
        </p>

        <div className="rounded-xl bg-slate-50 p-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            API Status
          </h2>
          {loading && <p className="text-slate-600">Checking backend connection...</p>}
          {error && (
            <p className="text-red-600">
              Backend unavailable: {error}
            </p>
          )}
          {status && (
            <div className="flex flex-wrap gap-4 text-sm text-slate-700">
              <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
                {status.status}
              </span>
              <span>Service: {status.service}</span>
              <span>Database: {status.database}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
