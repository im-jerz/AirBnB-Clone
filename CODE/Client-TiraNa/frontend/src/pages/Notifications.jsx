import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'

const API = 'http://localhost:5000/api/notifications'

function BellIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  )
}

function BookingIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )
}

function PaymentIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ReviewIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

function SystemIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}

function VerificationIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  )
}

const typeIcons = {
  booking: BookingIcon,
  payment: PaymentIcon,
  review: ReviewIcon,
  system: SystemIcon,
  message: MessageIcon,
  verification: VerificationIcon,
}

const typeColors = {
  booking: 'text-blue-500 bg-blue-50',
  payment: 'text-teal bg-teal/10',
  review: 'text-yellow-500 bg-yellow-50',
  system: 'text-purple-500 bg-purple-50',
  message: 'text-sage bg-sage/10',
  verification: 'text-orange-500 bg-orange-50',
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function Notifications() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/client/signin')
      return
    }
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
    fetchNotifications()
  }, [navigate])

  async function fetchNotifications(page = 1) {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}?page=${page}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          navigate('/client/signin')
          return
        }
        throw new Error('Failed to load notifications')
      }
      const data = await res.json()
      setNotifications(data.notifications)
      setPagination(data.pagination)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkRead(id) {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API}/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch {
      // ignore
    }
  }

  async function handleMarkAllRead() {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API}/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch {
      // ignore
    }
  }

  async function handleDelete(id) {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(prev => prev.filter(n => n.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch {
      // ignore
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <div className="flex-1">
      <section className="bg-gradient-to-br from-charcoal via-teal to-charcoal pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto">
              {pagination.total} {pagination.total === 1 ? 'notification' : 'notifications'}
              {unreadCount > 0 && ` · ${unreadCount} unread`}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10 -mt-10 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {unreadCount > 0 && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs sm:text-sm font-medium text-sage hover:text-olive transition-colors bg-transparent border-none p-0 cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <BellIcon />
              <p className="text-gray-400 text-sm mt-4">No notifications yet</p>
              <p className="text-gray-300 text-xs mt-1">When you get notifications, they will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => {
                const Icon = typeIcons[n.type] || SystemIcon
                const colorClass = typeColors[n.type] || typeColors.system
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-4 p-4 sm:p-5 transition-colors ${
                      n.is_read ? 'bg-white' : 'bg-sage/[0.03]'
                    } border border-gray-100 hover:border-gray-200 relative group`}
                  >
                    <div className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${colorClass}`}>
                      <Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm ${n.is_read ? 'font-medium text-gray-600' : 'font-semibold text-charcoal'}`}>
                          {n.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {!n.is_read && (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(n.id)}
                              className="w-2 h-2 rounded-full bg-sage hover:bg-olive transition-colors border-none p-0 cursor-pointer"
                              title="Mark as read"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(n.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all border-none bg-transparent p-0 cursor-pointer"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-gray-400">{formatDate(n.created_at)}</span>
                        {n.sender_username && (
                          <span className="text-[11px] text-gray-300">from @{n.sender_username}</span>
                        )}
                        <span className="text-[11px] text-gray-300 capitalize">{n.type}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                type="button"
                onClick={() => fetchNotifications(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 text-sm font-medium text-charcoal border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-transparent cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => fetchNotifications(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-charcoal border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-transparent cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  )
}

export default Notifications
