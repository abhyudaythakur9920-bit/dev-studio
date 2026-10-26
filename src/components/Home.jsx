import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [terminalTab, setTerminalTab] = useState('status');

  const modules = [
    {
      id: 'resume',
      path: '/resume',
      icon: '📄',
      title: 'Professional Resume Builder',
      tag: 'Print & PDF Engine',
      desc: 'Craft developer resumes with live PDF print preview, GitHub profile sync, and persistent LocalStorage saving.',
      badge: 'Print Ready',
      features: ['Multiple Theme Aesthetics', 'Auto-saving with LocalStorage', 'GitHub API Profile Sync', 'Pixel-Perfect Print-to-PDF'],
      btnText: 'Launch Resume Builder →',
      btnClass: 'btn-primary'
    },
    {
      id: 'portfolio',
      path: '/portfolio',
      icon: '💼',
      title: 'Interactive Portfolio & Sync',
      tag: 'GitHub REST API Powered',
      desc: 'Curate software projects with real-time debounced search, category filtering, pagination, and dynamic route inspect.',
      badge: 'Live GitHub API',
      features: ['Live api.github.com Connector', 'Debounced Search & Category Filter', 'Dynamic Route /portfolio/:id', 'Pagination & CRUD Project List'],
      btnText: 'Explore Portfolio →',
      btnClass: 'btn-secondary'
    },
    {
      id: 'forms',
      path: '/forms',
      icon: '📋',
      title: 'Dynamic Form Studio',
      tag: 'Schema-Driven Engine',
      desc: 'Build reactive forms with 8+ input types, test live submissions with instant validation, and export response JSON.',
      badge: 'Response Engine',
      features: ['8+ Input Types (Star, Select, Date)', 'Live Real-Time Field Validation', 'Portable JSON Schema Export', 'LocalStorage Response Storage'],
      btnText: 'Open Form Studio →',
      btnClass: 'btn-secondary'
    },
    {
      id: 'cart',
      path: '/cart',
      icon: '🛒',
      title: 'Global State & Store Sandbox',
      tag: 'Context API + Reducer Pattern',
      desc: 'Interactive shopping cart demonstrating Context API global state, discount voucher calculation, and quantity counters.',
      badge: 'Context API',
      features: ['Global CartContext State', 'Promo Code Discount Engine', 'Quantity Adjust & Subtotals', 'Persistent LocalStorage Sync'],
      btnText: 'Open State Store →',
      btnClass: 'btn-secondary'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="hero-badge-pill">
          <span className="badge-sparkle">✦</span>
          <span>DEVSTUDIO PRO 3.0 • UNIFIED WORKSPACE</span>
        </div>

        <h1 className="home-title">
          The Modern Developer’s <br />
          <span className="gradient-text">Personal Brand &amp; Utility Suite</span>
        </h1>

        <p className="home-subtitle">
          Architect print-ready developer resumes, showcase full-stack projects with live GitHub REST API sync, and explore global state management — entirely in your browser.
        </p>

        {/* Quick Launch Buttons */}
        <div className="hero-action-buttons">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/resume')}>
            <span>📄 Build Resume</span>
            <span className="btn-arrow">→</span>
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/portfolio')}>
            <span>💼 View Portfolio</span>
            <span className="btn-arrow">→</span>
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/forms')}>
            <span>📋 Form Studio</span>
            <span className="btn-arrow">→</span>
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/cart')}>
            <span>🛒 State Store</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>

        {/* Telemetry Value Metrics */}
        <div className="hero-metrics-strip">
          <div className="metric-item">
            <span className="metric-number">React Router</span>
            <span className="metric-label">Dynamic SPA Routes</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-item">
            <span className="metric-number">Context API</span>
            <span className="metric-label">Global State Management</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-item">
            <span className="metric-number">LocalStorage</span>
            <span className="metric-label">Custom Hook Persistence</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-item">
            <span className="metric-number">GitHub API</span>
            <span className="metric-label">Live REST v3 Sync</span>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="home-modules-section">
        <div className="section-header-compact">
          <span className="section-sub-title">CORE CAPABILITIES</span>
          <h2>Integrated Developer Workflows</h2>
        </div>

        <div className="grid-2 home-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {modules.map((mod) => (
            <div
              key={mod.id}
              className="card home-pro-card"
              onClick={() => navigate(mod.path)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-top-glow"></div>
              <div>
                <div className="home-card-header">
                  <div className="home-icon-box">
                    <span className="home-icon">{mod.icon}</span>
                  </div>
                  <span className="pro-badge-accent">{mod.badge}</span>
                </div>

                <span className="card-tag-label">{mod.tag}</span>
                <h3 className="home-card-title">{mod.title}</h3>
                <p className="card-description">{mod.desc}</p>

                <ul className="pro-feature-checklist">
                  {mod.features.map((feat, i) => (
                    <li key={i}>
                      <span className="check-icon">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                className={`btn ${mod.btnClass} home-card-btn`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(mod.path);
                }}
              >
                <span>{mod.btnText}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Live Interactive Developer Terminal Preview */}
      <section className="card home-terminal-card" style={{ marginTop: '2.5rem' }}>
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="terminal-tabs">
            <button
              type="button"
              className={`term-tab ${terminalTab === 'status' ? 'active' : ''}`}
              onClick={() => setTerminalTab('status')}
            >
              devstudio --status
            </button>
            <button
              type="button"
              className={`term-tab ${terminalTab === 'schema' ? 'active' : ''}`}
              onClick={() => setTerminalTab('schema')}
            >
              stack.json
            </button>
            <button
              type="button"
              className={`term-tab ${terminalTab === 'shortcuts' ? 'active' : ''}`}
              onClick={() => setTerminalTab('shortcuts')}
            >
              shortcuts.md
            </button>
          </div>
          <span className="terminal-env-tag">REACT 19 • VITE 8</span>
        </div>

        <div className="terminal-body code-font">
          {terminalTab === 'status' && (
            <div className="terminal-output">
              <p><span className="text-cyan">➜</span> <span className="text-emerald">devstudio</span> system-check --verbose</p>
              <p className="text-muted">Analyzing local browser environment...</p>
              <p><span className="text-emerald">✔</span> React Router: <span className="text-cyan">Routes &amp; Dynamic /portfolio/:id OK</span></p>
              <p><span className="text-emerald">✔</span> Global State: <span className="text-cyan">CartContext Provider Active</span></p>
              <p><span className="text-emerald">✔</span> Custom Hooks: <span className="text-cyan">useLocalStorage auto-syncing</span></p>
              <p><span className="text-emerald">✔</span> REST API Connector: <span className="text-cyan">api.github.com live fetch</span></p>
              <p className="terminal-highlight-line">⚡ All topics active. Ready for instructor demonstration and evaluation.</p>
            </div>
          )}

          {terminalTab === 'schema' && (
            <div className="terminal-output">
              <pre>{`{
  "project": "DevStudio Pro",
  "version": "3.0.0",
  "curriculumFeatures": {
    "reactRouter": { "routes": ["/", "/resume", "/portfolio", "/portfolio/:id", "/forms", "/cart", "*"] },
    "stateManagement": { "contextApi": "CartContext", "customHooks": ["useLocalStorage"], "local": "useState" },
    "hooksUsed": ["useState", "useEffect", "useRef", "useMemo", "useCallback", "useParams"],
    "restApis": ["GitHub v3 API", "RandomUser API"]
  }
}`}</pre>
            </div>
          )}

          {terminalTab === 'shortcuts' && (
            <div className="terminal-output">
              <p><span className="text-cyan">Ctrl + P</span> : Print Current Resume to Pixel-Perfect PDF</p>
              <p><span className="text-cyan">Alt + 1</span> : Jump to Overview (/)</p>
              <p><span className="text-cyan">Alt + 2</span> : Open Resume Builder (/resume)</p>
              <p><span className="text-cyan">Alt + 3</span> : Open Portfolio (/portfolio)</p>
              <p><span className="text-cyan">Alt + 4</span> : Open Form Studio (/forms)</p>
              <p><span className="text-cyan">Alt + 5</span> : Open State Store (/cart)</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
