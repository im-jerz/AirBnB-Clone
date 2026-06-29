import { createContext, useContext, useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('admin')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))

  const login = useCallback(async (username, password) => {
    const res = await fetch(`${API_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Login failed')

    // If OTP is required, don't set tokens yet
    if (data.requires_otp) {
        return data
    }

    localStorage.setItem('admin_token', data.access_token)
    localStorage.setItem('admin', JSON.stringify(data.admin))
    setToken(data.access_token)
    setAdmin(data.admin)
    return data
  }, [])

  const verifyOtp = useCallback(async (email, code, tempToken) => {
    const res = await fetch(`${API_URL}/admin/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, temp_token: tempToken }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'OTP Verification failed')

    localStorage.setItem('admin_token', data.access_token)
    localStorage.setItem('admin', JSON.stringify(data.admin))
    setToken(data.access_token)
    setAdmin(data.admin)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin')
    setToken(null)
    setAdmin(null)
  }, [])

  return (
    <AdminAuthContext.Provider value={{ admin, token, isAuthenticated: !!token, login, verifyOtp, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
