import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../../components/Alert'
import LoadingState from '../../components/LoadingState'
import MaterialForm from '../../components/MaterialForm'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherMaterialDetail } from '../../hooks/useTeacherData'
import teacherApi from '../../services/teacher'

export default function EditMaterial() {
  const { courseId, materialId } = useParams()
  const navigate = useNavigate()
  const { material, loading, error } = useTeacherMaterialDetail(courseId, materialId)
  const [values, setValues] = useState({
    title: '',
    material_type: 'video',
    description: '',
    video_url: '',
  })
  const [videoSource, setVideoSource] = useState('file')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    if (!material) {
      return
    }
    setValues({
      title: material.title,
      material_type: material.material_type,
      description: material.description || '',
      video_url: material.video_url || '',
    })
    setVideoSource(material.video_url ? 'url' : 'file')
  }, [material])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleFileChange(event) {
    setFile(event.target.files?.[0] ?? null)
    setFieldErrors((prev) => ({ ...prev, file: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

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
      const response = await teacherApi.updateMaterial(courseId, materialId, formData)
      setSuccessMessage(response.message || 'Material updated successfully')
      setTimeout(() => {
        navigate(`${TEACHER_BASE_PATH}/courses/${courseId}/materials`)
      }, 800)
    } catch (err) {
      const apiErrors = err.errors || {}
      setFieldErrors(apiErrors)
      const firstError = Object.values(apiErrors)[0]
      setErrorMessage(firstError || err.message || 'Failed to update material')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading material..." />
  }

  if (error || !material) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error || 'Material not found'}
        </div>
        <Link
          to={`${TEACHER_BASE_PATH}/courses/${courseId}/materials`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to course materials
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to={`${TEACHER_BASE_PATH}/courses/${courseId}/materials`}
        className="text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        ← Back to course materials
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Material</h1>
        <p className="mt-2 text-sm text-slate-600">Update material details, video URL, or replace the file.</p>

        <div className="mt-6 space-y-4">
          <Alert type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
          <Alert type="error" message={errorMessage} onDismiss={() => setErrorMessage('')} />

          <MaterialForm
            values={values}
            onChange={handleChange}
            onFileChange={handleFileChange}
            onSubmit={handleSubmit}
            fieldErrors={fieldErrors}
            submitting={submitting}
            submitLabel="Save Changes"
            currentFileName={material.has_file ? material.file_name : ''}
            videoSource={videoSource}
            onVideoSourceChange={setVideoSource}
            onCancel={() => navigate(`${TEACHER_BASE_PATH}/courses/${courseId}/materials`)}
          />
        </div>
      </section>
    </div>
  )
}
