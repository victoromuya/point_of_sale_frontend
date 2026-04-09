import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import './logs.css'
import { API_BASE_URL } from '../../api'

export default function AuditTrail() {
  const [logs, setLogs] = useState([])
  const [modelFilter, setModelFilter] = useState('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const fetchAuditLogs = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (modelFilter !== 'all') params.append('model_name', modelFilter)
    if (actionFilter !== 'all') params.append('action', actionFilter)
    if (userFilter) params.append('user__username', userFilter)
    if (dateFilter) params.append('timestamp', dateFilter.toISOString().split('T')[0])
    params.append('page', currentPage)

    try {
      const res = await fetch(`${API_BASE_URL}/logs/audit-trail/?${params}`)
      if (!res.ok) throw new Error(`Server error: ${res.status}`)

      const text = await res.text()
      const data = text ? JSON.parse(text) : { results: [], count: 0 }

      setLogs(data.results || [])
      setTotalPages(Math.ceil((data.count || 0) / 10))
    } catch (err) {
      console.error("Fetch Audit Logs error:", err)
      setLogs([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh + fetch on filters/page change
  useEffect(() => {
    fetchAuditLogs()
    const interval = setInterval(fetchAuditLogs, 5000) // every 5s
    return () => clearInterval(interval)
  }, [modelFilter, actionFilter, userFilter, dateFilter, currentPage])

  return (
    <div className="container mt-4">
      <h2>Audit Trail</h2>

      {/* Filters */}
      <div className="logs-filters d-flex gap-3 mb-3 flex-wrap">
        <div>
          <label htmlFor="model">Activity:</label>
          <select
            id="model"
            className="form-select"
            value={modelFilter}
            onChange={e => { setModelFilter(e.target.value); setCurrentPage(1) }}
          >
            <option value="all">All Activities</option>
            <option value="Customer">Customer</option>
            <option value="Product">Product</option>
            <option value="Sale">Sale</option>
            <option value="Expense">Expense</option>
            <option value="Warehouse">Warehouse</option>
            <option value="InviteStaff">Invite Staff</option>
            <option value="CustomUser">User</option>
          </select>
        </div>

        <div>
          <label htmlFor="action">Action:</label>
          <select
            id="action"
            className="form-select"
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setCurrentPage(1) }}
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
           
          </select>
        </div>

        <div>
         
          <input
            type="text"
            id="user"
            className="form-control"
            placeholder="Filter by username"
            value={userFilter}
            onChange={e => { setUserFilter(e.target.value); setCurrentPage(1) }}
          />
        </div>

        <div>
          <label htmlFor="date">Date:</label>
          <DatePicker
            id="date"
            selected={dateFilter}
            onChange={date => { setDateFilter(date); setCurrentPage(1) }}
            placeholderText="Select date"
            className="form-control"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Username</th>
              <th>Model</th>
              <th>Action</th>
              <th>Description</th>
              <th>Date</th>
              <th>Time</th>
              <th>IP</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center">
                  Loading...
                </td>
              </tr>
            ) : logs.length > 0 ? (
              logs.map(log => (
                <tr key={log.id}>
                  <td>{log.username}</td>
                  <td>{log.model_name}</td>
                  <td>
                    <span className={`badge ${
                      log.action === 'create' ? 'bg-success' :
                      log.action === 'update' ? 'bg-warning' :
                      log.action === 'delete' ? 'bg-danger' :
                      log.action === 'login' ? 'bg-primary' : 'bg-secondary'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.description}</td>
                  <td>{new Date(log.timestamp).toLocaleDateString()}</td>
                  <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td>{log.ip}</td>
                  <td>{log.location}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          className="btn btn-secondary"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}