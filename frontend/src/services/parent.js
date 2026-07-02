import { apiRequest } from './http'

export const parentApi = {
  getDashboard: (studentId) => {
    const params = studentId ? `?student_id=${studentId}` : ''
    return apiRequest(`/parent/dashboard${params}`)
  },
  getChildren: () => apiRequest('/parent/children'),
  linkChild: (studentNumber) =>
    apiRequest('/parent/children/link', {
      method: 'POST',
      body: JSON.stringify({ student_number: studentNumber }),
    }),
  getChildProfile: (studentId) => apiRequest(`/parent/children/${studentId}/profile`),
  getChildCourses: (studentId) => apiRequest(`/parent/children/${studentId}/courses`),
  getChildCourse: (studentId, courseId) =>
    apiRequest(`/parent/children/${studentId}/courses/${courseId}`),
  getChildAssignments: (studentId) => apiRequest(`/parent/children/${studentId}/assignments`),
  getChildAttendance: (studentId) => apiRequest(`/parent/children/${studentId}/attendance`),
  getChildGrades: (studentId) => apiRequest(`/parent/children/${studentId}/grades`),
  getChildQuizResults: (studentId) => apiRequest(`/parent/children/${studentId}/quizzes`),
  getChildProgress: (studentId) => apiRequest(`/parent/children/${studentId}/progress`),
  getChildLearningDashboard: (studentId) =>
    apiRequest(`/parent/children/${studentId}/learning-dashboard`),
  getChildFees: (studentId) => apiRequest(`/parent/children/${studentId}/fees`),
  payFee: (studentId, feeId) =>
    apiRequest(`/parent/children/${studentId}/fees/${feeId}/pay`, { method: 'POST' }),
  getProfile: () => apiRequest('/parent/profile'),
  updateProfile: (data) =>
    apiRequest('/parent/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (data) =>
    apiRequest('/parent/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

export default parentApi
