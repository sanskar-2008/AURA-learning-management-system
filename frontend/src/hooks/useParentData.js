import { useCallback, useEffect, useState } from 'react'
import parentApi from '../services/parent'

export function useParentDashboard(studentId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!studentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await parentApi.getDashboard(studentId)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

function useChildResource(fetcher, studentId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!studentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetcher(studentId)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [fetcher, studentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

export function useChildProfile(studentId) {
  return useChildResource(parentApi.getChildProfile, studentId)
}

export function useChildCourses(studentId) {
  return useChildResource(parentApi.getChildCourses, studentId)
}

export function useChildCourse(studentId, courseId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!studentId || !courseId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await parentApi.getChildCourse(studentId, courseId)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [studentId, courseId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

export function useChildAssignments(studentId) {
  return useChildResource(parentApi.getChildAssignments, studentId)
}

export function useChildAttendance(studentId) {
  return useChildResource(parentApi.getChildAttendance, studentId)
}

export function useChildGrades(studentId) {
  return useChildResource(parentApi.getChildGrades, studentId)
}

export function useChildQuizResults(studentId) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!studentId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const response = await parentApi.getChildQuizResults(studentId)
      setResults(response.data.results ?? [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { results, loading, error, refetch }
}

export function useChildProgress(studentId) {
  return useChildResource(parentApi.getChildProgress, studentId)
}

export function useChildLearningDashboard(studentId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!studentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await parentApi.getChildLearningDashboard(studentId)
      setData(response.data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}

export function useChildFees(studentId) {
  return useChildResource(parentApi.getChildFees, studentId)
}

export function useParentProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const response = await parentApi.getProfile()
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
