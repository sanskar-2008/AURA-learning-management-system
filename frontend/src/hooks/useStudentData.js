import { useCallback, useEffect, useState } from 'react'
import studentApi from '../services/student'

export function useStudentDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchDashboard() {
      try {
        const response = await studentApi.getDashboard()
        if (isMounted) {
          setData(response.data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setData(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  return { data, loading, error }
}

export function useStudentCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await studentApi.getCourses()
      setCourses(response.data.courses)
      setError(null)
    } catch (err) {
      setError(err.message)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { courses, loading, error, refetch }
}

export function useCourseBrowse({ enrollableOnly = false, search = '' }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await studentApi.browseCourses({ search, enrollableOnly })
      setCourses(response.data.courses)
      setError(null)
    } catch (err) {
      setError(err.message)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [enrollableOnly, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      refetch()
    }, 300)

    return () => clearTimeout(timer)
  }, [refetch])

  return { courses, loading, error, refetch }
}

export function useCourseDetail(courseId) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!courseId) {
      return
    }

    setLoading(true)
    try {
      const response = await studentApi.getCourse(courseId)
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

export function useStudentAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await studentApi.getAssignments()
      setAssignments(response.data.assignments)
      setError(null)
    } catch (err) {
      setError(err.message)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { assignments, loading, error, refetch }
}

export function useAssignmentDetail(assignmentId) {
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!assignmentId) {
      return
    }

    setLoading(true)
    try {
      const response = await studentApi.getAssignment(assignmentId)
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

export function useStudentProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await studentApi.getProfile()
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

export function useStudentCourseMaterials(courseId) {
  const [course, setCourse] = useState(null)
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!courseId) {
      return
    }
    setLoading(true)
    try {
      const response = await studentApi.getCourseMaterials(courseId)
      setCourse(response.data.course)
      setMaterials(response.data.materials ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setCourse(null)
      setMaterials([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { course, materials, loading, error, refetch }
}

export function useStudentGrades({ courseId = '' } = {}) {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await studentApi.getGrades({ courseId })
      setGrades(response.data.grades ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setGrades([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { grades, loading, error, refetch }
}

export function useStudentQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await studentApi.getQuizzes()
      setQuizzes(response.data.quizzes ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { quizzes, loading, error, refetch }
}

export function useStudentQuizDetail(quizId) {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!quizId) return
    setLoading(true)
    try {
      const response = await studentApi.getQuiz(quizId)
      setQuiz(response.data.quiz)
      setError(null)
    } catch (err) {
      setError(err.message)
      setQuiz(null)
    } finally {
      setLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { quiz, loading, error, refetch }
}

export function useStudentQuizResult(quizId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!quizId) return
    setLoading(true)
    try {
      const response = await studentApi.getQuizResult(quizId)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
