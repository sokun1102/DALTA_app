import { serviceBaseUrl } from '../config/api'
import { getAuthToken, clearAuthToken } from './authToken'

export function authHeaders() {
  const token = getAuthToken()
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
}

export async function apiFetch(path, options = {}) {
  const { auth = false, headers = {}, timeoutMs = 10000, ...fetchOptions } = options
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  const isFormData = fetchOptions.body instanceof FormData
  const baseHeaders = auth
    ? authHeaders()
    : { 'Content-Type': 'application/json' }

  if (isFormData) {
    delete baseHeaders['Content-Type']
  }

  let response
  try {
    response = await fetch(`${serviceBaseUrl(path)}${path}`, {
      ...fetchOptions,
      signal: fetchOptions.signal || controller.signal,
      headers: {
        ...baseHeaders,
        ...headers,
      },
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Kết nối API quá lâu. Vui lòng kiểm tra service backend và thử lại.')
    }
    if (error instanceof TypeError) {
      throw new Error('Không kết nối được API. Vui lòng kiểm tra service backend và thử lại.')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }

  if (response.status === 401) {
    clearAuthToken()
    window.dispatchEvent(new Event('auth-unauthorized'))
  }

  const text = await response.text()
  let data = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || data || 'Request failed')
  }

  return data
}
