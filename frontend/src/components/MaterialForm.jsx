import FormField from './FormField'

export default function MaterialForm({
  values,
  onChange,
  onFileChange,
  onSubmit,
  fieldErrors,
  submitting,
  submitLabel,
  onCancel,
  requireFile = false,
  currentFileName = '',
  videoSource = 'file',
  onVideoSourceChange,
}) {
  const isVideo = values.material_type === 'video'
  const showUrlInput = isVideo && videoSource === 'url'

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField
        label="Title"
        id="title"
        value={values.title}
        onChange={onChange}
        error={fieldErrors.title}
        required
        placeholder="e.g. Lecture 1 - Introduction"
      />

      <FormField label="Type" id="material_type" error={fieldErrors.material_type} required>
        <select
          id="material_type"
          name="material_type"
          value={values.material_type}
          onChange={onChange}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${
            fieldErrors.material_type ? 'border-red-400' : 'border-slate-300'
          }`}
        >
          <option value="video">Video</option>
          <option value="pdf">PDF Notes</option>
        </select>
      </FormField>

      <FormField label="Description" id="description" error={fieldErrors.description}>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={onChange}
          rows={3}
          placeholder="Optional description for students"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${
            fieldErrors.description ? 'border-red-400' : 'border-slate-300'
          }`}
        />
      </FormField>

      {isVideo && onVideoSourceChange && (
        <FormField label="Video Source">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onVideoSourceChange('file')}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                videoSource === 'file'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => onVideoSourceChange('url')}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                videoSource === 'url'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Video URL
            </button>
          </div>
        </FormField>
      )}

      {showUrlInput ? (
        <FormField
          label="Video URL"
          id="video_url"
          value={values.video_url || ''}
          onChange={onChange}
          error={fieldErrors.video_url}
          required={requireFile}
          placeholder="https://www.youtube.com/watch?v=... or direct MP4 link"
        />
      ) : (
        <FormField
          label={requireFile ? 'Upload File' : 'Replace File (optional)'}
          id="file"
          error={fieldErrors.file}
          required={requireFile && !showUrlInput}
        >
          <input
            id="file"
            name="file"
            type="file"
            accept={values.material_type === 'pdf' ? '.pdf' : 'video/*'}
            onChange={onFileChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 ${
              fieldErrors.file ? 'border-red-400' : 'border-slate-300'
            }`}
          />
          {currentFileName && (
            <p className="mt-2 text-xs text-slate-500">Current file: {currentFileName}</p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            {values.material_type === 'pdf'
              ? 'Accepted: PDF files only (.pdf)'
              : 'Accepted: MP4, WebM, MOV, AVI, MKV, M4V, MPEG'}
          </p>
        </FormField>
      )}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
