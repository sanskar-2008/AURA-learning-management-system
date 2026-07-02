import FormField from './FormField'

const EMPTY_QUESTION = {
  question_text: '',
  question_type: 'mcq',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'a',
  marks: '1',
}

export function createEmptyQuestion() {
  return { ...EMPTY_QUESTION }
}

export default function QuizForm({
  values,
  courses,
  onChange,
  onQuestionChange,
  onAddQuestion,
  onRemoveQuestion,
  onSubmit,
  fieldErrors,
  submitting,
  submitLabel,
  onCancel,
}) {
  const totalMarks = values.questions.reduce(
    (sum, question) => sum + (Number(question.marks) || 0),
    0,
  )

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <FormField
        label="Quiz Title"
        id="title"
        value={values.title}
        onChange={onChange}
        error={fieldErrors.title}
        required
        placeholder="e.g. Chapter 1 Quiz"
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

      <FormField label="Description" id="description" error={fieldErrors.description}>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={onChange}
          rows={3}
          placeholder="Optional quiz instructions"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary-500"
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Start Date & Time"
          id="start_time"
          type="datetime-local"
          value={values.start_time}
          onChange={onChange}
          error={fieldErrors.start_time}
          required
        />
        <FormField
          label="End Date & Time"
          id="end_time"
          type="datetime-local"
          value={values.end_time}
          onChange={onChange}
          error={fieldErrors.end_time}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Time Limit (minutes)"
          id="duration"
          type="number"
          min="1"
          value={values.duration}
          onChange={onChange}
          error={fieldErrors.duration}
          required
        />
        <FormField
          label="Passing Percentage"
          id="passing_percentage"
          type="number"
          min="0"
          max="100"
          value={values.passing_percentage}
          onChange={onChange}
          error={fieldErrors.passing_percentage}
          required
        />
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-slate-700">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="allow_multiple_attempts"
            checked={values.allow_multiple_attempts}
            onChange={onChange}
          />
          Allow multiple attempts
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="show_results_after_submit"
            checked={values.show_results_after_submit}
            onChange={onChange}
          />
          Show results after submission
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Questions</h3>
          <button
            type="button"
            onClick={onAddQuestion}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            + Add Question
          </button>
        </div>
        {fieldErrors.questions && (
          <p className="text-sm text-red-600">{fieldErrors.questions}</p>
        )}
        <p className="text-sm text-slate-600">
          Total marks: <span className="font-semibold text-slate-900">{totalMarks}</span>
        </p>

        {values.questions.map((question, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900">Question {index + 1}</p>
              {values.questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(index)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <FormField label="Question" error={fieldErrors[`questions.${index}.question_text`]}>
              <textarea
                value={question.question_text}
                onChange={(e) => onQuestionChange(index, 'question_text', e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Enter question text"
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Type">
                <select
                  value={question.question_type}
                  onChange={(e) => onQuestionChange(index, 'question_type', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="mcq">Multiple Choice</option>
                  <option value="true_false">True / False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </FormField>
              <FormField label="Marks" error={fieldErrors[`questions.${index}.marks`]}>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={question.marks}
                  onChange={(e) => onQuestionChange(index, 'marks', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </FormField>
            </div>

            {question.question_type === 'mcq' && (
              <div className="grid gap-3 sm:grid-cols-2">
                {['a', 'b', 'c', 'd'].map((opt) => (
                  <FormField key={opt} label={`Option ${opt.toUpperCase()}`}>
                    <input
                      value={question[`option_${opt}`]}
                      onChange={(e) => onQuestionChange(index, `option_${opt}`, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                  </FormField>
                ))}
                <FormField
                  label="Correct Answer"
                  error={fieldErrors[`questions.${index}.correct_answer`] || fieldErrors[`questions.${index}.options`]}
                >
                  <select
                    value={question.correct_answer}
                    onChange={(e) => onQuestionChange(index, 'correct_answer', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </select>
                </FormField>
              </div>
            )}

            {question.question_type === 'true_false' && (
              <FormField
                label="Correct Answer"
                error={fieldErrors[`questions.${index}.correct_answer`]}
              >
                <select
                  value={question.correct_answer}
                  onChange={(e) => onQuestionChange(index, 'correct_answer', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </FormField>
            )}

            {question.question_type === 'short_answer' && (
              <FormField
                label="Expected Answer"
                error={fieldErrors[`questions.${index}.correct_answer`]}
              >
                <input
                  value={question.correct_answer}
                  onChange={(e) => onQuestionChange(index, 'correct_answer', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Correct answer (case-insensitive match)"
                />
              </FormField>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
