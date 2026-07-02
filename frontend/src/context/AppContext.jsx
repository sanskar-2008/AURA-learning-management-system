import { createContext, useContext } from 'react'
import { APP_NAME } from '../constants/branding'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const value = {
    appName: APP_NAME,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
