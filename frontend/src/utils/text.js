export function truncateWords(text, maxWords = 6) {
  if (!text) {
    return ''
  }

  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length <= maxWords) {
    return text.trim()
  }

  return `${words.slice(0, maxWords).join(' ')}…`
}

export function formatFileSize(bytes) {
  if (!bytes) {
    return '0 B'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
