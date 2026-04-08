import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../api'
import { isSuperAdmin } from '../utils/auth'
import { apiFetch } from '../utils/ApiFetch'

export default function Users({ currentUser }) {
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load users')
      setUsers(await res.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => { load() }, [])

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/${id}/`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.status === 204) {
        setMessage('User deleted')
        setError(null)
        load()
      } else {
        const payload = await res.json()
        throw new Error(payload.detail || 'Failed to delete user')
      }
    } catch (err) {
      setError(err.message)
    }
  }

const resetPassword = async (id) => {
  const newPassword = window.prompt('Enter new password for user')
  if (!newPassword) return

  try {
    const res = await apiFetch(`${API_BASE_URL}/users/${id}/reset_password/`, {
      method: 'POST',
      body: JSON.stringify({ password: newPassword }),
    })

    if (!res.ok) {
      const payload = await res.json()
      throw new Error(payload.detail || 'Failed to reset password')
    }

    setMessage('Password reset')
    setError(null)
  } catch (err) {
    setError(err.message)
  }
}


  return (
    <div className="container-fluid">
      <div className="row ml-0 mb-3" style={{ gap: '0.5rem' }}>
        <h4>Users</h4>
        {isSuperAdmin(currentUser) && (
          <button className="btn btn-success" onClick={() => navigate('/users/new')}>
            <i className="fa fa-plus mr-2" /> Create new user
          </button>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="card shadow mb-12">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-hover" width="100%" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Staff</th>
                  <th>Superuser</th>
                  <th>Active</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.is_staff ? 'Yes' : 'No'}</td>
                    <td>{user.is_superuser ? 'Yes' : 'No'}</td>
                    <td>{user.is_active ? 'Yes' : 'No'}</td>
                    <td>{new Date(user.date_joined).toLocaleString()}</td>
                    <td>
                      {isSuperAdmin(currentUser) ? (
                        <>
                          <button className="btn btn-sm btn-warning mr-1" onClick={() => navigate(`/users/${user.id}/edit`)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-info mr-1" onClick={() => resetPassword(user.id)}>
                            Reset Password
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteUser(user.id)}>
                            Delete
                          </button>
                        </>
                      ) : (
                        <span className="text-muted">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
