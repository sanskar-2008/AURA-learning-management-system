import FormField from './FormField'

function calculatePreviewGrade(marksObtained, maximumMarks) {
  const marks = Number(marksObtained)
  const maximum = Number(maximumMarks)
  if (!maximum || Number.isNaN(marks) || Number.isNaN(maximum)) {
    return '—'
  }

  const percentage = (marks / maximum) * 100
  if (percentage >= 90) return 'A+'
  if (percentage >= 80) return 'A'
  if (percentage >= 70) return 'B'
  if (percentage >= 60) return 'C'
  if (percentage >= 50) return 'D'
  return 'F'
}

export default function GradeForm({
  values,
  onChange,
  onSubmit,
  fieldErrors,
  submitting,
  submitLabel,
  onCancel,
  students = [],
  assignments = [],
  disableStudentSelect = false,
  setValues,
}) {
  const previewGrade = calculatePreviewGrade(values.marks_obtained, values.maximum_marks)

  function handleAssignmentChange(event) {
    const assignmentId = event.target.value
    const assignment = assignments.find((item) => String(item.id) === assignmentId)

    if (setValues) {
      setValues((prev) => ({
        ...prev,
        assignment_id: assignmentId,
        evaluation_name: assignment ? assignment.title : prev.evaluation_name,
        maximum_marks: assignment ? String(assignment.max_points) : prev.maximum_marks,
      }))
      return
    }

    onChange(event)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormField label="Student" id="student_id" error={fieldErrors.student_id} required>
        <select
          id="student_id"
          name="student_id"
          value={values.student_id}
          onChange={onChange}
          disabled={disableStudentSelect}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100 ${
            fieldErrors.student_id ? 'border-red-400' : 'border-slate-300'
          }`}
        >
          <option value="">Select a student</option>
          {students.map((student) => (
            <option key={student.student_id} value={student.student_id}>
              {student.full_name} ({student.student_number})
            </option>
          ))}
        </select>
      </FormField>

      {assignments.length > 0 && (
        <FormField label="Link to Assignment (optional)" id="assignment_id" error={fieldErrors.assignment_id}>
          <select
            id="assignment_id"
            name="assignment_id"
            value={values.assignment_id}
            onChange={handleAssignmentChange}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${
              fieldErrors.assignment_id ? 'border-red-400' : 'border-slate-300'
            }`}
          >
            <option value="">None (exam or custom evaluation)</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField
        label="Assignment / Exam Name"
        id="evaluation_name"
        value={values.evaluation_name}
        onChange={onChange}
        error={fieldErrors.evaluation_name}
        required
        placeholder="e.g. Midterm Exam"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Marks Obtained"
          id="marks_obtained"
          type="number"
          min="0"
          step="0.01"
          value={values.marks_obtained}
          onChange={onChange}
          error={fieldErrors.marks_obtained}
          required
        />
        <FormField
          label="Maximum Marks"
          id="maximum_marks"
          type="number"
          min="1"
          step="0.01"
          value={values.maximum_marks}
          onChange={onChange}
          error={fieldErrors.maximum_marks}
          required
        />
      </div>

      <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        Calculated grade: <span className="font-semibold text-slate-900">{previewGrade}</span>
      </div>

      <FormField label="Remarks (optional)" id="remarks" error={fieldErrors.remarks}>
        <textarea
          id="remarks"
          name="remarks"
          value={values.remarks}
          onChange={onChange}
          rows={3}
          placeholder="Optional feedback for the student"
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500 ${
            fieldErrors.remarks ? 'border-red-400' : 'border-slate-300'
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
