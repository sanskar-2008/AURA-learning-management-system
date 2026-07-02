export const TEACHER_BASE_PATH = '/dashboard/teacher'

export const TEACHER_SUMMARY = {
  total_courses: 0,
  total_students: 0,
  active_assignments: 0,
}

export const TEACHER_NAV_ITEMS = [
  {
    title: 'My Courses',
    description: 'View and manage your courses',
    path: `${TEACHER_BASE_PATH}/courses`,
    icon: 'courses',
  },
  {
    title: 'Create Course',
    description: 'Set up a new course for students',
    path: `${TEACHER_BASE_PATH}/create`,
    icon: 'create',
  },
  {
    title: 'Enrolled Students',
    description: 'See students enrolled in your courses',
    path: `${TEACHER_BASE_PATH}/students`,
    icon: 'students',
  },
  {
    title: 'Assignments',
    description: 'Create and review student assignments',
    path: `${TEACHER_BASE_PATH}/assignments`,
    icon: 'assignments',
  },
  {
    title: 'Learning Materials',
    description: 'Upload videos and PDF notes by course',
    path: `${TEACHER_BASE_PATH}/materials`,
    icon: 'courses',
  },
  {
    title: 'Marks & Grades',
    description: 'Enter and manage student marks and grades',
    path: `${TEACHER_BASE_PATH}/grades`,
    icon: 'grades',
  },
  {
    title: 'Quizzes & Tests',
    description: 'Create online quizzes and view student scores',
    path: `${TEACHER_BASE_PATH}/quizzes`,
    icon: 'assignments',
  },
  {
    title: 'Profile',
    description: 'Manage your account details',
    path: `${TEACHER_BASE_PATH}/profile`,
    icon: 'profile',
  },
]

export const TEACHER_SIDEBAR_LINKS = [
  { label: 'Overview', path: TEACHER_BASE_PATH },
  ...TEACHER_NAV_ITEMS.map(({ title, path }) => ({ label: title, path })),
]
