/**
 * Production API host. Baked in at build time via VITE_API_URL.
 * Local dev uses the Vite proxy when this is empty.
 */
const PRODUCTION_API_ROOT = 'https://aura-learning-management-system.onrender.com'

function readConfiguredApiRoot() {
  const value = import.meta.env.VITE_API_URL
  if (typeof value === 'string' && value.trim()) {
    return value.trim().replace(/\/+$/, '')
  }
  return ''
}

export function getApiRoot() {
  const configured = readConfiguredApiRoot()
  if (configured) {
    return configured
  }

  if (import.meta.env.PROD) {
    return PRODUCTION_API_ROOT
  }

  return ''
}

export function buildApiUrl(endpoint) {
  const apiRoot = getApiRoot()
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const apiPath = path.startsWith('/api') ? path : `/api${path}`

  if (!apiRoot) {
    return apiPath
  }

  return `${apiRoot}${apiPath}`
}

export function getApiBaseUrl() {
  const apiRoot = getApiRoot()
  return apiRoot ? `${apiRoot}/api` : '/api'
}

export function resolveApiUrl(path) {
  if (!path || path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  const apiRoot = getApiRoot()
  if (!apiRoot) {
    return path
  }

  if (path.startsWith('/api')) {
    return `${apiRoot}${path}`
  }

  return buildApiUrl(path)
}
