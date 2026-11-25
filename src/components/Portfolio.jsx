import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'CloudGate Distributed API Gateway',
    category: 'API & Cloud',
    status: 'Live Production',
    desc: 'High-throughput API reverse proxy with token-bucket rate limiting, JWT validation, Prometheus metrics, and automated CORS handling.',
    tech: ['Go', 'REST API', 'Docker', 'Redis', 'PostgreSQL'],
    github: 'https://github.com/developer/cloudgate-api',
    demo: 'https://pkg.go.dev',
    stars: 342
  },
  {
    id: 'proj-2',
    title: 'DevMetrics Observability Cloud',
    category: 'Web Apps',
    status: 'Live Production',
    desc: 'Full-stack developer monitoring dashboard with real-time throughput metrics, server vitals, and microservice error tracing.',
    tech: ['React', 'Node.js', 'ChartJS', 'REST APIs', 'TailwindCSS'],
    github: 'https://github.com/developer/dev-metrics',
    demo: 'https://react.dev',
    stars: 285
  },
  {
    id: 'proj-3',
    title: 'NeuralScribe AI Reviewer',
    category: 'AI & Machine Learning',
    status: 'Open Source',
    desc: 'Context-aware documentation engine that audits GitHub pull requests, generates unit tests, and validates OpenAPI 3.0 schemas.',
    tech: ['Python', 'FastAPI', 'OpenAI REST', 'PyTest', 'LangChain'],
    github: 'https://github.com/fastapi/fastapi',
    demo: 'https://fastapi.tiangolo.com',
    stars: 498
  },
  {
    id: 'proj-4',
    title: 'SpeedyCLI Workflow Tools',
    category: 'Dev Tools',
    status: 'Open Source',
    desc: 'Cross-platform CLI utility for automated git branching workflows, semantic versioning, and zero-downtime docker deploys.',
    tech: ['Go', 'Docker', 'Bash', 'GitHub Actions API'],
    github: 'https://github.com/cli/cli',
    demo: 'https://cli.github.com',
    stars: 176
  },
  {
    id: 'proj-5',
    title: 'HyperCart State Engine',
    category: 'Web Apps',
    status: 'Open Source',
    desc: 'Zero-dependency reactive state management demonstration with voucher calculation, checkout validation, and persistent storage.',
    tech: ['React 19', 'TypeScript', 'CSS Grid', 'LocalStorage'],
    github: 'https://github.com/developer/hypercart-state',
    demo: 'https://react.dev',
    stars: 120
  }
];

export default function Portfolio() {
  const { id: routeProjectId } = useParams(); // React Router Dynamic Route Param
  const navigate = useNavigate();

  // Persistent Project list using Custom Hook
  const [projects, setProjects] = useLocalStorage('devstudio_portfolio_projects', INITIAL_PROJECTS);

  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(''); // Debounced search query
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // Pagination limit per page

  // DOM Reference via useRef (Focus control)
  const searchInputRef = useRef(null);
  const titleInputRef = useRef(null);

  // GitHub REST API Integration State
  const [githubUser, setGithubUser] = useState('torvalds');
  const [githubProfile, setGithubProfile] = useState(null);
  const [fetchingGithub, setFetchingGithub] = useState(false);
  const [githubError, setGithubError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    title: '',
    category: 'API & Cloud',
    status: 'Live Production',
    desc: '',
    tech: '',
    github: '',
    demo: ''
  });

  // 1. DEBOUNCE PATTERN: Wait 300ms before filtering to optimize performance
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. FOCUS MANAGEMENT with useRef
  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
  };

  // 3. MEMOIZED FILTER CALLBACK with useCallback
  const handleCategorySelect = useCallback((cat) => {
    setFilter(cat);
    setCurrentPage(1);
  }, []);

  // 4. REST API: Live GitHub Profile and Repositories Fetch
  const handleFetchGithubApi = async (e) => {
    if (e) e.preventDefault();
    const raw = (githubUser || '').trim();
    const cleanUser = raw
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^@/, '')
      .split('/')[0]
      .split('?')[0]
      .trim();
    if (!cleanUser) return;

    setFetchingGithub(true);
    setGithubError(null);
    setNotification(null);

    try {
      const userRes = await fetch(`https://api.github.com/users/${cleanUser}`);
      if (!userRes.ok) {
        throw new Error(`GitHub API: ${userRes.status} ${userRes.statusText}`);
      }
      const userData = await userRes.json();
      setGithubProfile(userData);

      const reposRes = await fetch(`https://api.github.com/users/${cleanUser}/repos?sort=updated&per_page=6`);
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        setGithubProfile((prev) => ({ ...prev, repos: reposData }));
      }
      setNotification(`Connected to GitHub API for @${cleanUser}!`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setGithubError(err.message || 'Failed to fetch GitHub profile.');
    } finally {
      setFetchingGithub(false);
    }
  };

  // Import Public Repos from GitHub REST API into Portfolio
  const handleImportReposFromApi = () => {
    if (!githubProfile || !githubProfile.repos || githubProfile.repos.length === 0) return;

    const imported = githubProfile.repos.map((repo) => {
      const language = repo.language || 'Software';
      const isApi = repo.name.toLowerCase().includes('api') || (repo.description && repo.description.toLowerCase().includes('api'));
      return {
        id: `gh-${repo.id}`,
        title: repo.name,
        category: isApi ? 'API & Cloud' : (language === 'Python' ? 'AI & Machine Learning' : 'Web Apps'),
        status: 'Open Source',
        desc: repo.description || `Public repository maintained by ${repo.owner.login}.`,
        tech: [language, 'Git', 'GitHub API', 'Open Source'],
        github: repo.html_url,
        demo: repo.homepage || repo.html_url,
        stars: repo.stargazers_count || 1
      };
    });

    const existingIds = new Set(projects.map((p) => p.id));
    const newItems = imported.filter((item) => !existingIds.has(item.id));

    setProjects([...newItems, ...projects]);
    setNotification(`Successfully imported ${newItems.length} public repositories from GitHub API!`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Project
  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.desc.trim()) return;
    const newProject = {
      id: `proj-${Date.now()}`,
      title: form.title,
      category: form.category,
      status: form.status,
      desc: form.desc,
      tech: form.tech ? form.tech.split(',').map((t) => t.trim()) : ['React', 'JavaScript'],
      github: form.github.trim() || `https://github.com/${githubUser}`,
      demo: form.demo.trim() || '#',
      stars: Math.floor(Math.random() * 50) + 1
    };
    setProjects([newProject, ...projects]);
    setForm({ title: '', category: 'API & Cloud', status: 'Live Production', desc: '', tech: '', github: '', demo: '' });
    setShowAdd(false);
    setNotification('Project added to showcase successfully!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = (id) => {
    setProjects(projects.filter((p) => p.id !== id));
    if (routeProjectId === id) {
      navigate('/portfolio');
    }
  };

  const categories = ['All', 'API & Cloud', 'Web Apps', 'AI & Machine Learning', 'Dev Tools'];

  // 5. USEMEMO: Filter and Search calculations
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory = filter === 'All' || p.category === filter;
      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.tech.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [projects, filter, debouncedSearch]);

  // 6. PAGINATION LOGIC (Lectures 67-72)
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  // Find active project if route has dynamic param /portfolio/:id
  const activeRouteProject = useMemo(() => {
    if (!routeProjectId) return null;
    return projects.find((p) => p.id === routeProjectId);
  }, [projects, routeProjectId]);

  return (
    <div className="module-container">
      {/* Portfolio Header & Actions */}
      <div className="module-header">
        <div>
          <h2>💼 Interactive Portfolio &amp; Engineering Showcase</h2>
          <p>Curate software projects, sync live statistics via GitHub REST API, and inspect dynamic route parameters.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleFocusSearch}
            title="Focus Search via useRef"
          >
            🔍 Focus Search
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setShowAdd(!showAdd);
              if (!showAdd) setTimeout(() => titleInputRef.current?.focus(), 50);
            }}
          >
            {showAdd ? '✕ Close Form' : '➕ Register Project'}
          </button>
        </div>
      </div>

      {/* DYNAMIC ROUTE INSPECTOR: If /portfolio/:id is visited */}
      {activeRouteProject && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--accent-cyan)', background: 'rgba(56, 189, 248, 0.05)' }}>
          <div className="flex-between">
            <span className="badge" style={{ background: 'var(--accent-gradient)', color: '#000' }}>
              Dynamic Route: /portfolio/{routeProjectId}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => navigate('/portfolio')}
            >
              ✕ Close Inspector
            </button>
          </div>

          <h3 style={{ marginTop: '0.75rem' }}>{activeRouteProject.title}</h3>
          <p className="card-description" style={{ marginTop: '0.25rem' }}>
            {activeRouteProject.desc}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            {activeRouteProject.tech.map((t, idx) => (
              <span key={idx} className="tech-pill">{t}</span>
            ))}
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setNotification(`Copied project route link to clipboard!`);
                setTimeout(() => setNotification(null), 3000);
              }}
            >
              🔗 Share Route Link
            </button>
            {activeRouteProject.github && (
              <a
                href={activeRouteProject.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline"
              >
                🐙 View Repository ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* GitHub Live REST API Integration Bar */}
      <div className="card github-profile-bar">
        <div className="github-profile-left">
          {githubProfile && githubProfile.avatar_url ? (
            <img
              src={githubProfile.avatar_url}
              alt={githubProfile.login}
              className="github-avatar-img"
              style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid var(--accent-cyan)' }}
            />
          ) : (
            <div className="github-avatar-placeholder">
              <span>🐙</span>
            </div>
          )}

          <div>
            <div className="flex-between" style={{ gap: '0.5rem' }}>
              <strong>GitHub REST API Sync</strong>
              <span className="badge-small">v3 API Live</span>
            </div>
            <p className="card-description" style={{ margin: 0, fontSize: '0.85rem' }}>
              {githubProfile ? (
                <span>
                  Connected: <strong className="gradient-text">{githubProfile.name || githubProfile.login}</strong> (@{githubProfile.login}) • {githubProfile.public_repos} repos • {githubProfile.followers} followers
                </span>
              ) : (
                <span>Sync developer profile and repositories live via GitHub API: <span className="gradient-text">api.github.com/users/{githubUser}</span></span>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleFetchGithubApi} className="github-profile-right">
          <input
            className="form-input github-user-input"
            placeholder="GitHub handle"
            value={githubUser}
            onChange={(e) => setGithubUser(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm" disabled={fetchingGithub}>
            {fetchingGithub ? '📡 Querying API...' : '⚡ Fetch API Data'}
          </button>
          {githubProfile && githubProfile.repos && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleImportReposFromApi}
            >
              📥 Import {githubProfile.repos.length} Repos
            </button>
          )}
        </form>
      </div>

      {/* Notifications */}
      {notification && <div className="alert-success">✅ {notification}</div>}
      {githubError && (
        <div className="alert-danger" style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
          ⚠️ {githubError}
        </div>
      )}

      {/* Add Project Form Drawer */}
      {showAdd && (
        <form onSubmit={handleAdd} className="card add-project-form">
          <div className="flex-between">
            <h3>Register Project into Showcase</h3>
            <span className="badge-small">Instant Deployment</span>
          </div>

          <div className="grid-3" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Project Title *</label>
              <input
                ref={titleInputRef}
                className="form-input"
                placeholder="e.g. Distributed Telemetry Router"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="API & Cloud">API & Cloud</option>
                <option value="Web Apps">Web Apps</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Dev Tools">Dev Tools</option>
              </select>
            </div>
            <div className="form-group">
              <label>Deployment Status</label>
              <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Live Production">Live Production</option>
                <option value="Open Source">Open Source</option>
                <option value="Beta Preview">Beta Preview</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows="2"
              className="form-input"
              placeholder="Highlight architectural design, throughput, endpoints, or tech stack..."
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Technologies (Comma-separated)</label>
            <input
              className="form-input"
              placeholder="e.g. React, Node.js, Express, Redis, Docker"
              value={form.tech}
              onChange={(e) => setForm({ ...form, tech: e.target.value })}
            />
          </div>

          <div className="grid-2-compact">
            <div className="form-group">
              <label>🐙 GitHub Repository URL</label>
              <input
                type="url"
                className="form-input"
                placeholder={`https://github.com/${githubUser}/project-repo`}
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>🚀 Live Demo or Documentation URL</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://myproject.vercel.app"
                value={form.demo}
                onChange={(e) => setForm({ ...form, demo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex-between" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">
              💾 Save to Showcase
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter & Debounced Search Toolbar */}
      <div className="portfolio-filter-toolbar">
        <div className="filter-bar">
          {categories.map((cat) => {
            const count = cat === 'All' ? projects.length : projects.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat)}
              >
                <span>{cat}</span>
                <span className="filter-count-badge">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="portfolio-search-box">
          <input
            ref={searchInputRef}
            className="form-input search-input"
            placeholder="🔍 Debounced search (title, tech, desc)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {paginatedProjects.map((proj) => (
          <div key={proj.id} className="card project-pro-card">
            <div className="project-card-body">
              <div className="project-top">
                <span className="badge badge-category">{proj.category}</span>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span className={`status-pill ${proj.status === 'Live Production' ? 'status-pill-active' : 'status-pill-neutral'}`}>
                    {proj.status || 'Active'}
                  </span>
                  <span className="star-badge">⭐ {proj.stars}</span>
                </div>
              </div>

              <h3 className="project-title" style={{ marginTop: '0.5rem' }}>{proj.title}</h3>
              <p className="card-description" style={{ fontSize: '0.88rem' }}>{proj.desc}</p>

              <div className="tech-pills" style={{ marginTop: '0.6rem' }}>
                {proj.tech.map((t, idx) => (
                  <span key={idx} className="tech-pill">{t}</span>
                ))}
              </div>
            </div>

            {/* Links and Actions */}
            <div className="project-footer" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className="project-links" style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={() => navigate(`/portfolio/${proj.id}`)}
                  title="Inspect dynamic route"
                >
                  🔍 Inspect
                </button>

                {proj.demo && proj.demo !== '#' && (
                  <a
                    href={proj.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline"
                  >
                    Demo ↗
                  </a>
                )}
              </div>

              <button
                type="button"
                className="btn-text-danger"
                title="Delete project"
                onClick={() => handleDelete(proj.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-response-state card">
          <span className="empty-icon">📂</span>
          <p>No projects found matching the current search query or category filter.</p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setFilter('All');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* PAGINATION CONTROLS (Lectures 67-72) */}
      {filteredProjects.length > pageSize && (
        <div className="card" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem' }}>
          <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredProjects.length} total projects)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ← Previous
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
