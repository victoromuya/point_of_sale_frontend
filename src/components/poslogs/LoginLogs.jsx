import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { API_BASE_URL } from '../../api'

export default function LoginLogs() {
  const [logs, setLogs] = useState([])
  const [usernameFilter, setUsernameFilter] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchLoginLogs = async () => {
    const params = new URLSearchParams()

    if (usernameFilter) params.append('user__username', usernameFilter)
    params.append('page', currentPage)

    try {
      const res = await fetch(`${API_BASE_URL}/logs/login-logs/?${params}`)
      const data = await res.json()

      setLogs(data.results)
      setTotalPages(Math.ceil(data.count / 10))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchLoginLogs()
  }, [usernameFilter, currentPage])

  return (
    <div className="container mt-4">
      <h2>Login Logs</h2>

      {/* Filter */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Filter by username"
        value={usernameFilter}
        onChange={e => {
          setUsernameFilter(e.target.value)
          setCurrentPage(1) // reset page
        }}
      />

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>User</th>
              <th>IP</th>
              <th>Browser</th>
              <th>OS</th>
              <th>Location</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map(log => (
                <tr key={log.id}>
                  <td>{log.username}</td>
                  <td>{log.ip}</td>
                  <td>{log.browser}</td>
                  <td>{log.os}</td>
                  <td>{log.location}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
            <ul className="pagination">

            <span>
              Page {currentPage} of {totalPages}
            </span>
            </ul>
          </div>
    </div>
  )
}