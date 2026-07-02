export const STUDENT_BASE_PATH = '/dashboard/student'

export const STUDENT_NAV_ITEMS = [
  {
    title: 'My Courses',
    description: 'View your enrolled courses and progress',
    path: `${STUDENT_BASE_PATH}/courses`,
    icon: 'courses',
  },
  {
    title: 'Search Courses',
    description: 'Browse and discover available courses',
    path: `${STUDENT_BASE_PATH}/search`,
    icon: 'search',
  },
  {
    title: 'Enroll Course',
    description: 'Register for a new course',
    path: `${STUDENT_BASE_PATH}/enroll`,
    icon: 'enroll',
  },
  {
    title: 'Assignments',
    description: 'Track pending and completed work',
    path: `${STUDENT_BASE_PATH}/assignments`,
    icon: 'assignments',
  },
  {
    title: 'Marks & Grades',
    description: 'View your marks, grades, and teacher remarks',
    path: `${STUDENT_BASE_PATH}/grades`,
    icon: 'grades',
  },
  {
    title: 'Quizzes & Tests',
    description: 'Attempt quizzes and view your results',
    path: `${STUDENT_BASE_PATH}/quizzes`,
    icon: 'assignments',
  },
  {
    title: 'Profile',
    description: 'Manage your account details',
    path: `${STUDENT_BASE_PATH}/profile`,
    icon: 'profile',
  },
]

export const STUDENT_SIDEBAR_LINKS = [
  { label: 'Overview', path: STUDENT_BASE_PATH },
  ...STUDENT_NAV_ITEMS.map(({ title, path }) => ({ label: title, path })),
]
