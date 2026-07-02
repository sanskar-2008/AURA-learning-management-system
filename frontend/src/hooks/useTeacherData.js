import { useCallback, useEffect, useState } from 'react'
import teacherApi from '../services/teacher'

export function useTeacherProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await teacherApi.getProfile()
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

export function useTeacherCourses({ search = '' } = {}) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await teacherApi.getCourses({ search })
      setCourses(response.data.courses)
      setError(null)
    } catch (err) {
      setError(err.message)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      refetch()
    }, 300)

    return () => clearTimeout(timer)
  }, [refetch])

  return { courses, loading, error, refetch }
}

export function useTeacherCourseDetail(courseId) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!courseId) {
      return
    }

    setLoading(true)
    try {
      const response = await teacherApi.getCourse(courseId)
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

export function useCourseEnrolledStudents(courseId) {
  const [course, setCourse] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!courseId) {
      return
    }

    setLoading(true)
    try {
      const response = await teacherApi.getCourseStudents(courseId)
      setCourse(response.data.course)
      setStudents(response.data.students ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setCourse(null)
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { course, students, loading, error, refetch }
}

export function useTeacherAssignments({ search = '', courseId = '' } = {}) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await teacherApi.getAssignments({ search, courseId })
      setAssignments(response.data.assignments)
      setError(null)
    } catch (err) {
      setError(err.message)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }, [search, courseId])

  useEffect(() => {
    const timer = setTimeout(() => {
      refetch()
    }, 300)

    return () => clearTimeout(timer)
  }, [refetch])

  return { assignments, loading, error, refetch }
}

export function useTeacherAssignmentDetail(assignmentId) {
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!assignmentId) {
      return
    }

    setLoading(true)
    try {
      const response = await teacherApi.getAssignment(assignmentId)
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

export function useAssignmentSubmissions(assignmentId) {
  const [assignment, setAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!assignmentId) {
      return
    }

    setLoading(true)
    try {
      const response = await teacherApi.getAssignmentSubmissions(assignmentId)
      setAssignment(response.data.assignment)
      setSubmissions(response.data.submissions ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setAssignment(null)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }, [assignmentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { assignment, submissions, loading, error, refetch }
}

export function useTeacherMaterialsOverview() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await teacherApi.getMaterialsOverview()
      setCourses(response.data.courses ?? [])
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

export function useTeacherCourseMaterials(courseId) {
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
      const response = await teacherApi.getCourseMaterials(courseId)
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

export function useTeacherMaterialDetail(courseId, materialId) {
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!courseId || !materialId) {
      return
    }
    setLoading(true)
    try {
      const response = await teacherApi.getMaterial(courseId, materialId)
      setMaterial(response.data.material)
      setError(null)
    } catch (err) {
      setError(err.message)
      setMaterial(null)
    } finally {
      setLoading(false)
    }
  }, [courseId, materialId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { material, loading, error, refetch }
}

export function useTeacherGrades({ courseId = '', studentId = '' } = {}) {
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await teacherApi.getGrades({ courseId, studentId })
      setGrades(response.data.grades ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setGrades([])
    } finally {
      setLoading(false)
    }
  }, [courseId, studentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { grades, loading, error, refetch }
}

export function useTeacherCourseGrades(courseId) {
  const [course, setCourse] = useState(null)
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!courseId) return
    setLoading(true)
    try {
      const response = await teacherApi.getCourseGrades(courseId)
      setCourse(response.data.course)
      setGrades(response.data.grades ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setCourse(null)
      setGrades([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { course, grades, loading, error, refetch }
}

export function useTeacherGradeDetail(courseId, gradeId) {
  const [grade, setGrade] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!courseId || !gradeId) return
    setLoading(true)
    try {
      const response = await teacherApi.getGrade(courseId, gradeId)
      setGrade(response.data.grade)
      setError(null)
    } catch (err) {
      setError(err.message)
      setGrade(null)
    } finally {
      setLoading(false)
    }
  }, [courseId, gradeId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { grade, loading, error, refetch }
}

export function useTeacherQuizzes({ courseId = '' } = {}) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await teacherApi.getQuizzes({ courseId })
      setQuizzes(response.data.quizzes ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { quizzes, loading, error, refetch }
}

export function useTeacherQuizDetail(quizId) {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!quizId) return
    setLoading(true)
    try {
      const response = await teacherApi.getQuiz(quizId)
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

export function useTeacherQuizResults(quizId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!quizId) return
    setLoading(true)
    try {
      const response = await teacherApi.getQuizResults(quizId)
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
