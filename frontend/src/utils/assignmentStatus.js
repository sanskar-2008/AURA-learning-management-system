export const ASSIGNMENT_STATUS_LABELS = {
  pending: 'Pending',
  submitted: 'Submitted',
}

export const SUBMISSION_STATUS_LABELS = {
  submitted: 'Submitted',
  late: 'Late',
  graded: 'Graded',
  returned: 'Returned',
}

export function formatDateTime(value) {
  if (!value) {
    return null
  }
  return new Date(value).toLocaleString()
}

export function formatDate(value) {
  if (!value) {
    return null
  }
  return new Date(value).toLocaleDateString()
}

export function toDatetimeLocalValue(isoString) {
  if (!isoString) {
    return ''
  }

  const date = new Date(isoString)
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
