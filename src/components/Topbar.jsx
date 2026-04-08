export default function Topbar({ username = 'SFA Admin', onLogout }) {
  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
        <i className="fa fa-bars"></i>
      </button>
      <ul className="navbar-nav ml-auto">
        <div className="topbar-divider d-none d-sm-block"></div>
        <li className="nav-item dropdown no-arrow" style={{ display: 'flex', alignItems: 'center' }}>
          <span className="mr-2 d-none d-lg-inline text-gray-600 small">{username}</span>
          <img className="img-profile rounded-circle" src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="profile" />
          {onLogout && <button className="btn btn-sm btn-danger ml-3" onClick={onLogout}>Logout</button>}
        </li>
      </ul>
    </nav>
  )
}
