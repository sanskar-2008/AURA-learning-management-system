import { useState } from 'react'
import { Link } from 'react-router-dom'
import AssignmentCard from '../../components/AssignmentCard'
import CourseSearchBar from '../../components/CourseSearchBar'
import EmptyState from '../../components/EmptyState'
import LoadingState from '../../components/LoadingState'
import { TEACHER_BASE_PATH } from '../../constants/teacherDashboard'
import { useTeacherAssignments } from '../../hooks/useTeacherData'

export default function Assignments() {
  const [search, setSearch] = useState('')
  const { assignments, loading, error } = useTeacherAssignments({ search })

  if (loading) {
    return <LoadingState message="Loading assignments..." />
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
          <p className="mt-1 text-sm text-slate-600">
            {assignments.length} assignment{assignments.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          to={`${TEACHER_BASE_PATH}/assignments/create`}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Create Assignment
        </Link>
      </div>

      <CourseSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by title, course, or description..."
      />

      {assignments.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          message={
            search
              ? 'No assignments match your search.'
              : 'Create your first assignment for one of your courses.'
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              basePath={TEACHER_BASE_PATH}
              showSubmit={false}
              showTeacherActions
            />
          ))}
        </div>
      )}
    </div>
  )
}
