import { useState, useRef } from 'react';
import { useLocalStorage } from './StateCart';

const FORM_TEMPLATES = {
  blank: {
    name: 'Blank Custom Form',
    fields: [
      { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'e.g. John Doe', required: true },
      { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'john@example.com', required: true }
    ]
  },
  contact: {
    name: 'Client Intake & Project Inquiry',
    fields: [
      { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'e.g. Alice Walker', required: true },
      { id: 'f-2', label: 'Work Email', type: 'email', placeholder: 'alice@company.com', required: true },
      { id: 'f-3', label: 'Project Budget', type: 'select', options: '$1k - $5k, $5k - $15k, $15k - $50k, Enterprise ($50k+)', required: false },
      { id: 'f-4', label: 'Project Scope & Requirements', type: 'textarea', placeholder: 'Describe the deliverables, timeline and goals...', required: true },
      { id: 'f-5', label: 'Urgent Delivery Needed', type: 'checkbox', required: false }
    ]
  },
  hiring: {
    name: 'Developer Application',
    fields: [
      { id: 'f-1', label: 'Candidate Name', type: 'text', placeholder: 'e.g. Sam Miller', required: true },
      { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'sam@dev.org', required: true },
      { id: 'f-3', label: 'Target Engineering Role', type: 'select', options: 'Senior Frontend Engineer, Backend Go/Node Engineer, Full Stack Architect, DevOps & Cloud Specialist', required: true },
      { id: 'f-4', label: 'GitHub or Portfolio URL', type: 'text', placeholder: 'https://github.com/username', required: true },
      { id: 'f-5', label: 'Years of Professional Experience', type: 'number', placeholder: '5', required: true },
      { id: 'f-6', label: 'Earliest Start Date', type: 'date', required: false },
      { id: 'f-7', label: 'Self-Assessed Skill Level (1-5)', type: 'rating', required: true }
    ]
  },
  feedback: {
    name: 'Product Experience Feedback',
    fields: [
      { id: 'f-1', label: 'Your Name or Alias', type: 'text', placeholder: 'Anonymous or Name', required: false },
      { id: 'f-2', label: 'Overall Satisfaction (1-5 Stars)', type: 'rating', required: true },
      { id: 'f-3', label: 'What feature did you like most?', type: 'textarea', placeholder: 'Tell us what was smooth...', required: true },
      { id: 'f-4', label: 'Recommend to other developers?', type: 'checkbox', required: false }
    ]
  }
};

const INITIAL_RESPONSES = [
  {
    id: 'resp-1',
    timestamp: '10:42 AM Today',
    data: {
      'Full Name': 'Sarah Connor',
      'Work Email': 'sarah@skynet-research.ai',
      'Project Budget': '$15k - $50k',
      'Project Scope & Requirements': 'Looking for custom React component libraries with accessibility compliance and high-performance charts.',
      'Urgent Delivery Needed': 'Yes'
    }
  },
  {
    id: 'resp-2',
    timestamp: 'Yesterday 4:15 PM',
    data: {
      'Full Name': 'Marcus Vance',
      'Work Email': 'marcus@cloudscale.io',
      'Project Budget': '$5k - $15k',
      'Project Scope & Requirements': 'Need full redesign of developer documentation portal with responsive code sandboxes.',
      'Urgent Delivery Needed': 'No'
    }
  }
];

let fieldCounter = 100;
const getNextFieldId = () => `field-${++fieldCounter}`;

let responseCounter = 10;
const getNextResponseId = () => `resp-${++responseCounter}`;

export default function FormBuilder() {
  const [fields, setFields] = useState(FORM_TEMPLATES.contact.fields);
  const [activeTemplate, setActiveTemplate] = useState('contact');
  const [responses, setResponses] = useLocalStorage('devstudio_form_responses', INITIAL_RESPONSES);
  const newLabelInputRef = useRef(null);

  // New Field Creator State
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newRequired, setNewRequired] = useState(false);
  const [newOptions, setNewOptions] = useState('Option 1, Option 2, Option 3');

  // Live Test Form State
  const [formData, setFormData] = useState({});
  const [submittedFeedback, setSubmittedFeedback] = useState(false);
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'responses' | 'schema'
  const [copyCodeFeedback, setCopyCodeFeedback] = useState(false);

  // Apply Template
  const handleLoadTemplate = (key) => {
    setActiveTemplate(key);
    setFields(FORM_TEMPLATES[key].fields);
    setFormData({});
  };

  // Add Custom Field
  const handleAddField = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const newFieldObj = {
      id: getNextFieldId(),
      label: newLabel.trim(),
      type: newType,
      placeholder: newPlaceholder.trim(),
      required: newRequired,
      ...(newType === 'select' ? { options: newOptions } : {})
    };

    setFields([...fields, newFieldObj]);
    setNewLabel('');
    setNewPlaceholder('');
    setNewRequired(false);
    newLabelInputRef.current?.focus();
  };

  // Delete Field
  const handleRemoveField = (id) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  // Move Field Up / Down
  const handleMoveField = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= fields.length) return;
    const updated = [...fields];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setFields(updated);
  };

  // Duplicate Field
  const handleDuplicateField = (field) => {
    const uniqueId = getNextFieldId();
    const duplicated = {
      ...field,
      id: uniqueId,
      label: `${field.label} (Copy)`
    };
    setFields([...fields, duplicated]);
  };

  // Handle Live Test Submission
  const handleSubmitResponse = (e) => {
    e.preventDefault();
    const submissionId = getNextResponseId();
    const newSubmission = {
      id: submissionId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data: { ...formData }
    };

    setResponses([newSubmission, ...responses]);
    setFormData({});
    setSubmittedFeedback(true);
    setTimeout(() => setSubmittedFeedback(false), 3500);
  };

  // Export Responses as JSON
  const handleExportResponsesJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(responses, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'devstudio_form_responses.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Copy Schema JSON
  const handleCopySchema = () => {
    const schema = JSON.stringify(fields, null, 2);
    navigator.clipboard.writeText(schema);
    setCopyCodeFeedback(true);
    setTimeout(() => setCopyCodeFeedback(false), 2000);
  };

  return (
    <div className="module-container">
      {/* Module Header Bar */}
      <div className="module-header">
        <div>
          <h2>📋 Dynamic Form Studio &amp; Response Engine</h2>
          <p>Design schema-driven forms, customize inputs with real-time preview, and capture structured submissions.</p>
        </div>
        <div className="form-studio-nav">
          <button
            className={`btn btn-sm ${activeTab === 'builder' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('builder')}
          >
            🛠️ Visual Designer &amp; Preview
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'responses' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('responses')}
          >
            📬 Submissions Inbox ({responses.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'schema' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('schema')}
          >
            ⚙️ Schema JSON
          </button>
        </div>
      </div>

      {/* VIEW 1: BUILDER & LIVE PREVIEW */}
      {activeTab === 'builder' && (
        <>
          {/* Quick Preset Templates Bar */}
          <div className="card form-templates-card">
            <span className="templates-label">📑 Load Preset Form Template:</span>
            <div className="templates-btn-group">
              {Object.entries(FORM_TEMPLATES).map(([key, tpl]) => (
                <button
                  key={key}
                  className={`template-pill-btn ${activeTemplate === key ? 'active' : ''}`}
                  onClick={() => handleLoadTemplate(key)}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          <div className="split-grid form-builder-split">
            {/* Left Column: Field Manager & Adder */}
            <div className="form-designer-column">
              {/* Add New Field Card */}
              <div className="card">
                <h3>1. Add Custom Input Field</h3>
                <form onSubmit={handleAddField} className="add-field-form" style={{ marginTop: '1rem' }}>
                  <div className="grid-2-compact">
                    <div className="form-group">
                      <label>Field Label</label>
                      <input
                        ref={newLabelInputRef}
                        className="form-input"
                        placeholder="e.g. Phone Number, Budget"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Input Type</label>
                      <select
                        className="form-input"
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                      >
                        <option value="text">Single-line Text</option>
                        <option value="email">Email Address</option>
                        <option value="number">Numeric Input</option>
                        <option value="textarea">Multi-line Textarea</option>
                        <option value="select">Dropdown Select</option>
                        <option value="checkbox">Checkbox / Toggle</option>
                        <option value="date">Date Selector</option>
                        <option value="rating">Star Rating (1-5)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid-2-compact">
                    <div className="form-group">
                      <label>Placeholder (Optional)</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Enter here..."
                        value={newPlaceholder}
                        onChange={(e) => setNewPlaceholder(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ justifyContent: 'center' }}>
                      <label className="checkbox-label" style={{ marginTop: '1.25rem' }}>
                        <input
                          type="checkbox"
                          checked={newRequired}
                          onChange={(e) => setNewRequired(e.target.checked)}
                          style={{ marginRight: '0.5rem', accentColor: 'var(--accent-cyan)' }}
                        />
                        <span>Mandatory / Required Field</span>
                      </label>
                    </div>
                  </div>

                  {newType === 'select' && (
                    <div className="form-group">
                      <label>Options (Comma-separated)</label>
                      <input
                        className="form-input"
                        placeholder="Starter, Pro, Enterprise"
                        value={newOptions}
                        onChange={(e) => setNewOptions(e.target.value)}
                      />
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    ➕ Insert Field into Schema
                  </button>
                </form>
              </div>

              {/* Active Schema Fields List */}
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="flex-between">
                  <h3>Active Schema Fields ({fields.length})</h3>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => setFields([])}
                    disabled={fields.length === 0}
                  >
                    Clear All
                  </button>
                </div>

                <div className="fields-sortable-list" style={{ marginTop: '1rem' }}>
                  {fields.length === 0 ? (
                    <p className="text-secondary" style={{ textAlign: 'center', padding: '1rem' }}>
                      No fields in schema. Add one above or select a template!
                    </p>
                  ) : (
                    fields.map((f, idx) => (
                      <div key={f.id} className="field-schema-item">
                        <div className="field-schema-info">
                          <span className="field-type-pill">{f.type}</span>
                          <span className="field-label-text">
                            {f.label} {f.required && <span className="text-danger">*</span>}
                          </span>
                        </div>
                        <div className="field-schema-actions">
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleMoveField(idx, -1)}
                            disabled={idx === 0}
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleMoveField(idx, 1)}
                            disabled={idx === fields.length - 1}
                            title="Move Down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => handleDuplicateField(f)}
                            title="Duplicate"
                          >
                            ⧉
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger"
                            onClick={() => handleRemoveField(f.id)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Live Form Preview & Interactive Submission */}
            <div className="card live-preview-card">
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📱 2. Live Interactive Preview</span>
                  </h3>
                  <span className="badge-small" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                    Real-time reactive rendering
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => setFormData({})}
                >
                  Reset Inputs
                </button>
              </div>

              {submittedFeedback && (
                <div className="alert-success">
                  ✅ Response captured successfully! Recorded into submissions inbox.
                </div>
              )}

              {fields.length === 0 ? (
                <div className="empty-response-state">
                  <span className="empty-icon">📝</span>
                  <p>Add some input fields on the left to preview your dynamic form here.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitResponse} className="preview-form-body">
                  {fields.map((f) => (
                    <div key={f.id} className="form-group">
                      <label className="flex-between">
                        <span>
                          {f.label} {f.required && <span className="text-danger">*</span>}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>{f.type}</span>
                      </label>

                      {f.type === 'textarea' ? (
                        <textarea
                          rows="3"
                          className="form-input"
                          placeholder={f.placeholder || 'Enter text...'}
                          value={formData[f.label] || ''}
                          onChange={(e) => setFormData({ ...formData, [f.label]: e.target.value })}
                          required={f.required}
                        />
                      ) : f.type === 'select' ? (
                        <select
                          className="form-input"
                          value={formData[f.label] || ''}
                          onChange={(e) => setFormData({ ...formData, [f.label]: e.target.value })}
                          required={f.required}
                        >
                          <option value="">-- Choose an option --</option>
                          {(f.options || '').split(',').map((opt, i) => (
                            <option key={i} value={opt.trim()}>{opt.trim()}</option>
                          ))}
                        </select>
                      ) : f.type === 'checkbox' ? (
                        <label className="checkbox-toggle-container">
                          <input
                            type="checkbox"
                            checked={!!formData[f.label]}
                            onChange={(e) => setFormData({ ...formData, [f.label]: e.target.checked ? 'Yes' : 'No' })}
                          />
                          <span>Toggle confirm / Agree to condition</span>
                        </label>
                      ) : f.type === 'rating' ? (
                        <div className="star-rating-picker">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              className={`star-btn ${(formData[f.label] || 0) >= star ? 'star-active' : ''}`}
                              onClick={() => setFormData({ ...formData, [f.label]: star })}
                            >
                              ★
                            </button>
                          ))}
                          <span className="rating-num-label">
                            {formData[f.label] ? `${formData[f.label]} / 5 Stars` : 'Rate from 1 to 5'}
                          </span>
                        </div>
                      ) : (
                        <input
                          type={f.type}
                          className="form-input"
                          placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                          value={formData[f.label] || ''}
                          onChange={(e) => setFormData({ ...formData, [f.label]: e.target.value })}
                          required={f.required}
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1.25rem', padding: '0.8rem' }}
                  >
                    Submit Test Response 🚀
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: SUBMISSIONS INBOX */}
      {activeTab === 'responses' && (
        <div className="card form-responses-view">
          <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>Captured Form Submissions ({responses.length})</h3>
              <p className="card-description">View structured responses collected from the live form preview.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleExportResponsesJson}
                disabled={responses.length === 0}
              >
                📥 Export JSON
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setResponses([])}
                disabled={responses.length === 0}
              >
                Clear Submissions
              </button>
            </div>
          </div>

          {responses.length === 0 ? (
            <div className="empty-response-state">
              <span className="empty-icon">📭</span>
              <p>No submissions captured yet. Switch to the <strong>Visual Designer</strong> tab and test-submit the live form!</p>
            </div>
          ) : (
            <div className="responses-grid">
              {responses.map((resp, i) => (
                <div key={resp.id} className="card response-card-item">
                  <div className="flex-between response-card-header">
                    <span className="badge-small">Entry #{responses.length - i}</span>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>⏱️ {resp.timestamp}</span>
                  </div>

                  <div className="response-card-content">
                    {Object.entries(resp.data).map(([key, val]) => (
                      <div key={key} className="response-kv-row">
                        <span className="kv-key">{key}:</span>
                        <span className="kv-val">{val || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SCHEMA JSON */}
      {activeTab === 'schema' && (
        <div className="card form-schema-view">
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <div>
              <h3>Form Schema JSON Definition</h3>
              <p className="card-description">Portable schema configuration that drives the dynamic form.</p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleCopySchema}
            >
              {copyCodeFeedback ? '✅ Copied!' : '📋 Copy JSON Schema'}
            </button>
          </div>

          <pre className="code-block-viewer">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
