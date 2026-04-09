import { NavLink } from 'react-router-dom'
import { isSuperAdmin } from '../utils/auth'
import { useState } from 'react'


export default function Sidebar({ currentUser }) {
  const linkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link'
  const [logsOpen, setLogsOpen] = useState(false) 

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <img className="img-profile" src="" alt="logo" />
        </div>
        <span></span>
      </div>

      <ul className="navbar-nav">
        <li className="nav-item">
          <NavLink to="/" end className={linkClass}>
            <i className="fa fa-home nav-icon" />
            Dashboard
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/customers" className={linkClass}>
            <i className="fa fa-users nav-icon" />
            Customers
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/products" className={linkClass}>
            <i className="fa fa-cube nav-icon" />
            Products
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/sales" className={linkClass}>
            <i className="fa fa-shopping-cart nav-icon" />
            Sales
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/warehouses" className={linkClass}>
            <i className="fa fa-building nav-icon" />
            Warehouses
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/expenses" className={linkClass}>
            <i className="fa fa-money nav-icon" />
            Expenses
          </NavLink>
        </li>

        {isSuperAdmin(currentUser) && (
          <>
            <li className="nav-item">
              <NavLink to="/users" className={linkClass}>
                <i className="fa fa-user-circle nav-icon" />
                Staffs
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/invitestaff" className={linkClass}>
                <i className="fa fa-user-circle nav-icon" />
                Invite Staff
              </NavLink>
            </li>

            {/* Logs Module */}
            <li className="nav-item">
              <span className="nav-link" onClick={() => setLogsOpen(!logsOpen)}>
                <i className="fa fa-file-alt nav-icon" />
                Logs
                <i className={`fa ${logsOpen ? 'fa-chevron-down' : 'fa-chevron-right'} ml-auto`} />
              </span>
              {logsOpen && (
                <ul className="nav-submenu">
                  <li>
                    <NavLink to="/logs/audit-trail" className={linkClass}>
                      <i className="fa fa-list nav-icon" />
                      Audit Trail
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/logs/login-logs" className={linkClass}>
                      <i className="fa fa-sign-in-alt nav-icon" />
                      Login Logs
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/logs/flagged-staffs" className={linkClass}>
                      <i className="fa fa-exclamation-triangle nav-icon" />
                      Flagged Staffs
                    </NavLink>
                  </li>
                </ul>
              )}
            </li>
          </>
        )}
      </ul>
    </aside>
  )
}