import { useState } from 'react';

export default function ResumeBuilder() {
  const [data, setData] = useState({
    name: 'Alex Rivera',
    role: 'Full Stack Developer',
    email: 'alex.rivera@dev.io',
    location: 'San Francisco, CA',
    summary: 'Passionate developer specializing in building scalable web apps with React and Node.js.',
    skills: 'React, JavaScript, TypeScript, Node.js, CSS3, Git, REST APIs',
    experience: 'Frontend Engineer at WebLabs (2023 - Present): Built interactive client portals and reduced render latencies by 35%.\nJunior Developer at CodeCraft (2022 - 2023): Developed responsive UI components and integrated APIs.'
  });

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>📄 Resume Builder</h2>
          <p>Draft your professional resume with a live print-ready preview.</p>
        </div>
        <button className="btn btn-primary no-print" onClick={() => window.print()}>
          🖨️ Print / Save PDF
        </button>
      </div>

      <div className="split-grid">
        {/* Editor Form */}
        <div className="card editor-card no-print">
          <h3>Edit Details</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" className="form-input" value={data.name} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Professional Role</label>
            <input name="role" className="form-input" value={data.role} onChange={handleChange} />
          </div>
          <div className="grid-2-compact">
            <div className="form-group">
              <label>Email</label>
              <input name="email" className="form-input" value={data.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input name="location" className="form-input" value={data.location} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Professional Summary</label>
            <textarea name="summary" rows="3" className="form-input" value={data.summary} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Skills (Comma-separated)</label>
            <input name="skills" className="form-input" value={data.skills} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Experience & History</label>
            <textarea name="experience" rows="4" className="form-input" value={data.experience} onChange={handleChange} />
          </div>
        </div>

        {/* Live Print-Ready Preview */}
        <div className="resume-sheet-wrapper">
          <div className="resume-sheet">
            <header className="resume-header">
              <h1>{data.name || 'Your Name'}</h1>
              <p className="resume-role">{data.role || 'Your Professional Role'}</p>
              <div className="resume-contact">
                <span>✉️ {data.email}</span>
                <span>📍 {data.location}</span>
              </div>
            </header>

            <section className="resume-section">
              <h4>Profile Summary</h4>
              <p>{data.summary}</p>
            </section>

            <section className="resume-section">
              <h4>Key Skills</h4>
              <div className="skills-tags">
                {data.skills.split(',').map((skill, i) => skill.trim() && (
                  <span key={i} className="skill-pill">{skill.trim()}</span>
                ))}
              </div>
            </section>

            <section className="resume-section">
              <h4>Experience</h4>
              <div className="resume-exp-list">
                {data.experience.split('\n').map((line, idx) => line.trim() && (
                  <p key={idx} className="resume-exp-line">{line}</p>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
