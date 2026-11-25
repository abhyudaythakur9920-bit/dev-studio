import { useState, useRef } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const RESUME_PRESETS = {
  apiEngineer: {
    name: 'Alex Rivera',
    role: 'Senior API & Backend Architect',
    email: 'alex.rivera@dev.io',
    phone: '+1 (555) 382-9012',
    location: 'San Francisco, CA',
    website: 'https://alexrivera.dev',
    summary: 'Senior Backend Architect specializing in high-throughput RESTful APIs, distributed microservices, and event-driven architectures. Proven track record reducing p99 response latencies by 42% and scaling cloud services to 25M+ daily requests.',
    skills: 'RESTful APIs, GraphQL, OpenAPI 3.0, Go, Node.js, Python, Redis, PostgreSQL, Docker, Kubernetes, Kafka, CI/CD, Postman, Microservices',
    experience: 'Staff API Architect at CloudGate (2023 - Present):\n• Architected distributed REST API gateway servicing 25M+ daily requests across 4 global regions.\n• Reduced p99 response latency by 42% through Redis pipelining and connection pooling.\n• Implemented automated OpenAPI contract testing and rate-limiting middleware.\n\nSenior Backend Engineer at WebLabs (2021 - 2023):\n• Designed authenticated developer REST endpoints with JWT bearer authentication and webhook dispatchers.\n• Decreased cloud compute expenses by $65,000 annually through microservice consolidation.\n• Mentored 6 junior engineers on REST API design standards and unit testing practices.',
    projects: [
      {
        title: 'Distributed REST API Gateway',
        tech: 'Go, REST API, Redis, Docker',
        desc: 'Implemented token-bucket rate limiting, distributed tracing, and telemetry aggregation with sub-25ms response latency.'
      },
      {
        title: 'DevStudio REST Client & Mock CRUD',
        tech: 'React, REST API, Fetch API, JSON Schema',
        desc: 'Engineered an in-browser REST HTTP client with live header diagnostics, status code analysis, and local mock database collections.'
      }
    ],
    education: 'B.S. in Computer Science — University of California, Berkeley (2017 - 2021)'
  },
  fullStack: {
    name: 'Sarah Chen',
    role: 'Lead Full Stack Engineer',
    email: 'sarah.chen@techhub.io',
    phone: '+1 (555) 819-4321',
    location: 'Seattle, WA',
    website: 'https://sarahchen.io',
    summary: 'Full Stack Engineer with 6+ years designing responsive web applications and performant cloud services. Deep expertise in React, TypeScript, Node.js, and cloud database optimization with a focus on accessible user experiences.',
    skills: 'React, TypeScript, Next.js, Node.js, REST APIs, TailwindCSS, Express, MongoDB, PostgreSQL, GraphQL, Vitest, Git',
    experience: 'Lead Full Stack Engineer at Apex Labs (2022 - Present):\n• Spearheaded complete frontend redesign utilizing React 19, increasing user session length by 35%.\n• Developed reusable component design system adopted by 4 engineering teams.\n• Optimized bundle size by 48% via dynamic code-splitting and asset minification.\n\nFrontend Engineer at CodeCraft (2019 - 2022):\n• Delivered 14 customer-facing web apps with WCAG 2.1 AA accessibility compliance.\n• Integrated live REST APIs with zero-flicker optimistic UI updates.',
    projects: [
      {
        title: 'DevMetrics Observability Suite',
        tech: 'React, TypeScript, ChartJS, REST APIs',
        desc: 'Interactive performance monitoring dashboard displaying real-time server vitals and throughput telemetry.'
      },
      {
        title: 'Dynamic Form Studio & Response Engine',
        tech: 'React, JSON Schema, LocalStorage',
        desc: 'Schema-driven form generator with live validation, responses collector, and CSV/JSON export capability.'
      }
    ],
    education: 'B.S. in Software Engineering — University of Washington (2015 - 2019)'
  },
  aiEngineer: {
    name: 'David Vance',
    role: 'AI Systems & Full-Stack Engineer',
    email: 'david.vance@neural.ai',
    phone: '+1 (555) 742-1089',
    location: 'Austin, TX',
    website: 'https://davidvance.ai',
    summary: 'AI Systems Engineer passionate about productionizing LLMs and high-concurrency inference pipelines. Specialized in FastAPI microservices, vector search indexing, and real-time streaming interfaces.',
    skills: 'Python, FastAPI, PyTorch, LangChain, React, TypeScript, Vector DBs, REST APIs, Docker, Redis, OpenAI API, AWS',
    experience: 'AI Engineer at SynthMind (2023 - Present):\n• Built asynchronous LLM pipeline processing 100,000+ daily prompts with sub-800ms time-to-first-token.\n• Deployed retrieval-augmented generation (RAG) system with Pinecone vector embeddings.\n\nBackend Developer at DataPulse (2021 - 2023):\n• Developed REST APIs for data pipelines ingesting 2TB of daily logs using Python and FastAPI.',
    projects: [
      {
        title: 'NeuralScribe Code Reviewer',
        tech: 'Python, FastAPI, OpenAI REST, PyTest',
        desc: 'Autonomous code auditor that analyzes pull requests, discovers security vulnerabilities, and generates unit tests.'
      }
    ],
    education: 'M.S. in Artificial Intelligence — University of Texas at Austin (2021)'
  }
};

export default function ResumeBuilder() {
  const [data, setData] = useLocalStorage('devstudio_resume_data', RESUME_PRESETS.apiEngineer);
  const nameInputRef = useRef(null);
  const [theme, setTheme] = useState('modern'); // 'modern' | 'executive' | 'minimal'
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // API Studio States (GitHub REST & Random Developer Identity)
  const [activeApiTab, setActiveApiTab] = useState('github'); // 'github' | 'random'
  const [githubSyncUser, setGithubSyncUser] = useState('torvalds');
  const [fetchedRepos, setFetchedRepos] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [apiTelemetry, setApiTelemetry] = useState({
    method: 'READY',
    url: 'https://api.github.com',
    status: 200,
    latency: 64,
    timestamp: 'Initial Engine Standby',
    payload: { engine: 'DevStudio REST Gateway v3.0', status: 'Online' }
  });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  // Project management
  const handleProjectChange = (idx, field, value) => {
    const updated = [...(data.projects || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setData({ ...data, projects: updated });
  };

  const handleAddProject = () => {
    const newProj = {
      title: 'New Cloud Microservice',
      tech: 'Go, Docker, REST API',
      desc: 'Engineered performant full-stack modules with automated tests and CI/CD pipelines.'
    };
    setData({ ...data, projects: [...(data.projects || []), newProj] });
  };

  const handleRemoveProject = (idx) => {
    setData({ ...data, projects: data.projects.filter((_, i) => i !== idx) });
  };

  // 1. GITHUB REST API INTEGRATION
  const handleFetchGithubApi = async (userInput) => {
    const raw = (userInput || githubSyncUser || '').trim();
    const targetUser = raw
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^@/, '')
      .split('/')[0]
      .split('?')[0]
      .trim();
    if (!targetUser) return;

    setApiLoading(true);
    setSyncMsg(null);
    const startTime = performance.now();

    try {
      const userRes = await fetch(`https://api.github.com/users/${targetUser}`);
      const latency = Math.round(performance.now() - startTime);

      if (!userRes.ok) {
        if (userRes.status === 403) {
          throw new Error('GitHub API rate limit reached (60/hr). Try another user or API.');
        }
        throw new Error(`GitHub user "${targetUser}" not found (${userRes.status})`);
      }

      const user = await userRes.json();

      // Fetch top repos
      const reposRes = await fetch(`https://api.github.com/users/${targetUser}/repos?sort=stars&per_page=6`);
      let repos = [];
      if (reposRes.ok) {
        repos = await reposRes.json();
        setFetchedRepos(repos);
      }

      setApiTelemetry({
        method: 'GET',
        url: `https://api.github.com/users/${targetUser}`,
        status: 200,
        latency,
        timestamp: new Date().toLocaleTimeString(),
        payload: {
          login: user.login,
          name: user.name,
          company: user.company,
          public_repos: user.public_repos,
          followers: user.followers,
          repos_available: repos.length
        }
      });

      // Update resume with authentic GitHub data
      setData((prev) => ({
        ...prev,
        name: user.name || user.login || prev.name,
        location: user.location || prev.location,
        website: user.blog ? (user.blog.startsWith('http') ? user.blog : `https://${user.blog}`) : prev.website,
        summary: user.bio ? `${user.bio} Specializing in building scalable developer platforms and distributed systems.` : prev.summary,
        avatar: user.avatar_url || prev.avatar,
        skills: prev.skills.includes('Git') ? prev.skills : `${prev.skills}, Git, GitHub API`
      }));

      setSyncMsg(`🐙 Synced GitHub profile for @${targetUser} with ${repos.length} live repositories ready!`);
      setTimeout(() => setSyncMsg(null), 5000);
    } catch (err) {
      setSyncMsg(`GitHub API: ${err.message}`);
      setApiTelemetry({
        method: 'GET',
        url: `https://api.github.com/users/${targetUser}`,
        status: 404,
        latency: Math.round(performance.now() - startTime),
        timestamp: new Date().toLocaleTimeString(),
        payload: { error: err.message }
      });
    } finally {
      setApiLoading(false);
    }
  };

  const handleImportSingleRepo = (repo) => {
    const newProj = {
      title: repo.name,
      tech: `${repo.language || 'Software'}, Git, GitHub API`,
      desc: repo.description || `Maintained open-source repository on GitHub with ${repo.stargazers_count} stars.`
    };
    setData((prev) => ({
      ...prev,
      projects: [newProj, ...(prev.projects || []).slice(0, 3)]
    }));
    setSyncMsg(`📥 Imported "${repo.name}" directly to resume projects!`);
    setTimeout(() => setSyncMsg(null), 3000);
  };

  const handleImportAllRepos = () => {
    if (!fetchedRepos.length) return;
    const imported = fetchedRepos.slice(0, 3).map((r) => ({
      title: r.name,
      tech: `${r.language || 'Software'}, Git, GitHub API`,
      desc: r.description || `Open source project on GitHub with ${r.stargazers_count} stars.`
    }));
    setData((prev) => ({
      ...prev,
      projects: imported
    }));
    setSyncMsg(`📥 Successfully imported top ${imported.length} repositories into resume!`);
    setTimeout(() => setSyncMsg(null), 3500);
  };

  // 2. RANDOMUSER.ME IDENTITY API
  const handleFetchRandomIdentity = async () => {
    setApiLoading(true);
    setSyncMsg(null);
    const startTime = performance.now();
    try {
      const res = await fetch('https://randomuser.me/api/?results=1&nat=us,gb,ca,de,au');
      const latency = Math.round(performance.now() - startTime);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const json = await res.json();
      const user = json.results[0];

      setApiTelemetry({
        method: 'GET',
        url: 'https://randomuser.me/api/?results=1',
        status: 200,
        latency,
        timestamp: new Date().toLocaleTimeString(),
        payload: {
          name: `${user.name.first} ${user.name.last}`,
          email: user.email,
          city: user.location.city,
          country: user.location.country,
          registeredYears: user.registered?.age || 5
        }
      });

      setData((prev) => ({
        ...prev,
        name: `${user.name.first} ${user.name.last}`,
        email: user.email,
        phone: user.phone,
        location: `${user.location.city}, ${user.location.country}`,
        avatar: null
      }));

      setSyncMsg(`🎲 Loaded authentic persona for ${user.name.first} ${user.name.last} (${latency}ms)!`);
      setTimeout(() => setSyncMsg(null), 4000);
    } catch (err) {
      setSyncMsg(`RandomUser API Error: ${err.message}`);
    } finally {
      setApiLoading(false);
    }
  };

  // Export Resume JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${data.name.replace(/\s+/g, '_').toLowerCase()}_resume.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="module-container">
      {/* Module Header */}
      <div className="module-header no-print">
        <div>
          <h2>📄 Professional Resume Builder &amp; PDF Engine</h2>
          <p>Design executive developer resumes with multi-theme aesthetics, live print preview, and pixel-perfect PDF export.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={handleExportJson} title="Backup resume as JSON">
            📥 Export JSON
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {/* Preset Profiles Bar */}
      <div className="card no-print resume-preset-bar">
        <div className="preset-selector-group">
          <span className="preset-label">📑 Quick Profiles:</span>
          <button
            className={`preset-btn ${data.role.includes('API') ? 'active' : ''}`}
            onClick={() => setData(RESUME_PRESETS.apiEngineer)}
          >
            ⚡ API &amp; Backend Architect
          </button>
          <button
            className={`preset-btn ${data.role.includes('Full') ? 'active' : ''}`}
            onClick={() => setData(RESUME_PRESETS.fullStack)}
          >
            💻 Full-Stack Engineer
          </button>
          <button
            className={`preset-btn ${data.role.includes('AI') ? 'active' : ''}`}
            onClick={() => setData(RESUME_PRESETS.aiEngineer)}
          >
            🤖 AI Systems Engineer
          </button>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Tip: Use the Developer API Suite below to auto-fetch real data!
        </div>
      </div>

      {/* =========================================================================
          LIVE DEVELOPER API SUITE & ASSISTANT (no-print)
          ========================================================================= */}
      <div className="card no-print resume-api-hub">
        <div className="api-hub-top">
          <div className="api-hub-title-group">
            <span className="api-hub-title">
              <span className="text-cyan">🌐</span> Live Developer API Suite &amp; Intelligence
            </span>
            <span className="badge">REST Engine Ready</span>
          </div>

          <div className="api-tabs-nav">
            <button
              className={`api-tab-btn ${activeApiTab === 'github' ? 'active' : ''}`}
              onClick={() => setActiveApiTab('github')}
            >
              🐙 GitHub REST API
            </button>
            <button
              className={`api-tab-btn ${activeApiTab === 'random' ? 'active' : ''}`}
              onClick={() => setActiveApiTab('random')}
            >
              🎲 Random Developer API
            </button>
          </div>
        </div>

        {/* Tab 1: GitHub API */}
        {activeApiTab === 'github' && (
          <div className="api-panel-content">
            <div className="github-api-form-row">
              <div style={{ flex: 1, minWidth: '240px' }}>
                <input
                  className="form-input sync-input"
                  style={{ width: '100%' }}
                  placeholder="Paste GitHub link or handle (e.g. https://github.com/username or @handle)..."
                  value={githubSyncUser}
                  onChange={(e) => setGithubSyncUser(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchGithubApi(githubSyncUser)}
                />
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleFetchGithubApi(githubSyncUser)}
                disabled={apiLoading}
              >
                {apiLoading ? '⚡ Querying GitHub API...' : '🚀 Fetch Profile & Repos'}
              </button>
            </div>

            <div className="github-chip-list">
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Try Instant Profiles:</span>
              {['torvalds', 'shadcn', 'gaearon', 'yyx990803', 'sindresorhus'].map((user) => (
                <button
                  key={user}
                  type="button"
                  className="github-chip"
                  onClick={() => {
                    setGithubSyncUser(user);
                    handleFetchGithubApi(user);
                  }}
                >
                  @{user}
                </button>
              ))}
            </div>

            {fetchedRepos.length > 0 && (
              <div className="github-repo-import-box">
                <div className="flex-between">
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    📦 Public Repositories from api.github.com ({fetchedRepos.length} ready)
                  </span>
                  <button className="btn btn-sm btn-outline" onClick={handleImportAllRepos}>
                    ⚡ Import Top 3 to Resume Projects
                  </button>
                </div>
                <div className="repo-grid">
                  {fetchedRepos.map((repo) => (
                    <div key={repo.id} className="repo-card-mini">
                      <div>
                        <div className="repo-card-title">
                          <span>{repo.name}</span>
                          <span style={{ fontSize: '0.74rem', color: '#fbbf24' }}>⭐ {repo.stargazers_count}</span>
                        </div>
                        <p className="repo-card-desc">{repo.description || 'Open source software repository.'}</p>
                      </div>
                      <div className="flex-between" style={{ marginTop: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>{repo.language || 'Code'}</span>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                          onClick={() => handleImportSingleRepo(repo)}
                        >
                          + Add to Resume
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Random Developer Identity API */}
        {activeApiTab === 'random' && (
          <div className="api-panel-content">
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ color: '#ffffff', marginBottom: '0.3rem' }}>🎲 Random Developer Persona Generator</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Calls <code>https://randomuser.me/api/</code> to inject authentic developer contact credentials and international location.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleFetchRandomIdentity}
                disabled={apiLoading}
              >
                {apiLoading ? 'Generating...' : '⚡ Generate Developer Identity'}
              </button>
            </div>
          </div>
        )}

        {/* Live API Telemetry Readout */}
        <div className="api-telemetry-bar">
          <div className="api-telemetry-left">
            <span
              className={`telemetry-beacon ${
                apiTelemetry.status === 200 ? 'beacon-success' : apiTelemetry.status ? 'beacon-error' : 'beacon-idle'
              }`}
            ></span>
            <span>REST API Endpoint: <strong style={{ color: '#ffffff' }}>{apiTelemetry.url}</strong></span>
            {apiTelemetry.status && (
              <span className={`telemetry-status-pill ${apiTelemetry.status === 200 ? 'status-200' : 'status-err'}`}>
                {apiTelemetry.status} {apiTelemetry.status === 200 ? 'OK' : 'ERROR'}
              </span>
            )}
            {apiTelemetry.latency > 0 && <span>⚡ {apiTelemetry.latency}ms</span>}
          </div>
          {apiTelemetry.payload && (
            <button
              className="btn-icon"
              style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }}
              onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
            >
              {showTelemetryDrawer ? '▲ Hide Payload' : '▼ Inspect API JSON'}
            </button>
          )}
        </div>

        {showTelemetryDrawer && apiTelemetry.payload && (
          <div className="telemetry-code-drawer">
            {JSON.stringify(apiTelemetry.payload, null, 2)}
          </div>
        )}
      </div>

      {syncMsg && (
        <div className={`no-print ${syncMsg.includes('Error') || syncMsg.includes('Failed') ? 'alert-danger' : 'alert-success'}`} style={{ marginBottom: '1rem' }}>
          {syncMsg}
        </div>
      )}

      {/* Theme & Canvas Controls Toolbar */}
      <div className="card no-print resume-theme-toolbar">
        <div className="toolbar-left">
          <span className="theme-label">Resume Theme:</span>
          <div className="theme-toggle-group">
            <button
              className={`theme-pill-btn ${theme === 'modern' ? 'active' : ''}`}
              onClick={() => setTheme('modern')}
            >
              Modern Tech
            </button>
            <button
              className={`theme-pill-btn ${theme === 'executive' ? 'active' : ''}`}
              onClick={() => setTheme('executive')}
            >
              Executive Ivy
            </button>
            <button
              className={`theme-pill-btn ${theme === 'minimal' ? 'active' : ''}`}
              onClick={() => setTheme('minimal')}
            >
              Minimal
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <span className="theme-label">Preview Zoom:</span>
          <div className="zoom-toggle-group">
            <button className="btn-icon" onClick={() => setZoomLevel(Math.max(75, zoomLevel - 10))}>-</button>
            <span className="zoom-label">{zoomLevel}%</span>
            <button className="btn-icon" onClick={() => setZoomLevel(Math.min(125, zoomLevel + 10))}>+</button>
          </div>
        </div>
      </div>

      <div className="split-grid">
        {/* Editor Form */}
        <div className="card editor-card no-print">
          <div className="flex-between">
            <h3>Resume Content Editor</h3>
            {data.avatar && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src={data.avatar} alt="Avatar Preview" className="resume-avatar-preview" />
                <button
                  type="button"
                  className="btn-text-danger"
                  onClick={() => setData((prev) => ({ ...prev, avatar: null }))}
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          <div className="grid-2-compact" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Full Name *</label>
              <input ref={nameInputRef} name="name" className="form-input" value={data.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Professional Role *</label>
              <input name="role" className="form-input" value={data.role} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid-3" style={{ marginTop: '0.2rem' }}>
            <div className="form-group">
              <label>Email *</label>
              <input name="email" className="form-input" value={data.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" className="form-input" value={data.phone || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location *</label>
              <input name="location" className="form-input" value={data.location} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Portfolio / Website URL</label>
            <input name="website" className="form-input" value={data.website || ''} onChange={handleChange} />
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label>Professional Summary *</label>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>{data.summary.length} characters</span>
            </div>
            <textarea name="summary" rows="3" className="form-input" value={data.summary} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Technical Skills (Comma-separated) *</label>
            <textarea name="skills" rows="2" className="form-input" value={data.skills} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Professional Experience &amp; Impact (Bullet points with metrics) *</label>
            <textarea name="experience" rows="6" className="form-input" value={data.experience} onChange={handleChange} />
          </div>

          {/* Featured Projects Form */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div className="flex-between">
              <h4>Featured Architecture &amp; Software Projects</h4>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleAddProject}>
                ➕ Add Project
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
              {(data.projects || []).map((p, idx) => (
                <div key={idx} className="card project-edit-box">
                  <div className="flex-between">
                    <span className="project-box-label">Project #{idx + 1}</span>
                    <button
                      type="button"
                      className="btn-text-danger"
                      onClick={() => handleRemoveProject(idx)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid-2-compact" style={{ marginTop: '0.4rem' }}>
                    <input
                      className="form-input form-input-sm"
                      placeholder="Project Title"
                      value={p.title}
                      onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
                    />
                    <input
                      className="form-input form-input-sm"
                      placeholder="Tech Stack (e.g. Go, REST API)"
                      value={p.tech}
                      onChange={(e) => handleProjectChange(idx, 'tech', e.target.value)}
                    />
                  </div>
                  <textarea
                    rows="2"
                    className="form-input form-input-sm"
                    style={{ marginTop: '0.4rem' }}
                    placeholder="Description and architectural accomplishments..."
                    value={p.desc}
                    onChange={(e) => handleProjectChange(idx, 'desc', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <label>Education &amp; Credentials</label>
            <input name="education" className="form-input" value={data.education || ''} onChange={handleChange} />
          </div>
        </div>

        {/* Live Print-Ready Preview Sheet */}
        <div className="resume-sheet-wrapper">
          <div
            className={`resume-sheet resume-theme-${theme}`}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* Resume Header */}
            <header className="resume-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {data.avatar && (
                  <img src={data.avatar} alt={data.name} className="resume-avatar-img" />
                )}
                <div style={{ flex: 1 }}>
                  <h1>{data.name || 'Your Name'}</h1>
                  <p className="resume-role">{data.role || 'Your Professional Role'}</p>
                  <div className="resume-contact">
                    <span>✉️ {data.email}</span>
                    {data.phone && <span>📞 {data.phone}</span>}
                    <span>📍 {data.location}</span>
                    {data.website && <span>🌐 {data.website.replace('https://', '')}</span>}
                  </div>
                </div>
              </div>
            </header>

            {/* Profile Summary */}
            <section className="resume-section">
              <h4>Profile Summary</h4>
              <p>{data.summary}</p>
            </section>

            {/* Key Skills */}
            <section className="resume-section">
              <h4>Core Technical Skills</h4>
              <div className="skills-tags">
                {(data.skills || '').split(',').map((skill, i) => skill.trim() && (
                  <span
                    key={i}
                    className={`skill-pill ${skill.toLowerCase().includes('api') || skill.toLowerCase().includes('react') ? 'skill-pill-highlight' : ''}`}
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </section>

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <section className="resume-section">
                <h4>Key Technical Projects</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {data.projects.map((proj, idx) => (
                    <div key={idx} className="resume-project-item">
                      <div className="flex-between">
                        <strong className="resume-proj-title">{proj.title}</strong>
                        <span className="resume-proj-tech">{proj.tech}</span>
                      </div>
                      <p className="resume-proj-desc">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Professional Experience */}
            <section className="resume-section">
              <h4>Professional Experience</h4>
              <div className="resume-exp-list">
                {(data.experience || '').split('\n').map((line, idx) => line.trim() && (
                  <p key={idx} className={`resume-exp-line ${line.startsWith('•') ? 'exp-bullet' : 'exp-title'}`}>
                    {line}
                  </p>
                ))}
              </div>
            </section>

            {/* Education */}
            {data.education && (
              <section className="resume-section">
                <h4>Education &amp; Credentials</h4>
                <p>{data.education}</p>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
