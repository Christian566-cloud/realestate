import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX, FiHome, FiLogOut, FiUser, FiMessageSquare, FiUpload, FiGrid, FiList, FiLogIn } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };
  const close = () => setOpen(false);

  const dashboardPath = user?.role === 'landlord' ? '/landlord/dashboard' : '/dashboard';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={close}>
          <FiHome /> <span>RealEstate CM</span>
        </Link>
        <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <FiX /> : <FiMenu />}
        </button>
        <ul className={`navbar-menu ${open ? 'active' : ''}`}>
          <li><Link to="/" onClick={close}>Home</Link></li>
          <li><Link to="/properties" onClick={close}><FiList /> Properties</Link></li>
          {user ? (
            <>
              <li><Link to={dashboardPath} onClick={close}><FiGrid /> {user.role === 'landlord' ? 'Landlord Dashboard' : 'Dashboard'}</Link></li>
              <li><Link to="/messages" onClick={close}><FiMessageSquare /> Messages</Link></li>
              {user.role === 'landlord' && (
                <li><Link to="/landlord/dashboard" onClick={close}><FiUpload /> Add Property</Link></li>
              )}
              <li className="nav-user-item">
                <FiUser /> {user.username}
              </li>
              <li><button className="btn-logout" onClick={handleLogout}><FiLogOut /> Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" onClick={close}><FiLogIn /> Login</Link></li>
              <li><Link to="/register" onClick={close} className="nav-register-btn">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
