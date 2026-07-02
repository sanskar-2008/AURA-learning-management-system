import { Navigate, useParams } from 'react-router-dom'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'

export default function CourseEnrolledStudents() {
  const { courseId } = useParams()
  return <Navigate to={`${TEACHER_BASE_PATH}/courses/${courseId}?students=1`} replace />
}
