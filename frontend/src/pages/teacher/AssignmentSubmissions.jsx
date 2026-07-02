import { Navigate, useParams } from 'react-router-dom'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'

export default function AssignmentSubmissions() {
  const { assignmentId } = useParams()
  return <Navigate to={`${TEACHER_BASE_PATH}/assignments/${assignmentId}?submissions=1`} replace />
}
