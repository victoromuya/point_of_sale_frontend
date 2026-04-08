import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { downloadExcel, downloadPDF } from '../utils/exportHelpers'


export default function Sales() {
  const [sales, setSales] = useState([])
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/`)
      if (!response.ok) throw new Error('Failed to load sales')
      setSales(await response.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { load() }, [])

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales
    const key = searchTerm.toLowerCase()
    return sales.filter((s) =>
      [s.customer, s.product, s.wharehouse, s.payment_method, s.credit, String(s.grand_total)].some((value) =>
        String(value || '').toLowerCase().includes(key)
      )
    )
  }, [sales, searchTerm])

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3" style={{ gap: '0.5rem', alignItems: 'center' }}>
        <button className="btn btn-success font-weight-bold" onClick={() => navigate('/sales/new')}>
          <i className="fa fa-plus mr-2" /> Create new sale
        </button>
        <button className="btn btn-info" disabled={!sales.length} onClick={() => downloadExcel(filteredSales, 'sales.xlsx')}>
          <i className="fa fa-file-excel-o mr-2" /> Excel
        </button>
        <button className="btn btn-danger" disabled={!sales.length} onClick={() => downloadPDF(filteredSales, 'Sales Data', ['date_added', 'customer', 'product', 'wharehouse', 'grand_total', 'payment_method', 'credit'])}>
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
          <h6 className="m-0 font-weight-bold text-primary">Sales</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Rep</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Store</th>
                  <th className="text-center">Amount</th>
                  <th className="text-center">Payment Method</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Items</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td>{new Date(s.date_added).toLocaleString()}</td>
                    <td>{s.user}</td>
                    <td>{s.customer}</td>
                    <td>{s.product}</td>
                    <td>{s.wharehouse}</td>
                    <td className="text-right">{s.grand_total}</td>
                    <td className="text-center">{s.payment_method}</td>
                    <td className="text-center">{s.credit}</td>
                    <td className="text-center">{s.sale_details?.length ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2"><strong>Total:</strong> {filteredSales.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}