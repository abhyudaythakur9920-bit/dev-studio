import { useState } from 'react';

const INITIAL_FIELDS = [
  { id: '1', label: 'Full Name', type: 'text' },
  { id: '2', label: 'Email Address', type: 'email' },
  { id: '3', label: 'Project Scope & Feedback', type: 'textarea' }
];

export default function FormBuilder() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');
  const [responses, setResponses] = useState([
    { id: 101, time: '10:42 AM', data: { 'Full Name': 'Sarah Connor', 'Email Address': 'sarah@skynet.ai', 'Project Scope & Feedback': 'Looking to collaborate on a React frontend audit.' } }
  ]);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const addField = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    setFields([...fields, { id: Date.now().toString(), label: newLabel.trim(), type: newType }]);
    setNewLabel('');
  };

  const removeField = (id) => setFields(fields.filter(f => f.id !== id));

  const handleResponseSubmit = (e) => {
    e.preventDefault();
    const newSubmission = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: { ...formData }
    };
    setResponses([newSubmission, ...responses]);
    setFormData({});
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h2>📋 Custom Form Builder &amp; Collector</h2>
          <p>Design dynamic intake forms, test live submissions, and view captured responses in real time.</p>
        </div>
      </div>

      <div className="split-grid">
        {/* Left: Form Schema Designer & Live Preview */}
        <div className="form-column">
          <div className="card">
            <h3>1. Add Custom Field</h3>
            <form onSubmit={addField} className="grid-2-compact" style={{ marginTop: '1rem' }}>
              <input
                className="form-input"
                placeholder="Field Label (e.g. Phone Number)"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
              />
              <select className="form-input" value={newType} onChange={e => setNewType(e.target.value)}>
                <option value="text">Text Input</option>
                <option value="email">Email Input</option>
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
              </select>
              <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>
                ➕ Add Field
              </button>
            </form>
          </div>

          <div className="card" style={{ marginTop: '1.5rem' }}>
            <div className="flex-between">
              <h3>2. Live Form Preview</h3>
              <span className="badge-small">{fields.length} Active Fields</span>
            </div>
            
            {submitted && <div className="alert-success">✅ Response successfully recorded!</div>}

            <form onSubmit={handleResponseSubmit} className="contact-form">
              {fields.map(f => (
                <div key={f.id} className="form-group">
                  <div className="flex-between">
                    <label>{f.label}</label>
                    <button type="button" className="btn-text-danger" onClick={() => removeField(f.id)}>Remove</button>
                  </div>
                  {f.type === 'textarea' ? (
                    <textarea
                      rows="2"
                      className="form-input"
                      value={formData[f.label] || ''}
                      onChange={e => setFormData({ ...formData, [f.label]: e.target.value })}
                      required
                    />
                  ) : (
                    <input
                      type={f.type}
                      className="form-input"
                      value={formData[f.label] || ''}
                      onChange={e => setFormData({ ...formData, [f.label]: e.target.value })}
                      required
                    />
                  )}
                </div>
              ))}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Submit Test Response 🚀
              </button>
            </form>
          </div>
        </div>

        {/* Right: Collected Responses Viewer */}
        <div className="card responses-card">
          <div className="flex-between">
            <h3>3. Collected Responses ({responses.length})</h3>
            {responses.length > 0 && (
              <button className="btn btn-sm btn-outline" onClick={() => setResponses([])}>
                Clear All
              </button>
            )}
          </div>

          {responses.length === 0 ? (
            <p className="card-description" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              No responses collected yet. Submit a test form on the left!
            </p>
          ) : (
            <div className="responses-list">
              {responses.map((resp, i) => (
                <div key={resp.id} className="response-entry">
                  <div className="flex-between response-meta">
                    <span className="badge-small">Submission #{responses.length - i}</span>
                    <span className="text-muted">{resp.time}</span>
                  </div>
                  {Object.entries(resp.data).map(([key, val]) => (
                    <div key={key} className="response-field">
                      <strong className="response-key">{key}:</strong> <span>{val || '—'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
