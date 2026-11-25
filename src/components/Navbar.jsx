import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const navItems = [
    { to: '/', label: '🏠 Overview' },
    { to: '/resume', label: '📄 Resume', badge: 'PDF' },
    { to: '/portfolio', label: '💼 Portfolio', badge: 'API' },
    { to: '/forms', label: '📋 Forms', badge: 'v2' },
  ];

  return (
    <nav className="navbar no-print">
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          <div className="logo-symbol">
            <span className="logo-sparkle">✦</span>
          </div>
          <div className="logo-text-group">
            <span className="logo-title">DevStudio</span>
            <span className="logo-pro-badge">PRO</span>
          </div>
        </Link>

        <div className="nav-tabs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span>{item.label}</span>
              {item.badge && <span className="tab-pill-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          <div className="system-status-indicator">
            <span className="status-beacon"></span>
            <span className="status-label">Operational</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline nav-action-btn"
            onClick={() => window.print()}
            title="Quick Print"
          >
            🖨️ Print
          </button>
        </div>
      </div>
    </nav>
  );
}
