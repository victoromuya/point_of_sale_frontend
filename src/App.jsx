import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import Customers from './components/Customers'
import CustomerForm from './components/CustomerForm'
import Products from './components/Products'
import ProductForm from './components/ProductForm'
import Sales from './components/Sales'
import SalesForm from './components/SaleForm'
import Expenses from './components/Expenses'
import ExpenseForm from './components/ExpenseForm'
import Warehouses from './components/Warehouses'
import WarehouseForm from './components/WarehouseForm'
import Users from './components/Users'
import UserForm from './components/UserForm'
import Login from './components/Login'
import { getCurrentUserApi, logoutApi } from './utils/auth'
import InviteStaff from './components/InviteStaff'
import AcceptInvite from './components/AcceptInvite'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import AuditTrail from './components/poslogs/AuditTrail'
import LoginLogs from './components/poslogs/LoginLogs'
import FlaggedStaffs from './components/poslogs/FlaggedStaffs'

function AppContent() {
  const { user, loading, setUser } = useAuth()

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const publicPaths = ['/login', '/accept-invite/']

    const isPublic = publicPaths.some(path =>
      location.pathname.startsWith(path)
    )

    if (!loading && !user && !isPublic) {
      navigate('/login')
    }
  }, [user, loading, location, navigate])

  const handleLogout = async () => {
    await logoutApi()
    setUser(null)
  }

  if (loading) return null

  if (!user && location.pathname !== '/login' && !location.pathname.startsWith('/accept-invite')) {
    return null
  }

  if (location.pathname === '/login') {
    return <Login />
  }

  return (
    <div id="wrapper">
      <Sidebar currentUser={user} />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          <Topbar username={user?.username} onLogout={handleLogout} />
          <div className="container-fluid">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/products" element={<Products currentUser={user} />} />
              <Route path="/products/new" element={<ProductForm currentUser={user} />} />
              <Route path="/products/:id/edit" element={<ProductForm currentUser={user} />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/sales/new" element={<SalesForm />} />
              <Route path="/warehouses" element={<Warehouses currentUser={user} />} />
              <Route path="/warehouses/new" element={<WarehouseForm />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/expenses/new" element={<ExpenseForm />} />
              <Route path="/users" element={<Users currentUser={user} />} />
              <Route path="/users/new" element={<UserForm currentUser={user} />} />
              <Route path="/users/:id/edit" element={<UserForm currentUser={user} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/invitestaff" element={<InviteStaff />} />
              <Route path="/accept-invite/:token" element={<AcceptInvite />} />

              <Route path="/logs/audit-trail" element={<AuditTrail />} />
              <Route path="/logs/login-logs" element={<LoginLogs />} />
              <Route path="/logs/flagged-staffs" element={<FlaggedStaffs />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUserApi()
      setCurrentUser(user)
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    await logoutApi()
    setCurrentUser(null)
  }

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  return (
    
      <AuthProvider>
        <AppContent currentUser={currentUser} onLogin={handleLogin} onLogout={handleLogout} />
        <ToastContainer />
      </AuthProvider>
    
      
    
  )
}

