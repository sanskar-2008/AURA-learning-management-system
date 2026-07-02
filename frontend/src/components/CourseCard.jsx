import { Link } from 'react-router-dom'
import { STUDENT_BASE_PATH } from '../constants/studentDashboard'
import { formatDate } from '../utils/assignmentStatus'
import { truncateWords } from '../utils/text'

export default function CourseCard({
  course,
  onEnroll,
  enrolling,
  showEnroll = true,
  showStudentsLink = false,
  showMaterialsLink = false,
  compact = false,
  basePath = STUDENT_BASE_PATH,
}) {
  const detailPath = `${basePath}/courses/${course.id}`
  const studentsPath = `${detailPath}?students=1`
  const materialsPath = `${basePath}/courses/${course.id}/materials`
  const previewDescription = truncateWords(course.description, 6)

  if (compact) {
    return (
      <article className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-primary-200 hover:shadow-md">
        <Link to={detailPath} className="block p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-primary-600">{course.code}</p>
              <h3 className="mt-0.5 truncate text-base font-semibold text-slate-900">
                {course.title}
              </h3>
              {previewDescription && (
                <p className="mt-1 text-sm text-slate-600">{previewDescription}</p>
              )}
              {course.teacher_name && (
                <p className="mt-1 truncate text-xs text-slate-500">
                  Teacher: {course.teacher_name}
                </p>
              )}
            </div>
            {course.is_enrolled && (
              <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                Enrolled
              </span>
            )}
          </div>
        </Link>

        {showEnroll && !course.is_enrolled && onEnroll && (
          <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => onEnroll(course.id)}
              disabled={enrolling}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enrolling ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        )}

        {showStudentsLink && (
          <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
            <Link
              to={studentsPath}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View enrolled students →
            </Link>
          </div>
        )}

        {showMaterialsLink && (
          <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap gap-3">
              <Link
                to={`${materialsPath}?type=video`}
                className="text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Upload Video
              </Link>
              <Link
                to={`${materialsPath}?type=pdf`}
                className="text-sm font-semibold text-amber-700 hover:text-amber-800"
              >
                Upload PDF
              </Link>
            </div>
          </div>
        )}
      </article>
    )
  }

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <Link to={detailPath} className="block min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-primary-600">{course.code}</p>
        <h3 className="mt-1 truncate text-lg font-semibold text-slate-900">{course.title}</h3>
        {previewDescription && (
          <p className="mt-3 text-sm text-slate-600">{previewDescription}</p>
        )}
      </Link>

      {course.teacher_name && (
        <p className="mt-4 truncate text-sm text-slate-700">
          <span className="font-medium text-slate-900">Teacher:</span> {course.teacher_name}
        </p>
      )}
      {course.created_at && (
        <p className="mt-2 text-sm text-slate-500">Created: {formatDate(course.created_at)}</p>
      )}
      {typeof course.enrolled_count === 'number' && (
        <p className="mt-2 text-sm text-slate-500">
          {course.enrolled_count} enrolled student{course.enrolled_count === 1 ? '' : 's'}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to={detailPath}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          View Details
        </Link>

        {showStudentsLink && (
          <Link
            to={studentsPath}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View Enrolled Students
          </Link>
        )}

        {showMaterialsLink && (
          <>
            <Link
              to={`${materialsPath}?type=video`}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Upload Video
            </Link>
            <Link
              to={`${materialsPath}?type=pdf`}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              Upload PDF
            </Link>
          </>
        )}

        {showEnroll && !course.is_enrolled && onEnroll && (
          <button
            type="button"
            onClick={() => onEnroll(course.id)}
            disabled={enrolling}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {enrolling ? 'Enrolling...' : 'Enroll'}
          </button>
        )}

        {course.is_enrolled && (
          <span className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            Enrolled
          </span>
        )}
      </div>
    </article>
  )
}
