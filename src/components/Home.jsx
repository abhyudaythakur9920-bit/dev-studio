export default function Home({ setActiveTab }) {
  const modules = [
    {
      id: 'resume',
      icon: '📄',
      title: 'Resume Builder',
      desc: 'Draft your professional resume with real-time markdown-style formatting and instant print-to-PDF previews.',
      badge: 'Print Ready',
      btnText: 'Launch Resume Builder →',
      btnClass: 'btn-primary'
    },
    {
      id: 'portfolio',
      icon: '💼',
      title: 'Interactive Portfolio',
      desc: 'Showcase web apps, AI tools, and scripts with category filters, technology tags, and instant demo links.',
      badge: 'Interactive',
      btnText: 'Explore Portfolio →',
      btnClass: 'btn-secondary'
    },
    {
      id: 'forms',
      icon: '📋',
      title: 'Custom Form Builder',
      desc: 'Create dynamic custom field forms, test live submissions, and view captured responses right on your dashboard.',
      badge: 'Response Collector',
      btnText: 'Open Form Builder →',
      btnClass: 'btn-secondary'
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <span className="badge">Welcome to DevStudio</span>
        <h1 className="home-title">
          The All-In-One <span className="gradient-text">Developer Workspace</span>
        </h1>
        <p className="home-subtitle">
          Streamline your personal branding and developer utility. Create print-ready resumes, showcase projects, and collect form data — all entirely in your browser.
        </p>

        {/* Quick Launch Action Buttons */}
        <div className="hero-action-buttons">
          <button className="btn btn-primary" onClick={() => setActiveTab('resume')}>
            📄 Build Resume
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('portfolio')}>
            💼 View Portfolio
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('forms')}>
            📋 Create Form
          </button>
        </div>
      </section>

      {/* Feature Navigation Cards Grid */}
      <div className="grid-3 home-cards-grid">
        {modules.map((mod) => (
          <div key={mod.id} className="card home-card" onClick={() => setActiveTab(mod.id)}>
            <div className="home-card-header">
              <span className="home-icon">{mod.icon}</span>
              <span className="badge-small">{mod.badge}</span>
            </div>
            <h3 className="home-card-title">{mod.title}</h3>
            <p className="card-description">{mod.desc}</p>
            <button
              className={`btn btn-sm ${mod.btnClass} home-card-btn`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(mod.id);
              }}
            >
              {mod.btnText}
            </button>
          </div>
        ))}
      </div>

      {/* Workspace Highlights Bar */}
      <div className="card highlights-banner">
        <div className="highlight-item">
          <span className="highlight-icon">⚡</span>
          <div>
            <strong>100% In-Browser</strong>
            <p>Runs purely on client-side React with zero server delay.</p>
          </div>
        </div>
        <div className="highlight-item">
          <span className="highlight-icon">🖨️</span>
          <div>
            <strong>Print &amp; PDF Export</strong>
            <p>Formatted print stylesheets for pixel-perfect resume printing.</p>
          </div>
        </div>
        <div className="highlight-item">
          <span className="highlight-icon">🔒</span>
          <div>
            <strong>Private &amp; Local</strong>
            <p>Your draft resumes and form responses stay on your machine.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
