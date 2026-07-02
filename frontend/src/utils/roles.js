export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PARENT: 'parent',
  ADMIN: 'admin',
}

export const DASHBOARD_PATHS = {
  [ROLES.STUDENT]: '/dashboard/student',
  [ROLES.TEACHER]: '/dashboard/teacher',
  [ROLES.PARENT]: '/dashboard/parent',
  [ROLES.ADMIN]: '/dashboard/admin',
}

export function getDashboardPath(role) {
  return DASHBOARD_PATHS[role] || '/'
}
