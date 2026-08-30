export default function Navbar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: '🏠 Home' },
    { id: 'resume', label: '📄 Resume Builder' },
    { id: 'portfolio', label: '💼 Portfolio' },
    { id: 'forms', label: '📋 Form Builder' },
  ];

  return (
    <nav className="navbar no-print">
      <div className="container nav-content">
        <div className="nav-logo" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <span className="logo-bracket"></span>
          <span className="logo-text">DevStudio</span>
          <span className="logo-bracket"></span>
          <span className="badge-small" style={{ marginLeft: '0.5rem' }}>v2.0 Workspace</span>
        </div>

        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
