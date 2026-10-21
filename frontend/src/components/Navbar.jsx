import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/useAuth';
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/tickets') : '/login'}>
          Helpdesk
        </Link>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            {user.role === 'admin' ? (
              <>
                <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/admin/tickets">All Tickets</Link>
                <Link to="/admin/departments">Departments</Link>
              </>
            ) : (
              <>
                <Link to="/tickets">My Tickets</Link>
                <Link to="/tickets/new">Create Ticket</Link>
              </>
            )}
            <span className="user-badge">{user.name} ({user.role})</span>
            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
