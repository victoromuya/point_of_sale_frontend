import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { downloadExcel, downloadPDF } from '../utils/exportHelpers'
import { isSuperAdmin } from '../utils/auth'

export default function Products({ currentUser }) {
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/`)
      if (!response.ok) throw new Error('Failed to load products')
      setProducts(await response.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { load() }, [])

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    const key = searchTerm.toLowerCase()
    return products.filter((p) =>
      [p.name, p.description, String(p.quantity), String(p.price), p.status].some((value) =>
        String(value || '').toLowerCase().includes(key)
      )
    )
  }, [products, searchTerm])

  const formatStatus = (status) => {
    if (!status) return null
    const badgeClass = status.toUpperCase() === 'ACTIVE' ? 'badge badge-success' : 'badge badge-danger'
    return <span className={badgeClass} style={{ fontSize: '0.8em' }}>{status}</span>
  }

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3" style={{ gap: '0.5rem', alignItems: 'center' }}>
        {isSuperAdmin(currentUser) && (
          <button className="btn btn-success font-weight-bold" onClick={() => navigate('/products/new')}>
            <i className="fa fa-plus mr-2" /> Create new product
          </button>
        )}
        {!isSuperAdmin(currentUser) && (
          <div className="alert alert-warning" style={{ marginBottom: 0 }}>
            You are not admin. You can't add or update a products.
          </div>
        )}
        <button className="btn btn-info" disabled={!products.length} onClick={() => downloadExcel(filteredProducts, 'products.xlsx')}>
          <i className="fa fa-file-excel-o mr-2" /> Excel
        </button>
        <button className="btn btn-danger" disabled={!products.length} onClick={() => downloadPDF(filteredProducts, 'Products Data', ['name', 'description', 'quantity', 'price', 'status'])}>
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
          <h6 className="m-0 font-weight-bold text-primary">Products</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>#</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Quantity In Stock</th>
                  <th className="text-center">Unit Cost</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td>{p.id}</td>
                    <td>{idx + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.description}</td>
                    <td>{p.quantity}</td>
                    <td className="text-right">N {p.price}</td>
                    <td className="text-center">{formatStatus(p.status)}</td>
                    <td className="text-center">
                      {isSuperAdmin(currentUser) ? (
                        <button className="btn btn-sm btn-warning" onClick={() => navigate(`/products/${p.id}/edit`)}>Edit</button>
                      ) : (
                        <button className="btn btn-sm btn-secondary" disabled title="Only super admin can edit">Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2"><strong>Total:</strong> {filteredProducts.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

