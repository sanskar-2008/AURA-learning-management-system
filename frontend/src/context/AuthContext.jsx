import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import authApi from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const response = await authApi.getMe()
      setUser(response.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (credentials) => {
    const response = await authApi.login(credentials)
    setUser(response.data.user)
    return response.data
  }, [])

  const adminLogin = useCallback(async (credentials) => {
    const response = await authApi.adminLogin(credentials)
    setUser(response.data.user)
    return response.data
  }, [])

  const signup = useCallback(async (data) => {
    const response = await authApi.signup(data)
    setUser(response.data.user)
    return response.data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, adminLogin, signup, logout, checkAuth }),
    [user, loading, login, adminLogin, signup, logout, checkAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
