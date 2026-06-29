import { useState, useEffect, useCallback } from 'react'
import { getHostRooms, hideHostRoom, showHostRoom } from '../../api/admin'

export default function AdminRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ status: '' })
  const [actionLoading, setActionLoading] = useState(false)
  const [detailRoom, setDetailRoom] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getHostRooms(filter)
      setRooms(data)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggleStatus = async (room) => {
    const action = room.status === 'hidden' ? 'show' : 'hide'
    setActionLoading(true)
    try {
      if (action === 'show') {
        await showHostRoom(room.id)
      } else {
        await hideHostRoom(room.id)
      }
      fetchData()
    } catch (err) {
      setError(err.message)
    }
    setActionLoading(false)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rooms & Properties</h1>
        </div>
        <div className="page-actions">
          <select className="filter-select" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert-strip alert-danger" style={{ marginBottom: '16px' }}>
          <div className="alert-strip-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="alert-strip-content"><p>{error}</p></div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Host</th>
              <th>Price</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <div className="loader"><div className="spin"></div></div>
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    <p>No rooms found matching your selection.</p>
                  </div>
                </td>
              </tr>
            ) : rooms.map(room => (
              <tr key={room.id}>
                <td>
                  <div className="td-main">{room.name}</div>
                </td>
                <td className="td-muted">{room.host_name}</td>
                <td className="td-amount">₱{Number(room.price_per_night).toLocaleString()}</td>
                <td><span className={`badge badge-${room.status}`}>{room.status}</span></td>
                <td>
                  <div className="td-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => setDetailRoom(room)}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                    <button
                      className={`btn btn-sm ${room.status === 'hidden' ? 'btn-brand' : 'btn-ghost'}`}
                      onClick={() => handleToggleStatus(room)}
                      disabled={actionLoading}
                    >
                      {room.status === 'hidden' ? 'Show' : 'Hide'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
