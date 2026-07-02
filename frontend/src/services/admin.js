import { apiRequest } from './http'

function withSearch(path, search) {
  const params = new URLSearchParams()
  if (search) {
    params.set('search', search)
  }
  const query = params.toString()
  return `${path}${query ? `?${query}` : ''}`
}

export const adminApi = {
  getDashboard: () => apiRequest('/admin/dashboard'),
  getStudents: ({ search = '' } = {}) => apiRequest(withSearch('/admin/students', search)),
  getTeachers: ({ search = '' } = {}) => apiRequest(withSearch('/admin/teachers', search)),
  updateUserStatus: (userId, isActive) =>
    apiRequest(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ is_active: isActive }),
    }),
  getCourses: ({ search = '' } = {}) => apiRequest(withSearch('/admin/courses', search)),
  getCourse: (courseId) => apiRequest(`/admin/courses/${courseId}`),
  updateCourse: (courseId, data) =>
    apiRequest(`/admin/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCourse: (courseId) =>
    apiRequest(`/admin/courses/${courseId}`, { method: 'DELETE' }),
  getCoursesForSelect: () => apiRequest('/admin/courses/select'),
  getAssignments: ({ search = '' } = {}) => apiRequest(withSearch('/admin/assignments', search)),
  getAssignment: (assignmentId) => apiRequest(`/admin/assignments/${assignmentId}`),
  updateAssignment: (assignmentId, data) =>
    apiRequest(`/admin/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAssignment: (assignmentId) =>
    apiRequest(`/admin/assignments/${assignmentId}`, { method: 'DELETE' }),
  getProfile: () => apiRequest('/admin/profile'),
  updateProfile: (data) =>
    apiRequest('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

export default adminApi
