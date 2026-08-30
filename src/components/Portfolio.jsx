import { useState } from 'react';

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: 'DevMetrics Cloud',
    category: 'Web',
    desc: 'Real-time observability dashboard with live throughput metrics and microservice telemetry.',
    tech: ['React', 'Node.js', 'Tailwind', 'ChartJS'],
    github: 'https://github.com/facebook/react',
    demo: 'https://react.dev',
    stars: 142
  },
  {
    id: 2,
    title: 'NeuralScribe AI',
    category: 'AI',
    desc: 'Context-aware documentation engine that auto-generates unit tests and type definitions.',
    tech: ['Python', 'OpenAI', 'FastAPI', 'PyTest'],
    github: 'https://github.com/fastapi/fastapi',
    demo: 'https://fastapi.tiangolo.com',
    stars: 389
  },
  {
    id: 3,
    title: 'SpeedyCLI Tools',
    category: 'Tools',
    desc: 'Cross-platform CLI utility for automated git workflows, release tagging, and docker deploys.',
    tech: ['Go', 'Docker', 'Bash', 'GitHub Actions'],
    github: 'https://github.com/cli/cli',
    demo: 'https://cli.github.com',
    stars: 95
  }
];

export default function Portfolio() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [filter, setFilter] = useState('All');
  const [githubUser, setGithubUser] = useState('developer');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Web',
    desc: '',
    tech: '',
    github: '',
    demo: ''
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.desc.trim()) return;
    const newProject = {
      id: Date.now(),
      title: form.title,
      category: form.category,
      desc: form.desc,
      tech: form.tech ? form.tech.split(',').map(t => t.trim()) : ['React', 'JavaScript'],
      github: form.github.trim() || `https://github.com/${githubUser}`,
      demo: form.demo.trim() || '#',
      stars: Math.floor(Math.random() * 50) + 1
    };
    setProjects([newProject, ...projects]);
    setForm({ title: '', category: 'Web', desc: '', tech: '', github: '', demo: '' });
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="module-container">
      {/* Portfolio Header & GitHub Profile Connector */}
      <div className="module-header">
        <div>
          <h2>💼 Interactive Portfolio &amp; Repositories</h2>
          <p>Showcase full-stack applications with direct GitHub source links, live demos, and category filters.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ Close Form' : '➕ Add Project'}
        </button>
      </div>

      {/* GitHub Profile Banner */}
      <div className="card github-profile-bar">
        <div className="github-profile-left">
          <span className="github-icon-large">🐙</span>
          <div>
            <strong>GitHub Developer Sync</strong>
            <p className="card-description" style={{ margin: 0 }}>
              Connected profile: <span className="gradient-text font-bold">github.com/{githubUser}</span>
            </p>
          </div>
        </div>
        <div className="github-profile-right">
          <input
            className="form-input github-user-input"
            placeholder="GitHub handle (e.g. torvalds)"
            value={githubUser}
            onChange={(e) => setGithubUser(e.target.value)}
          />
          <a
            href={`https://github.com/${githubUser}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            Visit GitHub Profile ↗
          </a>
        </div>
      </div>

      {/* Inline Add Project Form with GitHub & Demo URLs */}
      {showAdd && (
        <form onSubmit={handleAdd} className="card add-project-form">
          <div className="flex-between">
            <h3>Add New Project to Showcase</h3>
            <span className="badge-small">Instant Deployment</span>
          </div>

          <div className="grid-2-compact" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Project Title *</label>
              <input
                className="form-input"
                placeholder="e.g. AI Code Reviewer"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="Web">Web</option>
                <option value="AI">AI</option>
                <option value="Tools">Tools</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows="2"
              className="form-input"
              placeholder="Brief description of the problem solved and core capabilities..."
              value={form.desc}
              onChange={e => setForm({ ...form, desc: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Technologies (Comma-separated)</label>
            <input
              className="form-input"
              placeholder="e.g. React, TypeScript, GraphQL, Docker"
              value={form.tech}
              onChange={e => setForm({ ...form, tech: e.target.value })}
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
                onChange={e => setForm({ ...form, github: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>🚀 Live Demo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://myproject.vercel.app"
                value={form.demo}
                onChange={e => setForm({ ...form, demo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex-between" style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary">
              💾 Save to Portfolio
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="filter-bar">
        {['All', 'Web', 'AI', 'Tools'].map(cat => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat} ({cat === 'All' ? projects.length : projects.filter(p => p.category === cat).length})
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      <div className="grid-3">
        {filtered.map(proj => (
          <div key={proj.id} className="card project-card">
            <div>
              <div className="project-top">
                <span className="badge">{proj.category}</span>
                <span className="star-badge">⭐ {proj.stars}</span>
              </div>
              <h3 className="project-title">{proj.title}</h3>
              <p className="card-description">{proj.desc}</p>
              <div className="tech-pills">
                {proj.tech.map((t, idx) => (
                  <span key={idx} className="tech-pill">{t}</span>
                ))}
              </div>
            </div>

            {/* Links and Actions */}
            <div className="project-footer">
              <div className="project-links">
                {proj.github && (
                  <a
                    href={proj.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline github-link-btn"
                  >
                    🐙 GitHub Repo ↗
                  </a>
                )}
                {proj.demo && proj.demo !== '#' && (
                  <a
                    href={proj.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary demo-link-btn"
                  >
                    🚀 Live Demo
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
    </div>
  );
}
