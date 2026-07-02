export function getYouTubeEmbedUrl(url) {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/shorts\/([\w-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}`
    }
  }

  return null
}

export function getVimeoEmbedUrl(url) {
  if (!url) return null
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}` : null
}

export function getVideoEmbedUrl(url) {
  return getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)
}

export function isDirectVideoUrl(url) {
  if (!url) return false
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
}
