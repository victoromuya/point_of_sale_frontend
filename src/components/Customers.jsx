import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { downloadExcel, downloadPDF } from '../utils/exportHelpers'
import { apiFetch } from '../utils/ApiFetch'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/`)
      if (!response.ok) throw new Error('Failed to load customers')
      setCustomers(await response.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { load() }, [])

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers
    const key = searchTerm.toLowerCase()
    return customers.filter((c) =>
      [c.full_name, c.address, c.email, c.phone].some((value) => String(value || '').toLowerCase().includes(key))
    )
  }, [customers, searchTerm])

  const handleDelete = async (id) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/customers/${id}/`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Delete failed')
      setMessage('Customer deleted')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setShowDeleteModal(false)
      setDeleteCandidate(null)
    }
  }

  const openDeleteModal = (customer) => {
    setDeleteCandidate(customer)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setDeleteCandidate(null)
    setShowDeleteModal(false)
  }

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3" style={{ gap: '0.5rem', alignItems: 'center' }}>
        <button className="btn btn-success font-weight-bold" onClick={() => navigate('/customers/new')}>
          <i className="fa fa-plus mr-2" /> Create new customer
        </button>
        <button className="btn btn-info" disabled={!customers.length} onClick={() => downloadExcel(filteredCustomers, 'customers.xlsx')}>
          <i className="fa fa-file-excel-o mr-2" /> Excel
        </button>
        <button className="btn btn-danger" disabled={!customers.length} onClick={() => downloadPDF(filteredCustomers, 'Customers Data', ['full_name', 'email', 'phone', 'address'])}>
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
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card shadow mb-12">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Customers</h6>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, idx) => (
                  <tr key={customer.id}>
                    <td>{idx + 1}</td>
                    <td>{customer.full_name || customer.first_name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.address}</td>
                    <td className="text-center">
                      <button className="btn btn-warning btn-sm mr-2" onClick={() => navigate(`/customers/new?edit=${customer.id}`)}>
                        <i className="fa fa-edit" />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(customer)}>
                        <i className="fa fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2"><strong>Total:</strong> {filteredCustomers.length}</p>
          </div>
        </div>
      </div>

      {showDeleteModal && deleteCandidate && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete customer</h5>
                <button type="button" className="close" onClick={closeDeleteModal} aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete the customer: <strong>{deleteCandidate.full_name || deleteCandidate.first_name}</strong>?
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>Cancel</button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(deleteCandidate.id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

