import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import parentApi from '../services/parent'

const ParentContext = createContext(null)

export function ParentProvider({ children }) {
  const [linkedChildren, setLinkedChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refreshChildren = useCallback(async () => {
    setLoading(true)
    try {
      const response = await parentApi.getChildren()
      const nextChildren = response.data.children ?? []
      setLinkedChildren(nextChildren)
      setSelectedChildId((current) => {
        if (current && nextChildren.some((child) => child.id === current)) {
          return current
        }
        return nextChildren[0]?.id ?? null
      })
      setError(null)
    } catch (err) {
      setError(err.message)
      setLinkedChildren([])
      setSelectedChildId(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshChildren()
  }, [refreshChildren])

  const selectedChild = useMemo(
    () => linkedChildren.find((child) => child.id === selectedChildId) ?? null,
    [linkedChildren, selectedChildId],
  )

  const value = useMemo(
    () => ({
      linkedChildren,
      selectedChildId,
      selectedChild,
      setSelectedChildId,
      hasChildren: linkedChildren.length > 0,
      loading,
      error,
      refreshChildren,
    }),
    [linkedChildren, selectedChildId, selectedChild, loading, error, refreshChildren],
  )

  return <ParentContext.Provider value={value}>{children}</ParentContext.Provider>
}

export function useParentContext() {
  const context = useContext(ParentContext)
  if (!context) {
    throw new Error('useParentContext must be used within a ParentProvider')
  }
  return context
}
