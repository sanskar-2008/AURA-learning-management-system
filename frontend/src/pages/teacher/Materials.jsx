import { Link } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherMaterialsOverview } from '../../hooks/useTeacherData'

export default function Materials() {
  const { courses, loading, error } = useTeacherMaterialsOverview()

  if (loading) {
    return <LoadingState message="Loading learning materials..." />
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Learning Materials</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload course videos and PDF notes. Pick a course below to get started.
        </p>
      </div>

      {courses.length === 0 ? (
        <EmptyState
          title="No courses yet"
          message="Create a course first, then you can upload videos and PDF notes for your students."
        />
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary-600">{course.code}</p>
                  <h3 className="mt-0.5 font-semibold text-slate-900">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {course.material_count} material{course.material_count === 1 ? '' : 's'} ·{' '}
                    {course.video_count} video{course.video_count === 1 ? '' : 's'} ·{' '}
                    {course.pdf_count} PDF{course.pdf_count === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                <Link
                  to={`${TEACHER_BASE_PATH}/courses/${course.id}/materials?type=video`}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Upload Video
                </Link>
                <Link
                  to={`${TEACHER_BASE_PATH}/courses/${course.id}/materials?type=pdf`}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  Upload PDF Notes
                </Link>
                <Link
                  to={`${TEACHER_BASE_PATH}/courses/${course.id}/materials`}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  View All Materials
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
