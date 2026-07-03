function getApiRoot() {
  return import.meta.env.VITE_API_URL?.replace(/\/+$/, '') ?? ''
}

export function buildApiUrl(endpoint) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const apiPath = path.startsWith('/api') ? path : `/api${path}`
  const apiRoot = getApiRoot()

  if (apiRoot) {
    return `${apiRoot}${apiPath}`
  }

  return apiPath
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
  if (apiRoot && path.startsWith('/api')) {
    return `${apiRoot}${path}`
  }

  if (apiRoot) {
    return buildApiUrl(path)
  }

  return path
}

export async function downloadAuthenticatedFile(filePath, downloadName) {
  const response = await fetch(resolveApiUrl(filePath), {
    credentials: 'include',
  })

  if (!response.ok) {
    let message = `Download failed (${response.status})`
    try {
      const data = await response.json()
      message = data?.message || message
    } catch {
      // Response was not JSON (e.g. HTML error page).
    }
    throw new Error(message)
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = downloadName || 'download'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

async function parseResponse(response) {
  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error('Received an invalid response from the server.')
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`)
    error.errors = data?.errors
    error.status = response.status
    throw error
  }

  if (data === null) {
    throw new Error('Received an empty response from the server.')
  }

  return data
}

function connectionErrorMessage() {
  if (import.meta.env.DEV) {
    return 'Unable to reach the server. Make sure the backend is running on port 5000.'
  }

  return 'Unable to reach the server. Please try again later.'
}

export async function apiRequest(endpoint, options = {}) {
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  let response
  try {
    response = await fetch(buildApiUrl(endpoint), config)
  } catch {
    throw new Error(connectionErrorMessage())
  }

  return parseResponse(response)
}

export async function apiUpload(endpoint, formData, { method = 'POST' } = {}) {
  let response
  try {
    response = await fetch(buildApiUrl(endpoint), {
      method,
      credentials: 'include',
      body: formData,
    })
  } catch {
    throw new Error(connectionErrorMessage())
  }

  return parseResponse(response)
}
