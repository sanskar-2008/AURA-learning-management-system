import { useParentContext } from '../context/ParentContext'

export default function ChildSelector() {
  const { linkedChildren, selectedChildId, setSelectedChildId } = useParentContext()

  if (linkedChildren.length <= 1) {
    if (!linkedChildren.length) {
      return null
    }

    return (
      <p className="text-sm text-slate-600">
        Viewing: <span className="font-medium text-slate-900">{linkedChildren[0].full_name}</span>
      </p>
    )
  }

  return (
    <div className="max-w-xs">
      <label htmlFor="child-selector" className="mb-1.5 block text-sm font-medium text-slate-700">
        Select Child
      </label>
      <select
        id="child-selector"
        value={selectedChildId ?? ''}
        onChange={(event) => setSelectedChildId(Number(event.target.value))}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500"
      >
        {linkedChildren.map((child) => (
          <option key={child.id} value={child.id}>
            {child.full_name} ({child.student_number})
          </option>
        ))}
      </select>
    </div>
  )
}
