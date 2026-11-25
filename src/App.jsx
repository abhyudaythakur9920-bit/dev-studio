import { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ResumeBuilder from './components/ResumeBuilder';
import Portfolio from './components/Portfolio';
import FormBuilder from './components/FormBuilder';

// =============================================================================
// 404 NOT FOUND COMPONENT (React Router Wildcard Route)
function NotFound() {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', margin: '2rem auto', maxWidth: '580px' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🧭</div>
      <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>404</h1>
      <h2 style={{ marginBottom: '0.75rem' }}>Page Not Found</h2>
      <p className="card-description" style={{ marginBottom: '1.75rem' }}>
        The route you navigated to does not exist in the routing table. This demonstrates React Router wildcard (<code>*</code>) handling.
      </p>
      <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
        ← Back to Overview
      </Link>
    </div>
  );
}

// =============================================================================
// MAIN APPLICATION COMPONENT y  
// =============================================================================
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        if (e.key === '1') { e.preventDefault(); navigate('/'); }
        if (e.key === '2') { e.preventDefault(); navigate('/resume'); }
        if (e.key === '3') { e.preventDefault(); navigate('/portfolio'); }
        if (e.key === '4') { e.preventDefault(); navigate('/forms'); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Active module title for the workspace banner
  const getBannerTitle = () => {
    if (location.pathname.startsWith('/resume')) return '📄 Professional Resume Builder & PDF Engine';
    if (location.pathname.startsWith('/portfolio')) return '💼 Interactive Portfolio & Engineering Showcase';
    if (location.pathname.startsWith('/forms')) return '📋 Dynamic Form Studio & Response Engine';
    return null;
  };

  const bannerTitle = getBannerTitle();

  return (
    <div className="app-layout">
      <Navbar />

      <main className="container main-workspace">
        {/* Workspace Quick Header Bar for Modules */}
        {bannerTitle && (
          <div className="workspace-banner no-print">
            <div className="banner-left">
              <Link
                to="/"
                className="btn btn-sm btn-outline"
                style={{ marginBottom: '0.6rem', width: 'fit-content' }}
              >
                ← Back to Overview
              </Link>
              <h1 className="banner-title">{bannerTitle}</h1>
            </div>
            <div className="banner-status">
              <span className="status-dot"></span>
              <span>DevStudio v3.0 • Unified Workspace Active</span>
            </div>
          </div>
        )}

        {/* React Router View Transitions */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<ResumeBuilder />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:id" element={<Portfolio />} />
          <Route path="/forms" element={<FormBuilder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer no-print">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>DevStudio Pro 3.0</strong> — Developer Workspace
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.82rem' }}>
            <span>⚡ React Router 7</span>
            <span>⚛️ React 19</span>
            <span>💾 LocalStorage</span>
            <span>🐙 GitHub REST API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
