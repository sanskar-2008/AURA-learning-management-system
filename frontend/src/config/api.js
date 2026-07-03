export const DEFAULT_PRODUCTION_API_URL =
  'https://aura-learning-management-system.onrender.com'

export function getApiRoot() {
  const configured = import.meta.env.VITE_API_URL?.trim()
  if (configured) {
    return configured.replace(/\/+$/, '')
  }

  if (import.meta.env.PROD) {
    return DEFAULT_PRODUCTION_API_URL
  }

  return ''
}

export const API_BASE_URL = getApiRoot() ? `${getApiRoot()}/api` : '/api'

export function buildApiUrl(endpoint) {
  const apiRoot = getApiRoot()
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const apiPath = path.startsWith('/api') ? path : `/api${path}`

  if (apiRoot) {
    return `${apiRoot}${apiPath}`
  }

  return apiPath
}

export function resolveApiUrl(path) {
  if (!path || path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const apiRoot = getApiRoot()
  if (apiRoot && path.startsWith('/api')) {
    return `${apiRoot}${path}`
  }

  if (apiRoot) {
    return buildApiUrl(path)
  }

  return path
}
