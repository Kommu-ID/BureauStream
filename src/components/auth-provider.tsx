import { AdminJwtPayload, UserJwtPayload } from '@/server/jwt';
import { decode } from 'jsonwebtoken';
import { useRouter } from 'next/router';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  accessToken?: string,
  payload?: UserJwtPayload | AdminJwtPayload,
  status: 'loading' | 'ready',
  setAccessToken: (token?: string) => void
}

export const AuthContext = createContext<AuthContextValue>({
  accessToken: undefined,
  status: 'loading',
  setAccessToken: () => undefined
})

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string>()
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  const tokenPayload = useMemo(() => {
    if (!accessToken) return
    const decoded =  decode(accessToken)
    if (!decoded || typeof decoded !== 'object' || !('role' in decoded)) return
    return decoded as UserJwtPayload | AdminJwtPayload
  }, [accessToken])

  useEffect(() => {
    if (status === 'ready') return
    const token = window.localStorage.getItem('token')
    setAccessToken(token ?? undefined)
    setStatus('ready')
  }, [status])

  useEffect(() => {
    if (!accessToken) {
      window.localStorage.removeItem('token')
      return
    }
    window.localStorage.setItem('token', accessToken)
  }, [accessToken])

  return (
    <AuthContext.Provider value={{ accessToken, payload: tokenPayload, setAccessToken, status }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const value = useContext(AuthContext)
  return value
}

export const AuthGuard = ({ role, children }: { role: 'user' | 'admin', children?: ReactNode }) => {
  const { status, payload } = useAuth()
  console.log('payload', payload)
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (role === 'admin' && payload?.role !== 'admin') {
      router.replace('/admin/auth')
      return
    }
    if (role === 'user' && payload?.role !== 'user') {
      router.replace('/auth')
      return
    }
  }, [payload?.role, role, router, status])

  if (status === 'loading' || role !== payload?.role) return 'Loading...'
  return <>{children}</>
}
