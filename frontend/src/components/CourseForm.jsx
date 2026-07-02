import FormField from './FormField'

export default function CourseForm({
  values,
  onChange,
  onSubmit,
  fieldErrors,
  submitting,
  submitLabel,
  onCancel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField
        label="Course Title"
        id="title"
        value={values.title}
        onChange={onChange}
        error={fieldErrors.title}
        required
        placeholder="e.g. Introduction to Computer Science"
      />

      <FormField
        label="Course Code"
        id="code"
        value={values.code}
        onChange={onChange}
        error={fieldErrors.code}
        required
        placeholder="e.g. CS101"
      />

      <FormField label="Course Description" id="description" error={fieldErrors.description} required>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={onChange}
          rows={5}
          placeholder="Describe what students will learn in this course"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${
            fieldErrors.description ? 'border-red-400' : 'border-slate-300'
          }`}
        />
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
