import EmptyState from './EmptyState'

export default function StudentSectionPlaceholder({ title }) {
  return (
    <EmptyState
      title={title}
      message={`${title} content will be available here in a future update.`}
    />
  )
}
