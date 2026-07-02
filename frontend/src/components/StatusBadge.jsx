export default function StatusBadge({ status }) {
  const isActive = status === 'active'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
