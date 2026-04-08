import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { isSuperAdmin } from '../utils/auth'

export default function UserForm({ currentUser }) {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [isStaff, setIsStaff] = useState(false)
  const [isSuperuser, setIsSuperuser] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!isEdit) return
    ;(async () => {
      const res = await fetch(`${API_BASE_URL}/users/${id}/`, { credentials: 'include' })
      if (res.ok) {
        const user = await res.json()
        setUsername(user.username)
        setEmail(user.email)
        setIsStaff(user.is_staff)
        setIsSuperuser(user.is_superuser)
        setIsActive(user.is_active)
      } else {
        setError('Failed to load user')
      }
    })()
  }, [id, isEdit])

  if (!isSuperAdmin(currentUser)) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">Only super admin can manage users.</div>
      </div>
    )
  }

  function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let cookie of cookies) {
      cookie = cookie.trim()
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}

 const onSubmit = async (e) => {
  e.preventDefault()

  const payload = {
    username,
    email,
    is_staff: isStaff,
    is_superuser: isSuperuser,
    is_active: isActive,
  }

  if (!isEdit) payload.password = password

  try {
    const csrftoken = getCookie('csrftoken')

    const res = await fetch(`${API_BASE_URL}/users/${isEdit ? `${id}/` : ''}`, {
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
      throw new Error(Object.values(data)[0] || 'Failed to save user')
    }

    setMessage(`User ${isEdit ? 'updated' : 'created'} successfully`)
    setError(null)
    setTimeout(() => navigate('/users'), 600)
  } catch (err) {
    setError(err.message)
    setMessage(null)
  }
}

  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3">
        <button className="btn btn-secondary" onClick={() => navigate('/users')}>Back to users</button>
      </div>
      <div className="card shadow mb-12">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">{isEdit ? 'Edit User' : 'Create User'}</h6>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-group"><label>Username</label><input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
            <div className="form-group"><label>Email</label><input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            {!isEdit && (
              <div className="form-group"><label>Password</label><input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            )}
            <div className="form-group form-check">
              <input type="checkbox" className="form-check-input" id="staff" checked={isStaff} onChange={() => setIsStaff(!isStaff)} />
              <label htmlFor="staff" className="form-check-label">Staff</label>
            </div>
            <div className="form-group form-check">
              <input type="checkbox" className="form-check-input" id="superuser" checked={isSuperuser} onChange={() => setIsSuperuser(!isSuperuser)} />
              <label htmlFor="superuser" className="form-check-label">Superuser</label>
            </div>
            <div className="form-group form-check">
              <input type="checkbox" className="form-check-input" id="active" checked={isActive} onChange={() => setIsActive(!isActive)} />
              <label htmlFor="active" className="form-check-label">Active</label>
            </div>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Update' : 'Create'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}
