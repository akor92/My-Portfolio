import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const link = ({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '');

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <h2 className="brand" style={{ padding: '0 14px 20px' }}>DevFolio</h2>
        <NavLink to="/admin" end className={link}>Dashboard</NavLink>
        <NavLink to="/admin/projects" className={link}>Projects</NavLink>
        <NavLink to="/admin/posts" className={link}>Posts</NavLink>
        <NavLink to="/admin/messages" className={link}>Messages</NavLink>
        <div style={{ marginTop: 30, padding: '0 14px' }}>
          <p className="muted" style={{ fontSize: '0.85rem' }}>{user?.name}</p>
          <button className="btn btn-sm" onClick={() => { logout(); navigate('/login'); }}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
