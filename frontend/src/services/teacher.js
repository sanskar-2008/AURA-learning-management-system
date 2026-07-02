import { apiRequest, apiUpload } from './http'

export const teacherApi = {
  getProfile: () => apiRequest('/teacher/profile'),
  updateProfile: (data) =>
    apiRequest('/teacher/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (data) =>
    apiRequest('/teacher/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getCourses: ({ search = '' } = {}) => {
    const params = new URLSearchParams()
    if (search) {
      params.set('search', search)
    }
    const query = params.toString()
    return apiRequest(`/teacher/courses${query ? `?${query}` : ''}`)
  },
  getCourse: (courseId) => apiRequest(`/teacher/courses/${courseId}`),
  createCourse: (data) =>
    apiRequest('/teacher/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCourse: (courseId, data) =>
    apiRequest(`/teacher/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCourse: (courseId) =>
    apiRequest(`/teacher/courses/${courseId}`, {
      method: 'DELETE',
    }),
  getCourseStudents: (courseId) => apiRequest(`/teacher/courses/${courseId}/students`),
  getAssignments: ({ search = '', courseId = '' } = {}) => {
    const params = new URLSearchParams()
    if (search) {
      params.set('search', search)
    }
    if (courseId) {
      params.set('course_id', courseId)
    }
    const query = params.toString()
    return apiRequest(`/teacher/assignments${query ? `?${query}` : ''}`)
  },
  getAssignment: (assignmentId) => apiRequest(`/teacher/assignments/${assignmentId}`),
  createAssignment: (formData) =>
    apiUpload('/teacher/assignments', formData),
  updateAssignment: (assignmentId, formData) =>
    apiUpload(`/teacher/assignments/${assignmentId}`, formData, { method: 'PUT' }),
  deleteAssignment: (assignmentId) =>
    apiRequest(`/teacher/assignments/${assignmentId}`, {
      method: 'DELETE',
    }),
  getAssignmentSubmissions: (assignmentId) =>
    apiRequest(`/teacher/assignments/${assignmentId}/submissions`),
  getMaterialsOverview: () => apiRequest('/teacher/materials'),
  getCourseMaterials: (courseId) => apiRequest(`/teacher/courses/${courseId}/materials`),
  getMaterial: (courseId, materialId) =>
    apiRequest(`/teacher/courses/${courseId}/materials/${materialId}`),
  uploadMaterial: (courseId, formData) =>
    apiUpload(`/teacher/courses/${courseId}/materials`, formData),
  updateMaterial: (courseId, materialId, formData) =>
    apiUpload(`/teacher/courses/${courseId}/materials/${materialId}`, formData, {
      method: 'PUT',
    }),
  deleteMaterial: (courseId, materialId) =>
    apiRequest(`/teacher/courses/${courseId}/materials/${materialId}`, {
      method: 'DELETE',
    }),
  getGrades: ({ courseId = '', studentId = '' } = {}) => {
    const params = new URLSearchParams()
    if (courseId) params.set('course_id', courseId)
    if (studentId) params.set('student_id', studentId)
    const query = params.toString()
    return apiRequest(`/teacher/grades${query ? `?${query}` : ''}`)
  },
  getCourseGrades: (courseId) => apiRequest(`/teacher/courses/${courseId}/grades`),
  getGrade: (courseId, gradeId) => apiRequest(`/teacher/courses/${courseId}/grades/${gradeId}`),
  createGrade: (courseId, data) =>
    apiRequest(`/teacher/courses/${courseId}/grades`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGrade: (courseId, gradeId, data) =>
    apiRequest(`/teacher/courses/${courseId}/grades/${gradeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGrade: (courseId, gradeId) =>
    apiRequest(`/teacher/courses/${courseId}/grades/${gradeId}`, {
      method: 'DELETE',
    }),
  getQuizzes: ({ courseId = '' } = {}) => {
    const params = new URLSearchParams()
    if (courseId) params.set('course_id', courseId)
    const query = params.toString()
    return apiRequest(`/teacher/quizzes${query ? `?${query}` : ''}`)
  },
  getQuiz: (quizId) => apiRequest(`/teacher/quizzes/${quizId}`),
  createQuiz: (data) =>
    apiRequest('/teacher/quizzes', { method: 'POST', body: JSON.stringify(data) }),
  updateQuiz: (quizId, data) =>
    apiRequest(`/teacher/quizzes/${quizId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteQuiz: (quizId) =>
    apiRequest(`/teacher/quizzes/${quizId}`, { method: 'DELETE' }),
  getQuizResults: (quizId) => apiRequest(`/teacher/quizzes/${quizId}/results`),
}

export default teacherApi
