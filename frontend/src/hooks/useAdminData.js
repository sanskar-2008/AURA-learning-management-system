import { useCallback, useEffect, useState } from 'react'
import adminApi from '../services/admin'

export function useAdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminApi.getDashboard()
      setSummary(response.data.summary)
      setError(null)
    } catch (err) {
      setError(err.message)
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { summary, loading, error, refetch }
}

function useSearchList(fetcher, key, { search = '' } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetcher({ search })
      setItems(response.data[key] ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [fetcher, key, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      refetch()
    }, 300)
    return () => clearTimeout(timer)
  }, [refetch])

  return { items, loading, error, refetch }
}

export function useAdminStudents({ search = '' } = {}) {
  const { items, ...rest } = useSearchList(adminApi.getStudents, 'students', { search })
  return { students: items, ...rest }
}

export function useAdminTeachers({ search = '' } = {}) {
  const { items, ...rest } = useSearchList(adminApi.getTeachers, 'teachers', { search })
  return { teachers: items, ...rest }
}

export function useAdminCourses({ search = '' } = {}) {
  const { items, ...rest } = useSearchList(adminApi.getCourses, 'courses', { search })
  return { courses: items, ...rest }
}

export function useAdminAssignments({ search = '' } = {}) {
  const { items, ...rest } = useSearchList(adminApi.getAssignments, 'assignments', { search })
  return { assignments: items, ...rest }
}

export function useAdminCourseDetail(courseId) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!courseId) {
      return
    }
    setLoading(true)
    try {
      const response = await adminApi.getCourse(courseId)
      setCourse(response.data.course)
      setError(null)
    } catch (err) {
      setError(err.message)
      setCourse(null)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { course, loading, error, refetch }
}

export function useAdminAssignmentDetail(assignmentId) {
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!assignmentId) {
      return
    }
    setLoading(true)
    try {
      const response = await adminApi.getAssignment(assignmentId)
      setAssignment(response.data.assignment)
      setError(null)
    } catch (err) {
      setError(err.message)
      setAssignment(null)
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { assignment, loading, error, refetch }
}

export function useAdminProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await adminApi.getProfile()
      setProfile(response.data.profile)
      setError(null)
    } catch (err) {
      setError(err.message)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { profile, loading, error, refetch, setProfile }
}

export function useAdminCoursesForSelect() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    adminApi
      .getCoursesForSelect()
      .then((response) => {
        if (active) {
          setCourses(response.data.courses ?? [])
        }
      })
      .catch(() => {
        if (active) {
          setCourses([])
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  return { courses, loading }
}
