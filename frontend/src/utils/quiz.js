export function toDateTimeLocalValue(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function quizStatusLabel(status) {
  if (status === 'active') return 'Active'
  if (status === 'upcoming') return 'Upcoming'
  return 'Closed'
}

export function quizStatusClass(status) {
  if (status === 'active') return 'bg-green-50 text-green-700'
  if (status === 'upcoming') return 'bg-blue-50 text-blue-700'
  return 'bg-slate-100 text-slate-600'
}
