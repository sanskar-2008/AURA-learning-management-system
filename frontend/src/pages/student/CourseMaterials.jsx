import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { STUDENT_BASE_PATH } from '../../constants/studentDashboard'
import { useStudentCourseMaterials } from '../../hooks/useStudentData'
import { downloadAuthenticatedFile, resolveApiUrl } from '../../services/http'
import { getVideoEmbedUrl, isDirectVideoUrl } from '../../utils/videoUrl'
import { formatFileSize } from '../../utils/text'

export default function CourseMaterials() {
  const { courseId } = useParams()
  const { course, materials, loading, error } = useStudentCourseMaterials(courseId)
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadError, setDownloadError] = useState('')

  const videos = materials.filter((item) => item.material_type === 'video')
  const pdfs = materials.filter((item) => item.material_type === 'pdf')

  async function handleDownload(material) {
    setDownloadingId(material.id)
    setDownloadError('')
    try {
      await downloadAuthenticatedFile(material.file_url, material.file_name)
    } catch (err) {
      setDownloadError(err.message || 'Unable to download PDF. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  if (loading) {
    return <LoadingState message="Loading learning materials..." />
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Course not found or you are not enrolled'}
        </div>
        <Link
          to={`${STUDENT_BASE_PATH}/courses`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to My Courses
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Link
        to={`${STUDENT_BASE_PATH}/courses/${courseId}`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to course details
      </Link>

      <header>
        <p className="text-sm font-medium text-primary-600">{course.code}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{course.title}</h1>
        <p className="mt-1 text-sm text-slate-600">Learning materials for this course</p>
      </header>

      {materials.length === 0 ? (
        <EmptyState
          title="No materials yet"
          message="Your teacher has not uploaded any videos or PDF notes for this course yet."
        />
      ) : (
        <>
          {videos.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Course Videos</h2>
              <div className="space-y-6">
                {videos.map((material) => {
                  const embedUrl = material.video_url ? getVideoEmbedUrl(material.video_url) : null
                  const directUrl = material.video_url
                    ? isDirectVideoUrl(material.video_url)
                      ? material.video_url
                      : null
                    : resolveApiUrl(material.file_url)

                  return (
                  <article
                    key={material.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-slate-100 p-4 sm:p-5">
                      <h3 className="font-semibold text-slate-900">{material.title}</h3>
                      {material.description && (
                        <p className="mt-1 text-sm text-slate-600">{material.description}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        {material.video_url
                          ? 'External video'
                          : `${material.file_name} · ${formatFileSize(material.file_size)}`}
                      </p>
                    </div>
                    <div className="bg-slate-900 p-2">
                      {embedUrl ? (
                        <iframe
                          title={material.title}
                          src={embedUrl}
                          className="mx-auto aspect-video w-full max-h-[480px]"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : directUrl ? (
                        <video controls className="mx-auto max-h-[480px] w-full" src={directUrl}>
                          Your browser does not support video playback.
                        </video>
                      ) : (
                        <div className="flex h-48 items-center justify-center text-sm text-slate-300">
                          Video unavailable
                        </div>
                      )}
                    </div>
                  </article>
                  )
                })}
              </div>
            </section>
          )}

          {pdfs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">PDF Notes</h2>
              <p className="text-sm text-slate-600">Download PDF notes to view on your device.</p>
              {downloadError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {downloadError}
                </div>
              )}
              <div className="space-y-3">
                {pdfs.map((material) => (
                  <article
                    key={material.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{material.title}</h3>
                      {material.description && (
                        <p className="mt-1 text-sm text-slate-600">{material.description}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        {material.file_name} · {formatFileSize(material.file_size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(material)}
                      disabled={downloadingId === material.id}
                      className="shrink-0 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {downloadingId === material.id ? 'Downloading...' : 'Download PDF'}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
