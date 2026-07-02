import FormField from './FormField'

export default function AssignmentForm({
  values,
  courses,
  onChange,
  onFileChange,
  onSubmit,
  fieldErrors,
  submitting,
  submitLabel,
  onCancel,
  currentFileName = '',
  removeFile = false,
  onRemoveFileChange,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField
        label="Assignment Title"
        id="title"
        value={values.title}
        onChange={onChange}
        error={fieldErrors.title}
        required
        placeholder="e.g. Midterm Essay"
      />

      <FormField label="Course" id="course_id" error={fieldErrors.course_id} required>
        <select
          id="course_id"
          name="course_id"
          value={values.course_id}
          onChange={onChange}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${
            fieldErrors.course_id ? 'border-red-400' : 'border-slate-300'
          }`}
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} — {course.title}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Description" id="description" error={fieldErrors.description} required>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={onChange}
          rows={5}
          placeholder="Describe the assignment requirements"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${
            fieldErrors.description ? 'border-red-400' : 'border-slate-300'
          }`}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Due Date"
          id="due_date"
          type="datetime-local"
          value={values.due_date}
          onChange={onChange}
          error={fieldErrors.due_date}
          required
        />
        <FormField
          label="Total Marks"
          id="max_points"
          type="number"
          value={values.max_points}
          onChange={onChange}
          error={fieldErrors.max_points}
          required
          min="1"
          step="0.01"
          placeholder="100"
        />
      </div>

      <FormField label="Attachment (PDF or file)" id="file" error={fieldErrors.file}>
        <input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg"
          onChange={onFileChange}
          className={`w-full rounded-lg border px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700 ${
            fieldErrors.file ? 'border-red-400' : 'border-slate-300'
          }`}
        />
        <p className="mt-2 text-xs text-slate-500">
          Optional. Allowed: PDF, DOC, DOCX, TXT, ZIP, PNG, JPG (max 25 MB).
        </p>
        {currentFileName && (
          <div className="mt-3 flex items-center gap-3 text-sm text-slate-700">
            <span>Current file: {currentFileName}</span>
            {onRemoveFileChange && (
              <label className="flex items-center gap-2 text-red-600">
                <input
                  type="checkbox"
                  checked={removeFile}
                  onChange={(event) => onRemoveFileChange(event.target.checked)}
                />
                Remove file
              </label>
            )}
          </div>
        )}
      </FormField>

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
