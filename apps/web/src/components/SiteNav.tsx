import { Link } from 'react-router-dom';

export function SiteNav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          Akor<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <div>
          <a href="/#projects">Projects</a>
          <a href="/#writing">Writing</a>
          <a href="/#contact">Contact</a>
          <Link to="/login">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
