import { useEffect, useState } from 'react'
import { api } from '../services/api'

export function useHealthCheck() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchHealth() {
      try {
        const response = await api.getHealth()
        if (isMounted) {
          setStatus(response.data)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setStatus(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchHealth()

    return () => {
      isMounted = false
    }
  }, [])

  return { status, loading, error }
}
