import StatusBadge from './StatusBadge'

export default function UserManagementTable({ users, idLabel, idKey, onToggleStatus, pendingId }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">{idLabel}</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{user[idKey] || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{user.full_name}</td>
              <td className="px-4 py-3 text-slate-600">{user.email}</td>
              <td className="px-4 py-3">
                <StatusBadge status={user.account_status} />
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onToggleStatus(user)}
                  disabled={pendingId === user.id}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    user.is_active
                      ? 'border-red-200 text-red-700 hover:bg-red-50'
                      : 'border-green-200 text-green-700 hover:bg-green-50'
                  }`}
                >
                  {pendingId === user.id
                    ? 'Saving...'
                    : user.is_active
                      ? 'Deactivate'
                      : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
