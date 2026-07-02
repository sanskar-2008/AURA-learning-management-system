import { apiRequest, apiUpload } from './http'

export const studentApi = {
  getDashboard: () => apiRequest('/student/dashboard'),
  getCourses: () => apiRequest('/student/courses'),
  browseCourses: ({ search = '', enrollableOnly = false } = {}) => {
    const params = new URLSearchParams()
    if (search) {
      params.set('search', search)
    }
    if (enrollableOnly) {
      params.set('enrollable_only', 'true')
    }
    const query = params.toString()
    return apiRequest(`/student/courses/browse${query ? `?${query}` : ''}`)
  },
  getCourse: (courseId) => apiRequest(`/student/courses/${courseId}`),
  enrollInCourse: (courseId) =>
    apiRequest(`/student/courses/${courseId}/enroll`, { method: 'POST' }),
  getAvailableCourses: () => apiRequest('/student/courses/available'),
  getAssignments: () => apiRequest('/student/assignments'),
  getAssignment: (assignmentId) => apiRequest(`/student/assignments/${assignmentId}`),
  submitAssignment: (assignmentId, formData) =>
    apiUpload(`/student/assignments/${assignmentId}/submit`, formData),
  getProfile: () => apiRequest('/student/profile'),
  updateProfile: (data) =>
    apiRequest('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (data) =>
    apiRequest('/student/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getCourseMaterials: (courseId) => apiRequest(`/student/courses/${courseId}/materials`),
  getGrades: ({ courseId = '' } = {}) => {
    const params = new URLSearchParams()
    if (courseId) params.set('course_id', courseId)
    const query = params.toString()
    return apiRequest(`/student/grades${query ? `?${query}` : ''}`)
  },
  getQuizzes: () => apiRequest('/student/quizzes'),
  getQuiz: (quizId) => apiRequest(`/student/quizzes/${quizId}`),
  submitQuiz: (quizId, data) =>
    apiRequest(`/student/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getQuizResult: (quizId) => apiRequest(`/student/quizzes/${quizId}/result`),
}

export default studentApi
