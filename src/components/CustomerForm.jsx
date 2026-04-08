import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'

export default function CustomerForm() {
  const [form, setForm] = useState({ full_name: '', address: '', email: '', phone: '' })
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/customers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        const err = await response.text()
        throw new Error(err || 'Create customer failed')
      }
      setMessage('Customer created successfully')
      setForm({ full_name: '', address: '', email: '', phone: '' })
      setTimeout(() => navigate('/customers'), 800)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/customers')}>Back to customers</button>
      </div>
      <div className="card shadow mb-12">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Create New Customer</h6>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Full name</label>
              <input className="form-control" value={form.full_name} required onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="form-control" value={form.address} required onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={form.email} required onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={form.phone} required onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      </div>
    </div>
  )
}
