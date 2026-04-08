import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { isSuperAdmin } from '../utils/auth'

export default function ProductForm({ currentUser }) {
  const { id } = useParams()
  const isEdit = Boolean(id)

  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [price, setPrice] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

   useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      const res = await fetch(`${API_BASE_URL}/products/${id}/`, { credentials: 'include' })
      if (res.ok) {
        const product = await res.json()
        
        setName(product.name)
        setDescription(product.description)
        setQuantity(product.quantity)
        setPrice(product.price)
        setStatus(product.status)
      } else {
        setError('Failed to load product')
      }
    })()
  }, [id, isEdit])


   if (!isSuperAdmin(currentUser)) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">Only super admin can create or update products.</div>
      </div>
    )
  }

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = cookie.substring(name.length + 1);
                break;
            }
        }
    }
    return cookieValue;
}

 

  const onSubmit = async (e) => {
  e.preventDefault()

  const payload = {
    name,
    description,
    quantity,
    price,
    status
  }

  try {
    const csrftoken = getCookie('csrftoken')

    const res = await fetch(`${API_BASE_URL}/products/${isEdit ? `${id}/` : ''}`, {
      method: isEdit ? 'PUT' : 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(Object.values(data)[0] || 'Failed to save product')
    }

    setMessage(`Product ${isEdit ? 'updated' : 'created'} successfully`)
    setError(null)
    setTimeout(() => navigate('/products'), 600)
  } catch (err) {
    setError(err.message)
    setMessage(null)
  }
}

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/products')}>Back to products</button>
      </div>
      <div className="card shadow mb-12">
        <div className="card-header py-3"><h6 className="m-0 font-weight-bold text-primary">{isEdit ? 'Edit Product' : 'Create Product'}</h6></div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-group"><label>Name</label><input className="form-control" value={name} onChange={(e)=>setName(e.target.value)} required /></div>
            <div className="form-group"><label>Description</label><textarea className="form-control" value={description} onChange={(e)=>setDescription(e.target.value)} /></div>
            <div className="form-group"><label>Quantity</label><input type="number" className="form-control" min="0" value={quantity} onChange={(e)=>setQuantity(Number(e.target.value))} required /></div>
            <div className="form-group"><label>Price</label><input type="number" className="form-control" min="0" step="0.01" value={price} onChange={(e)=>setPrice(Number(e.target.value))} required /></div>
            <div className="form-group"><label>Status</label><select className="form-control" value={status} onChange={(e)=>setStatus(e.target.value)}>
                <option value="ACTIVE">Select Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ACTIVE">Inactive</option>
              </select>
              </div>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Update Product' : 'Create Product'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
