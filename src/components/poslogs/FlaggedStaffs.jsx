import { useState, useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { API_BASE_URL } from '../../api'

export default function FlaggedStaffs() {
  const [flagged, setFlagged] = useState([])
  const [flagTypeFilter, setFlagTypeFilter] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchFlaggedStaffs = async () => {
    const params = new URLSearchParams()

    if (flagTypeFilter) params.append('flag_type', flagTypeFilter)
    params.append('page', currentPage)

    try {
      const res = await fetch(`${API_BASE_URL}/logs/flagged-staffs/?${params}`)
      const data = await res.json()

      setFlagged(data.results)
      setTotalPages(Math.ceil(data.count / 10))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchFlaggedStaffs()
  }, [flagTypeFilter, currentPage])

  return (
    <div className="container mt-4">
      <h2>Flagged Staffs</h2>

      {/* Filter */}
      <select
        className="form-select mb-3"
        value={flagTypeFilter}
        onChange={e => {
          setFlagTypeFilter(e.target.value)
          setCurrentPage(1) // reset page
        }}
      >
        <option value="">All Flags</option>
        <option value="brute_force">Brute Force</option>
        <option value="anomaly">Anomaly</option>
        <option value="insider">Insider Threat</option>
      </select>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>User</th>
              <th>Flag Type</th>
              <th>Reason</th>
              <th>Last Login</th>
            </tr>
          </thead>

          <tbody>
            {flagged.length > 0 ? (
              flagged.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.flag_type}</td>
                  <td>{user.reason}</td>
                  <td>{new Date(user.last_login).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No flagged users
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

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="btn btn-secondary"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  )
}