import { apiRequest } from './http'

export const api = {
  getHealth: () => apiRequest('/health'),
}

export default api
