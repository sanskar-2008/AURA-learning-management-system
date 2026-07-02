export const ADMIN_BASE_PATH = '/dashboard/admin'

export const ADMIN_NAV_ITEMS = [
  {
    title: 'Students',
    description: 'View students and manage account status',
    path: `${ADMIN_BASE_PATH}/students`,
    icon: 'students',
  },
  {
    title: 'Teachers',
    description: 'View teachers and manage account status',
    path: `${ADMIN_BASE_PATH}/teachers`,
    icon: 'child',
  },
  {
    title: 'Courses',
    description: 'View, edit, and delete courses',
    path: `${ADMIN_BASE_PATH}/courses`,
    icon: 'courses',
  },
  {
    title: 'Assignments',
    description: 'View, edit, and delete assignments',
    path: `${ADMIN_BASE_PATH}/assignments`,
    icon: 'assignments',
  },
  {
    title: 'Profile',
    description: 'View and update your admin account',
    path: `${ADMIN_BASE_PATH}/profile`,
    icon: 'profile',
  },
]

export const ADMIN_SIDEBAR_LINKS = [
  { label: 'Overview', path: ADMIN_BASE_PATH },
  ...ADMIN_NAV_ITEMS.map(({ title, path }) => ({ label: title, path })),
]
