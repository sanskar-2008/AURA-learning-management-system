import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import MaterialForm from '../../components/MaterialForm'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherCourseMaterials } from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'
import { formatFileSize } from '../../utils/text'

export default function CourseMaterials() {
  const { courseId } = useParams()
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') === 'pdf' ? 'pdf' : 'video'
  const { course, materials, loading, error, refetch } = useTeacherCourseMaterials(courseId)
  const [values, setValues] = useState({
    title: '',
    material_type: initialType,
    description: '',
    video_url: '',
  })
  const [videoSource, setVideoSource] = useState('file')
  const [file, setFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [pendingId, setPendingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    setValues((prev) => ({ ...prev, material_type: initialType }))
  }, [initialType])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(event) {
    setFile(event.target.files?.[0] ?? null)
    setFieldErrors((prev) => ({ ...prev, file: undefined }))
  }

  function selectUploadType(type) {
    setValues((prev) => ({ ...prev, material_type: type, video_url: '' }))
    setVideoSource('file')
    setFile(null)
    setFieldErrors({})
  }

  async function handleUpload(event) {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

    const nextErrors = {}
    if (!values.title.trim()) {
      nextErrors.title = 'Title is required'
    }
    if (values.material_type === 'video' && videoSource === 'url') {
      if (!values.video_url.trim()) {
        nextErrors.video_url = 'Please enter a video URL'
      }
    } else if (!file) {
      nextErrors.file = 'Please select a file to upload'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      setErrorMessage(Object.values(nextErrors)[0])
      return
    }

    setSubmitting(true)

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('material_type', values.material_type)
    formData.append('description', values.description)
    if (values.material_type === 'video' && videoSource === 'url') {
      formData.append('video_url', values.video_url.trim())
    } else if (file) {
      formData.append('file', file)
    }

    try {
      const response = await teacherApi.uploadMaterial(courseId, formData)
      setSuccessMessage(response.message || 'Material uploaded successfully')
      setValues((prev) => ({
        title: '',
        material_type: prev.material_type,
        description: '',
        video_url: '',
      }))
      setFile(null)
      setFileInputKey((prev) => prev + 1)
      await refetch()
    } catch (err) {
      const apiErrors = err.errors || {}
      setFieldErrors(apiErrors)
      const firstError = Object.values(apiErrors)[0]
      setErrorMessage(firstError || err.message || 'Failed to upload material')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(material) {
    const confirmed = window.confirm(`Delete "${material.title}"? This cannot be undone.`)
    if (!confirmed) {
      return
    }

    setPendingId(material.id)
    setSuccessMessage('')
    setErrorMessage('')
    try {
      const response = await teacherApi.deleteMaterial(courseId, material.id)
      setSuccessMessage(response.message || 'Material deleted successfully')
      await refetch()
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete material')
    } finally {
      setPendingId(null)
    }
  }

  if (loading) {
    return <LoadingState message="Loading course materials..." />
  }

  if (error || !course) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Course not found'}
        </div>
        <Link
          to={`${TEACHER_BASE_PATH}/materials`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to Learning Materials
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${TEACHER_BASE_PATH}/materials`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to Learning Materials
      </Link>

      <div>
        <p className="text-sm font-medium text-primary-600">{course.code}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{course.title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {materials.length} material{materials.length === 1 ? '' : 's'} uploaded
        </p>
      </div>

      <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
      <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Upload Learning Material</h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose what you want to upload, then fill in the details below.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => selectUploadType('video')}
            className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
              values.material_type === 'video'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Upload Video / URL
          </button>
          <button
            type="button"
            onClick={() => selectUploadType('pdf')}
            className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
              values.material_type === 'pdf'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Upload PDF Notes
          </button>
        </div>

        <div className="mt-6">
          <MaterialForm
            key={fileInputKey}
            values={values}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onSubmit={handleUpload}
            fieldErrors={fieldErrors}
            submitting={submitting}
            submitLabel={values.material_type === 'video' ? 'Save Video' : 'Upload PDF'}
            requireFile
            videoSource={videoSource}
            onVideoSourceChange={setVideoSource}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Uploaded Materials</h2>

        {materials.length === 0 ? (
          <EmptyState
            title="No materials yet"
            message="Use the upload form above to add your first video or PDF notes."
          />
        ) : (
          <div className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{material.title}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        material.material_type === 'video'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {material.material_type === 'video' ? 'Video' : 'PDF'}
                    </span>
                  </div>
                  {material.description && (
                    <p className="mt-1 text-sm text-slate-600">{material.description}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
                    {material.video_url
                      ? `Video URL: ${material.video_url}`
                      : `${material.file_name} · ${formatFileSize(material.file_size)}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {(material.file_url || material.video_url) && (
                    <a
                      href={material.video_url || material.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Preview
                    </a>
                  )}
                  <Link
                    to={`${TEACHER_BASE_PATH}/courses/${courseId}/materials/${material.id}/edit`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(material)}
                    disabled={pendingId === material.id}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    {pendingId === material.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
