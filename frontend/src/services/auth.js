import { apiRequest } from './http'

export const authApi = {
  signup: (data) => apiRequest('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getAdminCaptcha: () => apiRequest('/auth/admin/captcha'),
  adminLogin: (data) =>
    apiRequest('/auth/admin/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
}

export default authApi
