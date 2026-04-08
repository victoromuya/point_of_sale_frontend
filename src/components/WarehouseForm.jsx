import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'

export default function WarehouseForm() {
  const [locationName, setLocationName] = useState('')
  const [dateStarted, setDateStarted] = useState(new Date().toISOString().slice(0, 16))
  const [staffCount, setStaffCount] = useState(1)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!locationName.trim()) {
      setError('Warehouse location is required')
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/warehouses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_name: locationName.trim(), date_started: new Date(dateStarted).toISOString(), no_of_staffs: Number(staffCount) || 1 }),
      })
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || 'Failed to create warehouse')
      }
      setMessage('Warehouse created successfully')
      setError(null)
      setLocationName('')
      setStaffCount(1)
      setDateStarted(new Date().toISOString().slice(0, 16))
      setTimeout(() => navigate('/warehouses'), 800)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/warehouses')}>Back to warehouses</button>
      </div>
      <div className="card shadow mb-12">
        <div className="card-header py-3"><h6 className="m-0 font-weight-bold text-primary">Create New Warehouse</h6></div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Warehouse name</label>
              <input className="form-control" value={locationName} onChange={(e) => setLocationName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Date started</label>
              <input className="form-control" type="datetime-local" value={dateStarted} onChange={(e) => setDateStarted(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Number of staff</label>
              <input className="form-control" type="number" min="1" value={staffCount} onChange={(e) => setStaffCount(Number(e.target.value))} required />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      </div>
    </div>
  )
}
