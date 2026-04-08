import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { apiFetch } from '../utils/ApiFetch'

export default function ExpenseForm() {
  const [form, setForm] = useState({ Category: '', grand_total: 0, description: '' })
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async (event) => {
    event.preventDefault()
    try {
      const response = await apiFetch(`${API_BASE_URL}/expenses/`, {
        method: 'POST',
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        const err = await response.text()
        throw new Error(err || 'Create expense failed')
      }
      setMessage('Expense created successfully')
      setForm({ Category: '', grand_total: 0, description: '' })
      setTimeout(() => navigate('/expenses'), 800)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/expenses')}>Back to expenses</button>
      </div>

      <div className="card shadow mb-12">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Create New Expense</h6>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Category</label>
              <input className="form-control" value={form.Category} required onChange={(e) => setForm((prev) => ({ ...prev, Category: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Total</label>
              <input className="form-control" type="number" value={form.grand_total} required onChange={(e) => setForm((prev) => ({ ...prev, grand_total: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <button type="submit" className="btn btn-primary">Save</button>
          </form>
        </div>
      </div>
    </div>
  )
}
