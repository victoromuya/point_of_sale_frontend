import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { downloadExcel, downloadPDF } from '../utils/exportHelpers'

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/`)
      if (!response.ok) throw new Error('Failed to load expenses')
      setExpenses(await response.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { load() }, [])

  const filteredExpenses = useMemo(() => {
    if (!searchTerm) return expenses
    const key = searchTerm.toLowerCase()
    return expenses.filter((e) =>
      [e.Category, e.description, String(e.grand_total), e.user].some((value) => String(value || '').toLowerCase().includes(key))
    )
  }, [expenses, searchTerm])

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3" style={{ gap: '0.5rem', alignItems: 'center' }}>
        <button className="btn btn-success font-weight-bold" onClick={() => navigate('/expenses/new')}>
          <i className="fa fa-plus mr-2" /> Create new expense
        </button>
        <button className="btn btn-info" disabled={!expenses.length} onClick={() => downloadExcel(filteredExpenses, 'expenses.xlsx')}>
          <i className="fa fa-file-excel-o mr-2" /> Excel
        </button>
        <button className="btn btn-danger" disabled={!expenses.length} onClick={() => downloadPDF(filteredExpenses, 'Expenses Data', ['date_added', 'Category', 'grand_total', 'description', 'user'])}>
          <i className="fa fa-file-pdf-o mr-2" /> PDF
        </button>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: '220px' }}
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow mb-12">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Expenses</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Rep</th>
                  <th>Category</th>
                  <th className="text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((e, idx) => (
                  <tr key={e.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{new Date(e.date_added).toLocaleString()}</td>
                    <td>{e.user}</td>
                    <td>{e.Category}</td>
                    <td className="text-right">{e.grand_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2"><strong>Total:</strong> {filteredExpenses.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}