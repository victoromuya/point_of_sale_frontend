import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { downloadExcel, downloadPDF } from '../utils/exportHelpers'
import { isSuperAdmin } from '../utils/auth'

export default function Warehouses({ currentUser }) {
  const [warehouses, setWarehouses] = useState([])
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const loadWarehouses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/`)
      if (!response.ok) throw new Error('Failed to load warehouses')
      setWarehouses(await response.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { loadWarehouses() }, [])

  const filtered = useMemo(() => {
    if (!searchTerm) return warehouses
    const key = searchTerm.toLowerCase()
    return warehouses.filter((w) =>
      [w.location_name, String(w.no_of_staffs), (w.date_started || '')].some((value) =>
        String(value || '').toLowerCase().includes(key)
      )
    )
  }, [warehouses, searchTerm])

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3" style={{ gap: '0.5rem', alignItems: 'center' }}>
        

        {isSuperAdmin(currentUser) && (
          <button className="btn btn-success font-weight-bold" onClick={() => navigate('/warehouses/new')}>
          <i className="fa fa-plus mr-2" /> Create new warehouse
        </button>
        )}
        
        <button className="btn btn-info" disabled={!filtered.length} onClick={() => downloadExcel(filtered, 'warehouses.xlsx')}>
          <i className="fa fa-file-excel-o mr-2" /> Excel
        </button>
        <button className="btn btn-danger" disabled={!filtered.length} onClick={() => downloadPDF(filtered, 'Warehouses', ['location_name', 'date_started', 'no_of_staffs'])}>
          <i className="fa fa-file-pdf-o mr-2" /> PDF
        </button>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: '220px' }}
          placeholder="Search warehouses"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow mb-12">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Warehouses</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>#</th>
                  <th>Location</th>
                  <th>Date Started</th>
                  <th>Staff Count</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w, idx) => (
                  <tr key={w.id || idx}>
                    <td>{w.id}</td>
                    <td>{idx + 1}</td>
                    <td>{w.location_name}</td>
                    <td>{new Date(w.date_started).toLocaleString()}</td>
                    <td>{w.no_of_staffs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2"><strong>Total:</strong> {filtered.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
