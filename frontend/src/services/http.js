import { buildApiUrl, getApiBaseUrl, getApiRoot, resolveApiUrl } from '../config/api'

export { buildApiUrl, getApiBaseUrl, getApiRoot, resolveApiUrl }

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

function connectionErrorMessage(error) {
  if (import.meta.env.DEV) {
    return 'Unable to reach the server. Make sure the backend is running locally.'
  }

  if (error instanceof TypeError) {
    return 'Unable to reach the API. Check that CORS_ORIGINS on Render includes your Vercel URL.'
  }

  return 'Unable to reach the server. Please try again later.'
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

export async function apiRequest(endpoint, options = {}) {
  const url = buildApiUrl(endpoint)
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
    response = await fetch(url, config)
  } catch (error) {
    throw new Error(connectionErrorMessage(error))
  }

  return parseResponse(response)
}

export async function apiUpload(endpoint, formData, { method = 'POST' } = {}) {
  const url = buildApiUrl(endpoint)

  let response
  try {
    response = await fetch(url, {
      method,
      credentials: 'include',
      body: formData,
    })
  } catch (error) {
    throw new Error(connectionErrorMessage(error))
  }

  return parseResponse(response)
}
