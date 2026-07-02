export const PARENT_BASE_PATH = '/dashboard/parent'
export const PARENT_LINK_PATH = `${PARENT_BASE_PATH}/link`

export const PARENT_SUMMARY = {
  total_enrolled_courses: 0,
  pending_assignments: 0,
  attendance_percentage: '0%',
  outstanding_fees: 0,
}

export const PARENT_CHILD_NAV_ITEMS = [
  {
    title: 'Child Progress',
    description: "Your child's learning dashboard — courses, grades, and submissions",
    path: `${PARENT_BASE_PATH}/progress`,
    icon: 'chart',
  },
  {
    title: 'Child Profile',
    description: 'View your child’s basic information',
    path: `${PARENT_BASE_PATH}/child`,
    icon: 'child',
  },
  {
    title: 'Child Courses',
    description: 'View enrolled courses and course details',
    path: `${PARENT_BASE_PATH}/courses`,
    icon: 'courses',
  },
  {
    title: 'Child Assignments',
    description: 'View assignments and submission status',
    path: `${PARENT_BASE_PATH}/assignments`,
    icon: 'assignments',
  },
  {
    title: 'Attendance',
    description: 'View your child’s attendance records',
    path: `${PARENT_BASE_PATH}/attendance`,
    icon: 'attendance',
  },
  {
    title: 'Grades & Progress',
    description: 'View grades and academic progress',
    path: `${PARENT_BASE_PATH}/grades`,
    icon: 'grades',
  },
  {
    title: 'Quiz Results',
    description: "View your child's quiz scores",
    path: `${PARENT_BASE_PATH}/quizzes`,
    icon: 'assignments',
  },
  {
    title: 'Fee Payment',
    description: 'View fees, payment history, and pay pending fees',
    path: `${PARENT_BASE_PATH}/fees`,
    icon: 'fees',
  },
  {
    title: 'Parent Profile',
    description: 'View and manage your parent account',
    path: `${PARENT_BASE_PATH}/profile`,
    icon: 'profile',
  },
]

export const PARENT_NAV_ITEMS = PARENT_CHILD_NAV_ITEMS

export const PARENT_SIDEBAR_LINKS = [
  { label: 'Dashboard', path: PARENT_BASE_PATH },
  ...PARENT_CHILD_NAV_ITEMS.map(({ title, path }) => ({ label: title, path })),
]
