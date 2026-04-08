import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUserApi } from '../utils/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const publicPaths = ['/login', '/accept-invite/']

    const isPublic = publicPaths.some(path =>
      window.location.pathname.startsWith(path)
    )

    // 🚀 Skip auth check for public pages
    if (isPublic) {
      setLoading(false)
      return
    }

    async function loadUser() {
      try {
        const user = await getCurrentUserApi()
        setUser(user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}