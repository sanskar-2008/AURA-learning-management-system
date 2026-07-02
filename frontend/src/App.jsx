import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import AuthLayout from './layouts/AuthLayout'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import Signup from './pages/Signup'
import AdminLayout from './layouts/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminStudents from './pages/admin/Students'
import AdminTeachers from './pages/admin/Teachers'
import AdminCourses from './pages/admin/Courses'
import AdminEditCourse from './pages/admin/EditCourse'
import AdminAssignments from './pages/admin/Assignments'
import AdminEditAssignment from './pages/admin/EditAssignment'
import AdminProfile from './pages/admin/Profile'
import ParentLayout from './layouts/ParentLayout'
import ParentOverview from './pages/parent/ParentOverview'
import ParentLinkChild from './pages/parent/LinkChild'
import ParentChildProfile from './pages/parent/ChildProfile'
import ParentChildCourses from './pages/parent/ChildCourses'
import ParentChildCourseDetail from './pages/parent/ChildCourseDetail'
import ParentChildAssignments from './pages/parent/ChildAssignments'
import ParentAttendance from './pages/parent/Attendance'
import ParentGrades from './pages/parent/Grades'
import ParentQuizzes from './pages/parent/Quizzes'
import ParentChildProgress from './pages/parent/ChildProgress'
import ParentFeeManagement from './pages/parent/FeeManagement'
import ParentProfile from './pages/parent/Profile'
import StudentLayout from './layouts/StudentLayout'
import AssignmentDetail from './pages/student/AssignmentDetail'
import Assignments from './pages/student/Assignments'
import EnrollCourse from './pages/student/EnrollCourse'
import MyCourses from './pages/student/MyCourses'
import Profile from './pages/student/Profile'
import SearchCourses from './pages/student/SearchCourses'
import CourseDetail from './pages/student/CourseDetail'
import StudentCourseMaterials from './pages/student/CourseMaterials'
import StudentGrades from './pages/student/Grades'
import StudentQuizzes from './pages/student/Quizzes'
import TakeQuiz from './pages/student/TakeQuiz'
import QuizResult from './pages/student/QuizResult'
import StudentOverview from './pages/student/StudentOverview'
import TeacherLayout from './layouts/TeacherLayout'
import TeacherOverview from './pages/teacher/TeacherOverview'
import TeacherMyCourses from './pages/teacher/MyCourses'
import TeacherCreateCourse from './pages/teacher/CreateCourse'
import TeacherCourseDetail from './pages/teacher/CourseDetail'
import TeacherEditCourse from './pages/teacher/EditCourse'
import TeacherCourseEnrolledStudents from './pages/teacher/CourseEnrolledStudents'
import TeacherEnrolledStudents from './pages/teacher/EnrolledStudents'
import TeacherAssignments from './pages/teacher/Assignments'
import TeacherCreateAssignment from './pages/teacher/CreateAssignment'
import TeacherAssignmentDetail from './pages/teacher/AssignmentDetail'
import TeacherEditAssignment from './pages/teacher/EditAssignment'
import TeacherAssignmentSubmissions from './pages/teacher/AssignmentSubmissions'
import TeacherEditMaterial from './pages/teacher/EditMaterial'
import TeacherMaterials from './pages/teacher/Materials'
import TeacherCourseMaterials from './pages/teacher/CourseMaterials'
import TeacherCourseGrades from './pages/teacher/CourseGrades'
import TeacherGrades from './pages/teacher/Grades'
import TeacherEditGrade from './pages/teacher/EditGrade'
import TeacherQuizzes from './pages/teacher/Quizzes'
import TeacherCreateQuiz from './pages/teacher/CreateQuiz'
import TeacherEditQuiz from './pages/teacher/EditQuiz'
import TeacherQuizResults from './pages/teacher/QuizResults'
import TeacherProfile from './pages/teacher/Profile'
import { ROLES } from './utils/roles'

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
            </Route>

            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/login/admin" element={<AdminLogin />} />
                <Route path="/signup" element={<Signup />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
              <Route element={<StudentLayout />}>
                <Route path="/dashboard/student" element={<StudentOverview />} />
                <Route path="/dashboard/student/courses" element={<MyCourses />} />
                <Route path="/dashboard/student/courses/:courseId" element={<CourseDetail />} />
                <Route
                  path="/dashboard/student/courses/:courseId/materials"
                  element={<StudentCourseMaterials />}
                />
                <Route path="/dashboard/student/search" element={<SearchCourses />} />
                <Route path="/dashboard/student/enroll" element={<EnrollCourse />} />
                <Route path="/dashboard/student/assignments" element={<Assignments />} />
                <Route path="/dashboard/student/assignments/:assignmentId" element={<AssignmentDetail />} />
                <Route path="/dashboard/student/grades" element={<StudentGrades />} />
                <Route path="/dashboard/student/quizzes" element={<StudentQuizzes />} />
                <Route path="/dashboard/student/quizzes/:quizId/attempt" element={<TakeQuiz />} />
                <Route path="/dashboard/student/quizzes/:quizId/result" element={<QuizResult />} />
                <Route path="/dashboard/student/profile" element={<Profile />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.TEACHER]} />}>
              <Route element={<TeacherLayout />}>
                <Route path="/dashboard/teacher" element={<TeacherOverview />} />
                <Route path="/dashboard/teacher/courses" element={<TeacherMyCourses />} />
                <Route path="/dashboard/teacher/create" element={<TeacherCreateCourse />} />
                <Route path="/dashboard/teacher/courses/:courseId" element={<TeacherCourseDetail />} />
                <Route path="/dashboard/teacher/courses/:courseId/edit" element={<TeacherEditCourse />} />
                <Route
                  path="/dashboard/teacher/courses/:courseId/students"
                  element={<TeacherCourseEnrolledStudents />}
                />
                <Route path="/dashboard/teacher/students" element={<TeacherEnrolledStudents />} />
                <Route path="/dashboard/teacher/assignments" element={<TeacherAssignments />} />
                <Route path="/dashboard/teacher/assignments/create" element={<TeacherCreateAssignment />} />
                <Route path="/dashboard/teacher/assignments/:assignmentId" element={<TeacherAssignmentDetail />} />
                <Route
                  path="/dashboard/teacher/assignments/:assignmentId/edit"
                  element={<TeacherEditAssignment />}
                />
                <Route
                  path="/dashboard/teacher/assignments/:assignmentId/submissions"
                  element={<TeacherAssignmentSubmissions />}
                />
                <Route path="/dashboard/teacher/materials" element={<TeacherMaterials />} />
                <Route
                  path="/dashboard/teacher/courses/:courseId/materials"
                  element={<TeacherCourseMaterials />}
                />
                <Route
                  path="/dashboard/teacher/courses/:courseId/materials/:materialId/edit"
                  element={<TeacherEditMaterial />}
                />
                <Route path="/dashboard/teacher/grades" element={<TeacherGrades />} />
                <Route
                  path="/dashboard/teacher/courses/:courseId/grades"
                  element={<TeacherCourseGrades />}
                />
                <Route
                  path="/dashboard/teacher/courses/:courseId/grades/:gradeId/edit"
                  element={<TeacherEditGrade />}
                />
                <Route path="/dashboard/teacher/quizzes" element={<TeacherQuizzes />} />
                <Route path="/dashboard/teacher/quizzes/create" element={<TeacherCreateQuiz />} />
                <Route path="/dashboard/teacher/quizzes/:quizId/edit" element={<TeacherEditQuiz />} />
                <Route path="/dashboard/teacher/quizzes/:quizId/results" element={<TeacherQuizResults />} />
                <Route path="/dashboard/teacher/profile" element={<TeacherProfile />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.PARENT]} />}>
              <Route element={<ParentLayout />}>
                <Route path="/dashboard/parent/link" element={<ParentLinkChild />} />
                <Route path="/dashboard/parent" element={<ParentOverview />} />
                <Route path="/dashboard/parent/child" element={<ParentChildProfile />} />
                <Route path="/dashboard/parent/progress" element={<ParentChildProgress />} />
                <Route path="/dashboard/parent/courses" element={<ParentChildCourses />} />
                <Route path="/dashboard/parent/courses/:courseId" element={<ParentChildCourseDetail />} />
                <Route path="/dashboard/parent/assignments" element={<ParentChildAssignments />} />
                <Route path="/dashboard/parent/attendance" element={<ParentAttendance />} />
                <Route path="/dashboard/parent/grades" element={<ParentGrades />} />
                <Route path="/dashboard/parent/quizzes" element={<ParentQuizzes />} />
                <Route path="/dashboard/parent/fees" element={<ParentFeeManagement />} />
                <Route path="/dashboard/parent/profile" element={<ParentProfile />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/dashboard/admin" element={<AdminOverview />} />
                <Route path="/dashboard/admin/students" element={<AdminStudents />} />
                <Route path="/dashboard/admin/teachers" element={<AdminTeachers />} />
                <Route path="/dashboard/admin/courses" element={<AdminCourses />} />
                <Route path="/dashboard/admin/courses/:courseId/edit" element={<AdminEditCourse />} />
                <Route path="/dashboard/admin/assignments" element={<AdminAssignments />} />
                <Route
                  path="/dashboard/admin/assignments/:assignmentId/edit"
                  element={<AdminEditAssignment />}
                />
                <Route path="/dashboard/admin/profile" element={<AdminProfile />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
