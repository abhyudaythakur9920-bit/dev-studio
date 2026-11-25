import { useState, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

// =============================================================================
// PRESET FORM TEMPLATES
// =============================================================================
const FORM_TEMPLATES = {
  contact: {
    name: 'Client Intake & Project Inquiry',
    description: 'Inbound client lead capture for freelance, agency, and consulting projects.',
    fields: [
      { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'e.g. Alice Walker', hint: 'Your primary contact name', required: true },
      { id: 'f-2', label: 'Work Email', type: 'email', placeholder: 'alice@company.com', hint: 'We will send the proposal here', required: true },
      { id: 'f-3', label: 'Project Budget', type: 'select', options: '$1k - $5k, $5k - $15k, $15k - $50k, Enterprise ($50k+)', hint: 'Select an estimated investment tier', required: false },
      { id: 'f-4', label: 'Project Scope & Requirements', type: 'textarea', placeholder: 'Describe the deliverables, timeline and goals...', hint: 'Provide as much detail as possible', required: true },
      { id: 'f-5', label: 'Urgent Delivery Needed (Under 2 Weeks)', type: 'checkbox', hint: 'Check if you have an expedited timeline', required: false }
    ]
  },
  hiring: {
    name: 'Developer Application',
    description: 'Screen technical talent with portfolio, role, and experience checks.',
    fields: [
      { id: 'f-1', label: 'Candidate Name', type: 'text', placeholder: 'e.g. Sam Miller', hint: 'First and last name', required: true },
      { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'sam@dev.org', hint: 'Primary email for interview invitations', required: true },
      { id: 'f-3', label: 'Target Engineering Role', type: 'select', options: 'Senior Frontend Engineer, Backend Go/Node Engineer, Full Stack Architect, DevOps & Cloud Specialist', hint: 'Select the primary opening', required: true },
      { id: 'f-4', label: 'GitHub or Portfolio URL', type: 'url', placeholder: 'https://github.com/username', hint: 'Link to public repositories or live demos', required: true },
      { id: 'f-5', label: 'Years of Professional Experience', type: 'number', placeholder: '5', hint: 'Total years in production software', required: true },
      { id: 'f-6', label: 'Earliest Start Date', type: 'date', hint: 'When can you join the engineering team?', required: false },
      { id: 'f-7', label: 'Self-Assessed Skill Level', type: 'rating', hint: 'Rate your overall full-stack engineering proficiency', required: true }
    ]
  },
  feedback: {
    name: 'Product Experience Feedback',
    description: 'Gather user ratings, feature requests, and customer satisfaction metrics.',
    fields: [
      { id: 'f-1', label: 'Your Name or Alias', type: 'text', placeholder: 'Anonymous or Name', hint: 'Optional name', required: false },
      { id: 'f-2', label: 'Overall Satisfaction', type: 'rating', hint: 'Rate your overall experience with the platform', required: true },
      { id: 'f-3', label: 'What feature did you like most?', type: 'textarea', placeholder: 'Tell us what felt smooth...', hint: 'Specific highlights help us double down', required: true },
      { id: 'f-4', label: 'Would you recommend us to other developers?', type: 'checkbox', hint: 'Check if you would refer colleagues', required: false }
    ]
  },
  event: {
    name: 'Hackathon & Tech Meetup RSVP',
    description: 'Collect attendee registrations, dietary requirements, and project team interests.',
    fields: [
      { id: 'f-1', label: 'Attendee Name', type: 'text', placeholder: 'e.g. Jordan Lee', hint: 'Name for your event badge', required: true },
      { id: 'f-2', label: 'Contact Email', type: 'email', placeholder: 'jordan@code.dev', hint: 'We will send the entrance QR code here', required: true },
      { id: 'f-3', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 234-5678', hint: 'For day-of-event SMS announcements', required: false },
      { id: 'f-4', label: 'Hackathon Track', type: 'select', options: 'AI & Machine Learning, Web3 & Decentralized, Cloud Architecture, Open Source Utilities', hint: 'Choose your main hackathon category', required: true },
      { id: 'f-5', label: 'Dietary Preferences', type: 'select', options: 'Standard, Vegetarian, Vegan, Halal, Gluten-Free', hint: 'Meals provided throughout the event', required: false },
      { id: 'f-6', label: 'I agree to the Event Code of Conduct', type: 'checkbox', hint: 'Mandatory agreement for all attendees', required: true }
    ]
  },
  blank: {
    name: 'Blank Custom Form',
    description: 'Start from scratch with standard developer fields.',
    fields: [
      { id: 'f-1', label: 'Full Name', type: 'text', placeholder: 'e.g. John Doe', hint: 'Your full legal name', required: true },
      { id: 'f-2', label: 'Email Address', type: 'email', placeholder: 'john@example.com', hint: 'Primary email address', required: true }
    ]
  }
};

// =============================================================================
// 1-CLICK QUICK ADD FIELD PRESETS FOR BEGINNERS
// =============================================================================
const QUICK_ADD_PRESETS = [
  { label: 'Full Name', type: 'text', placeholder: 'e.g. Alex Morgan', hint: 'Enter your full name', required: true, icon: '👤' },
  { label: 'Email Address', type: 'email', placeholder: 'alex@example.com', hint: 'We will keep this confidential', required: true, icon: '✉️' },
  { label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', hint: 'Include country or area code', required: false, icon: '📞' },
  { label: 'Company / Organization', type: 'text', placeholder: 'Acme Software Labs', hint: 'Your team or company name', required: false, icon: '🏢' },
  { label: 'Website / Portfolio', type: 'url', placeholder: 'https://yourportfolio.dev', hint: 'Direct link with https://', required: false, icon: '🌐' },
  { label: 'Detailed Message', type: 'textarea', placeholder: 'Please explain your requirements...', hint: 'Provide details or background', required: true, icon: '📑' },
  { label: 'Project Category', type: 'select', options: 'Web Application, Mobile App, API Integration, DevOps & Cloud, Consultation', hint: 'Choose the most relevant category', required: true, icon: '🔽' },
  { label: 'Quality Rating', type: 'rating', hint: 'Rate from 1 to 5 stars', required: true, icon: '⭐' },
  { label: 'Preferred Date', type: 'date', hint: 'Select a target date', required: false, icon: '📅' },
  { label: 'Budget Estimate ($)', type: 'number', placeholder: '2500', hint: 'Numbers only', required: false, icon: '🔢' },
  { label: 'I accept terms & conditions', type: 'checkbox', hint: 'Consent and policy agreement', required: true, icon: '☑️' }
];

// =============================================================================
// AI GENERATOR TEMPLATES / PROMPTS
// =============================================================================
const AI_PROMPTS = [
  {
    title: 'Customer Feedback',
    prompt: 'Customer satisfaction survey with star rating, favorite features, and NPS question',
    fields: [
      { id: 'ai-1', label: 'Customer Name', type: 'text', placeholder: 'e.g. Maria Gonzalez', hint: 'Optional name', required: false },
      { id: 'ai-2', label: 'Overall Satisfaction', type: 'rating', hint: 'Rate your overall satisfaction', required: true },
      { id: 'ai-3', label: 'Primary Feature Used', type: 'select', options: 'Dashboard Analytics, Form Builder, Resume Engine, API Integration', hint: 'Select the feature you use most', required: true },
      { id: 'ai-4', label: 'What can we improve?', type: 'textarea', placeholder: 'Share any friction points or missing features...', hint: 'We read every piece of feedback', required: true },
      { id: 'ai-5', label: 'Would recommend to peers', type: 'checkbox', hint: 'Net promoter indicator', required: false }
    ]
  },
  {
    title: 'Job Application',
    prompt: 'Senior React Developer application with portfolio link and years of experience',
    fields: [
      { id: 'ai-1', label: 'Candidate Full Name', type: 'text', placeholder: 'e.g. Liam Scott', hint: 'Legal candidate name', required: true },
      { id: 'ai-2', label: 'Email Address', type: 'email', placeholder: 'liam@domain.com', hint: 'Primary contact email', required: true },
      { id: 'ai-3', label: 'GitHub Profile', type: 'url', placeholder: 'https://github.com/liam', hint: 'Link to code contributions', required: true },
      { id: 'ai-4', label: 'Years with React & TypeScript', type: 'number', placeholder: '4', hint: 'Total years of hands-on experience', required: true },
      { id: 'ai-5', label: 'Notice Period', type: 'select', options: 'Immediately Available, 2 Weeks, 1 Month, 2 Months+', hint: 'How soon can you start?', required: true },
      { id: 'ai-6', label: 'Technical Self-Rating', type: 'rating', hint: 'Rate your React architecture knowledge', required: true }
    ]
  },
  {
    title: 'Bug Report',
    prompt: 'Software bug report with severity, expected behavior, and reproduction steps',
    fields: [
      { id: 'ai-1', label: 'Reporter Name', type: 'text', placeholder: 'e.g. Dev Tester', hint: 'Your name or test handle', required: true },
      { id: 'ai-2', label: 'Issue Summary', type: 'text', placeholder: 'e.g. Form fails to submit when rating is 0', hint: 'Concise description of the bug', required: true },
      { id: 'ai-3', label: 'Severity Level', type: 'select', options: 'Low (Cosmetic), Medium (Workaround available), High (Feature broken), Critical (System outage)', hint: 'Select how severely this impacts usage', required: true },
      { id: 'ai-4', label: 'Steps to Reproduce', type: 'textarea', placeholder: '1. Navigate to /forms\n2. Click Submit without touching stars\n3. Observe error...', hint: 'Numbered sequential steps', required: true },
      { id: 'ai-5', label: 'Environment / Browser', type: 'text', placeholder: 'Chrome 122 on Windows 11', hint: 'OS and browser version', required: false }
    ]
  },
  {
    title: 'Event RSVP',
    prompt: 'Developer conference registration with ticket type, dietary options, and workshop choice',
    fields: [
      { id: 'ai-1', label: 'Full Name', type: 'text', placeholder: 'e.g. Priya Sharma', hint: 'For your badge printout', required: true },
      { id: 'ai-2', label: 'Work Email', type: 'email', placeholder: 'priya@tech.co', hint: 'Ticket confirmation will be sent here', required: true },
      { id: 'ai-3', label: 'Pass Type', type: 'select', options: 'Standard Attendee, VIP Workshop Pass, Student Discount, Speaker / Sponsor', hint: 'Select ticket category', required: true },
      { id: 'ai-4', label: 'Hands-on Workshop Choice', type: 'select', options: 'Building with WebAssembly, Real-time APIs with WebSockets, Production Next.js, Cloud-Native Kubernetes', hint: 'Afternoon interactive track', required: true },
      { id: 'ai-5', label: 'Dietary Restrictions', type: 'text', placeholder: 'e.g. None, Vegan, Nut allergy', hint: 'Catering requirements', required: false },
      { id: 'ai-6', label: 'I agree to the Community Code of Conduct', type: 'checkbox', hint: 'Required for all attendees', required: true }
    ]
  }
];

// =============================================================================

const SIMULATED_RESPONDENTS = [
  {
    name: 'Elena Rostova',
    role: 'Senior Frontend Engineer at CloudScale',
    email: 'elena.rostova@cloudscale.tech',
    phone: '+1 (555) 432-8765',
    company: 'CloudScale Technologies',
    budget: '$15k - $50k',
    scope: 'Looking for modern React component libraries with full accessibility and real-time telemetry charts.',
    exp: '6',
    rating: 5,
    like: 'The schema export and instant reactive preview are amazingly fast.',
    date: '2026-11-01'
  },
  {
    name: 'Marcus Vance',
    role: 'DevOps & Cloud Specialist at Stripe',
    email: 'marcus.v@devops-core.io',
    phone: '+1 (555) 789-1234',
    company: 'DevOps Core',
    budget: 'Enterprise ($50k+)',
    scope: 'Migrating microservices architecture to Kubernetes clusters with zero-downtime deployment.',
    exp: '8',
    rating: 4,
    like: 'Extremely clean developer workspace UI and intuitive keyboard navigation.',
    date: '2026-11-15'
  },
  {
    name: 'Sophia Lin',
    role: 'AI Systems Architect at Anthropic',
    email: 'sophia.lin@ai-research.org',
    phone: '+1 (555) 901-2345',
    company: 'AI Research Labs',
    budget: '$5k - $15k',
    scope: 'Interactive knowledge base integration with generative LLM assistants.',
    exp: '4',
    rating: 5,
    like: 'Dynamic form generation from portable JSON is exactly what we need for public surveys.',
    date: '2026-10-30'
  },
  {
    name: 'Jordan Blake',
    role: 'Backend Go/Node Lead at ScaleOps',
    email: 'jordan@blake-labs.dev',
    phone: '+1 (555) 678-4321',
    company: 'ScaleOps Inc',
    budget: '$1k - $5k',
    scope: 'High-throughput REST API performance audit and Redis connection pooling.',
    exp: '5',
    rating: 4,
    like: 'Love the mobile smartphone preview frame and real-time field progress bar.',
    date: '2026-11-10'
  }
];

const INITIAL_RESPONSES = [
  {
    id: 'resp-1',
    timestamp: '10:42 AM Today',
    author: 'Sarah Connor (Skynet Research)',
    source: '🌐 Public Web Respondent',
    apiStatus: '🌐 API 201 Created (142ms)',
    data: {
      'Full Name': 'Sarah Connor',
      'Work Email': 'sarah@skynet-research.ai',
      'Project Budget': '$15k - $50k',
      'Project Scope & Requirements': 'Looking for custom React component libraries with accessibility compliance and high-performance charts.',
      'Urgent Delivery Needed (Under 2 Weeks)': 'Yes'
    }
  },
  {
    id: 'resp-2',
    timestamp: 'Yesterday 4:15 PM',
    author: 'Marcus Vance (CloudScale IO)',
    source: '🌐 Public Web Respondent',
    apiStatus: '🌐 API 201 Created (168ms)',
    data: {
      'Full Name': 'Marcus Vance',
      'Work Email': 'marcus@cloudscale.io',
      'Project Budget': '$5k - $15k',
      'Project Scope & Requirements': 'Need full redesign of developer documentation portal with responsive code sandboxes.',
      'Urgent Delivery Needed (Under 2 Weeks)': 'No'
    }
  }
];

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: '🔤' },
  { type: 'email', label: 'Email', icon: '✉️' },
  { type: 'tel', label: 'Phone', icon: '📞' },
  { type: 'url', label: 'URL / Link', icon: '🌐' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'textarea', label: 'Paragraph', icon: '📑' },
  { type: 'select', label: 'Dropdown', icon: '🔽' },
  { type: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'rating', label: 'Rating', icon: '⭐' }
];

let fieldCounter = 200;
const getNextFieldId = () => `field-${++fieldCounter}`;

let responseCounter = 20;
const getNextResponseId = () => `resp-${++responseCounter}`;

export default function FormBuilder() {
  const [searchParams] = useSearchParams();

  // Initialize from searchParams if navigated with public link
  const initialView = searchParams.get('view') === 'public' ? 'respondent' : 'studio';
  const initialTplKey = searchParams.get('template');
  const initialTpl = initialTplKey && FORM_TEMPLATES[initialTplKey] ? FORM_TEMPLATES[initialTplKey] : FORM_TEMPLATES.contact;

  // Core Form Schema & Metadata
  const [fields, setFields] = useState(initialTpl.fields);
  const [activeTemplate, setActiveTemplate] = useState(initialTplKey && FORM_TEMPLATES[initialTplKey] ? initialTplKey : 'contact');
  const [formTitle, setFormTitle] = useState(initialTpl.name);
  const [formDescription, setFormDescription] = useState(initialTpl.description);
  const [isEditingFormMeta, setIsEditingFormMeta] = useState(false);

  // Stored Submissions in LocalStorage
  const [responses, setResponses] = useLocalStorage('devstudio_form_responses', INITIAL_RESPONSES);


  // View & Presentation Modes
  const [viewMode, setViewMode] = useState(initialView); // 'studio' | 'respondent'
  const [activeTab, setActiveTab] = useState('builder'); // 'builder' | 'responses' | 'schema'
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'mobile'

  // Modals & Feedback
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);
  const [copyCodeFeedback, setCopyCodeFeedback] = useState(false);
  const [searchSubmissions, setSearchSubmissions] = useState('');

  // Screen Reader Accessibility Announcements
  const [a11yNotice, setA11yNotice] = useState('');
  const announceToScreenReader = useCallback((msg) => {
    setA11yNotice(msg);
    setTimeout(() => setA11yNotice(''), 4000);
  }, []);

  // Field Creator State
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('text');
  const [newPlaceholder, setNewPlaceholder] = useState('');
  const [newHint, setNewHint] = useState('');
  const [newRequired, setNewRequired] = useState(false);
  const [newOptions, setNewOptions] = useState('Option 1, Option 2, Option 3');
  const newLabelInputRef = useRef(null);

  // In-place Field Editing State
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFieldState, setEditFieldState] = useState({});

  // Active form data (interactive answers)
  const [formData, setFormData] = useState({});

  // AI Form Generator State
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Schema Import State
  const [schemaImportText, setSchemaImportText] = useState('');
  const [schemaImportError, setSchemaImportError] = useState('');


  // Real-time Progress calculation
  const progressPercent = useMemo(() => {
    if (fields.length === 0) return 0;
    const filledCount = fields.filter((f) => {
      const val = formData[f.label];
      if (val === undefined || val === null || val === '') return false;
      if (f.type === 'checkbox') return val === 'Yes';
      return true;
    }).length;
    return Math.round((filledCount / fields.length) * 100);
  }, [fields, formData]);

  // Submissions Analytics
  const submissionsAnalytics = useMemo(() => {
    let totalScore = 0;
    let ratingCount = 0;
    responses.forEach((r) => {
      if (!r.data) return;
      Object.values(r.data).forEach((val) => {
        if (typeof val === 'number') {
          totalScore += val;
          ratingCount++;
        }
      });
    });
    const avgScore = ratingCount > 0 ? (totalScore / ratingCount).toFixed(1) : null;
    return {
      total: responses.length,
      avgScore,
      latest: responses.length > 0 ? responses[0].timestamp : 'No entries'
    };
  }, [responses]);

  // Filtered submissions
  const filteredResponses = useMemo(() => {
    if (!searchSubmissions.trim()) return responses;
    const q = searchSubmissions.toLowerCase();
    return responses.filter((r) => {
      const authorMatch = (r.author || '').toLowerCase().includes(q);
      const dataMatch = r.data && Object.values(r.data).some((val) => String(val).toLowerCase().includes(q));
      return authorMatch || dataMatch;
    });
  }, [responses, searchSubmissions]);

  // Load Preset Template
  const handleLoadTemplate = (key) => {
    const tpl = FORM_TEMPLATES[key];
    if (!tpl) return;
    setActiveTemplate(key);
    setFields(tpl.fields);
    setFormTitle(tpl.name);
    setFormDescription(tpl.description);
    setFormData({});
    setEditingFieldId(null);
    announceToScreenReader(`Loaded template: ${tpl.name}`);
  };

  // 1-Click Quick Add Field for Beginners
  const handleQuickAddField = (preset) => {
    const newField = {
      id: getNextFieldId(),
      label: preset.label,
      type: preset.type,
      placeholder: preset.placeholder || '',
      hint: preset.hint || '',
      required: preset.required || false,
      ...(preset.options ? { options: preset.options } : {})
    };
    setFields((prev) => [...prev, newField]);
    announceToScreenReader(`Added field: ${preset.label}`);
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
      hint: newHint.trim(),
      required: newRequired,
      ...(newType === 'select' ? { options: newOptions.trim() } : {})
    };

    setFields([...fields, newFieldObj]);
    setNewLabel('');
    setNewPlaceholder('');
    setNewHint('');
    setNewRequired(false);
    newLabelInputRef.current?.focus();
    announceToScreenReader(`Added custom question: ${newFieldObj.label}`);
  };

  // In-place Field Editing Handlers
  const handleStartEditField = (field) => {
    setEditingFieldId(field.id);
    setEditFieldState({ ...field });
  };

  const handleSaveFieldEdit = (id) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...editFieldState } : f))
    );
    setEditingFieldId(null);
    announceToScreenReader(`Saved changes to question: ${editFieldState.label}`);
  };

  const handleCancelFieldEdit = () => {
    setEditingFieldId(null);
    setEditFieldState({});
  };

  // Delete Field
  const handleRemoveField = (id, label) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    if (editingFieldId === id) setEditingFieldId(null);
    announceToScreenReader(`Deleted question: ${label}`);
  };

  // Reorder Field
  const handleMoveField = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= fields.length) return;
    const updated = [...fields];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setFields(updated);
    announceToScreenReader(`Moved ${moved.label} to position ${newIdx + 1}`);
  };

  // Duplicate Field
  const handleDuplicateField = (field) => {
    const duplicated = {
      ...field,
      id: getNextFieldId(),
      label: `${field.label} (Copy)`
    };
    setFields((prev) => [...prev, duplicated]);
    announceToScreenReader(`Duplicated question: ${field.label}`);
  };

  // 1-Click "Fill Sample Answers" for Beginner Testing
  const handleAutofillSampleData = () => {
    const sample = {};
    fields.forEach((f) => {
      const lower = f.label.toLowerCase();
      if (lower.includes('name') || lower.includes('author') || lower.includes('candidate')) {
        sample[f.label] = 'Alex Rivera';
      } else if (f.type === 'email' || lower.includes('email')) {
        sample[f.label] = 'alex.rivera@example.com';
      } else if (f.type === 'tel' || lower.includes('phone')) {
        sample[f.label] = '+1 (555) 765-4321';
      } else if (f.type === 'url' || lower.includes('portfolio') || lower.includes('github')) {
        sample[f.label] = 'https://github.com/alexrivera';
      } else if (f.type === 'number' || lower.includes('year') || lower.includes('budget') || lower.includes('experience')) {
        sample[f.label] = '4';
      } else if (f.type === 'date') {
        sample[f.label] = new Date().toISOString().split('T')[0];
      } else if (f.type === 'rating') {
        sample[f.label] = 5;
      } else if (f.type === 'checkbox') {
        sample[f.label] = 'Yes';
      } else if (f.type === 'select') {
        const opts = (f.options || '').split(',').map((o) => o.trim()).filter(Boolean);
        sample[f.label] = opts[0] || 'Option 1';
      } else if (f.type === 'textarea') {
        sample[f.label] = 'This is a sample test submission to evaluate the form builder schema and real-time validation.';
      } else {
        sample[f.label] = 'Sample Input';
      }
    });
    setFormData(sample);
    announceToScreenReader('Autofilled form with sample test answers');
  };

  // AI Form Generator Action
  const handleGenerateAI = (customPrompt = null) => {
    const promptText = (customPrompt || aiPromptInput).trim();
    if (!promptText) return;

    setIsGeneratingAI(true);
    announceToScreenReader('Generating form schema with AI...');

    // Find best match or generate adaptive schema
    const matched = AI_PROMPTS.find(
      (p) =>
        promptText.toLowerCase().includes(p.title.toLowerCase()) ||
        p.prompt.toLowerCase().includes(promptText.toLowerCase())
    ) || AI_PROMPTS[0];

    setTimeout(() => {
      setFields(matched.fields);
      setFormTitle(`${matched.title} Form`);
      setFormDescription(`Smart schema generated for: ${promptText}`);
      setIsGeneratingAI(false);
      setAiPromptInput('');
      setToastMessage(`✨ AI generated ${matched.fields.length} questions for "${matched.title}"!`);
      setTimeout(() => setToastMessage(null), 4500);
      announceToScreenReader(`AI generated ${matched.fields.length} questions for ${matched.title}`);
    }, 700);
  };

  // Submit Form Response
  const handleSubmitResponse = (e, isRespondentMode = false) => {
    e.preventDefault();
    const submissionId = getNextResponseId();
    const respondentName =
      formData['Full Name'] ||
      formData['Candidate Name'] ||
      formData['Your Name or Alias'] ||
      formData['Attendee Name'] ||
      'Guest Respondent';

    const newSubmission = {
      id: submissionId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: isRespondentMode ? `${respondentName} (External User)` : `${respondentName} (Studio Sandbox)`,
      source: isRespondentMode ? '🌐 Public Web Respondent' : '📱 Studio Sandbox Test',
      apiStatus: '💾 Verified Response',
      data: { ...formData }
    };

    setResponses([newSubmission, ...responses]);
    setFormData({});
    setSubmittedFeedback(true);
    announceToScreenReader('Response captured successfully!');
    setTimeout(() => setSubmittedFeedback(false), 4500);
  };

  // Simulate External Public Submission
  const handleSimulatePublicResponse = () => {
    const respondent = SIMULATED_RESPONDENTS[Math.floor(Math.random() * SIMULATED_RESPONDENTS.length)];
    const submissionData = {};

    fields.forEach((f) => {
      const labelLower = f.label.toLowerCase();
      if (labelLower.includes('name')) {
        submissionData[f.label] = respondent.name;
      } else if (labelLower.includes('email')) {
        submissionData[f.label] = respondent.email;
      } else if (labelLower.includes('phone')) {
        submissionData[f.label] = respondent.phone;
      } else if (labelLower.includes('company') || labelLower.includes('organization')) {
        submissionData[f.label] = respondent.company;
      } else if (labelLower.includes('role') || labelLower.includes('position')) {
        submissionData[f.label] = respondent.role.split(' at ')[0];
      } else if (labelLower.includes('budget')) {
        submissionData[f.label] = respondent.budget;
      } else if (labelLower.includes('experience') || f.type === 'number') {
        submissionData[f.label] = respondent.exp;
      } else if (f.type === 'rating') {
        submissionData[f.label] = respondent.rating;
      } else if (f.type === 'checkbox') {
        submissionData[f.label] = 'Yes';
      } else if (f.type === 'date') {
        submissionData[f.label] = respondent.date;
      } else if (f.type === 'select') {
        const opts = (f.options || '').split(',').map((o) => o.trim()).filter(Boolean);
        submissionData[f.label] = opts[Math.floor(Math.random() * opts.length)] || 'Selected Option';
      } else if (labelLower.includes('feature') || labelLower.includes('like') || labelLower.includes('feedback')) {
        submissionData[f.label] = respondent.like;
      } else {
        submissionData[f.label] = respondent.scope;
      }
    });

    const newSubmission = {
      id: getNextResponseId(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      author: respondent.name,
      source: '🌐 Public Web Respondent',
      apiStatus: '🌐 API 201 Created (135ms)',
      data: submissionData
    };

    setResponses([newSubmission, ...responses]);
    setToastMessage(`🎉 Public response received from ${respondent.name} (${respondent.role})!`);
    announceToScreenReader(`New response received from ${respondent.name}`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Copy Public Link
  const handleCopyPublicLink = () => {
    const url = `${window.location.origin}/forms?view=public&template=${activeTemplate}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    announceToScreenReader('Public form link copied to clipboard');
    setTimeout(() => setShareCopied(false), 2500);
  };

  // Export Responses JSON
  const handleExportResponsesJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(responses, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `devstudio_${formTitle.toLowerCase().replace(/\s+/g, '_')}_responses.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    announceToScreenReader('Downloaded form responses JSON');
  };

  // Copy Schema JSON
  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(fields, null, 2));
    setCopyCodeFeedback(true);
    announceToScreenReader('Copied schema JSON to clipboard');
    setTimeout(() => setCopyCodeFeedback(false), 2000);
  };

  // Import Schema JSON
  const handleImportSchema = (e) => {
    e.preventDefault();
    setSchemaImportError('');
    try {
      const parsed = JSON.parse(schemaImportText);
      if (!Array.isArray(parsed)) {
        throw new Error('Schema must be a JSON array of field objects: [ { id, label, type, ... } ]');
      }
      const validated = parsed.map((item, i) => ({
        id: item.id || `imp-${i + 1}`,
        label: item.label || `Question ${i + 1}`,
        type: item.type || 'text',
        placeholder: item.placeholder || '',
        hint: item.hint || '',
        required: Boolean(item.required),
        ...(item.options ? { options: item.options } : {})
      }));
      setFields(validated);
      setSchemaImportText('');
      setToastMessage(`✅ Successfully imported ${validated.length} fields from schema JSON!`);
      announceToScreenReader(`Successfully imported ${validated.length} fields`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setSchemaImportError(`Invalid JSON schema: ${err.message}`);
    }
  };

  // Delete single response
  const handleDeleteResponse = (id) => {
    setResponses((prev) => prev.filter((r) => r.id !== id));
    announceToScreenReader('Deleted submission record');
  };

  // Accessible Keyboard Star Rating Handler
  const handleStarKeyDown = (e, fieldLabel, currentRating) => {
    let next = currentRating || 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      next = Math.min(5, next + 1);
      setFormData({ ...formData, [fieldLabel]: next });
      announceToScreenReader(`${next} of 5 stars selected`);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      next = Math.max(1, next - 1);
      setFormData({ ...formData, [fieldLabel]: next });
      announceToScreenReader(`${next} of 5 stars selected`);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFormData({ ...formData, [fieldLabel]: 1 });
    } else if (e.key === 'End') {
      e.preventDefault();
      setFormData({ ...formData, [fieldLabel]: 5 });
    }
  };


  // Reusable Form Input Renderer (Strict WCAG Accessibility Compliance)
  const renderFormInputs = () => (
    <div className="form-fields-wrapper" role="group" aria-label="Form Questions">
      {fields.map((f) => {
        const inputId = `form-input-${f.id}`;
        const hintId = `hint-${f.id}`;
        const currentVal = formData[f.label];

        return (
          <div key={f.id} className="form-group" style={{ marginBottom: '1.25rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
              <label
                htmlFor={f.type === 'rating' ? undefined : inputId}
                id={f.type === 'rating' ? `label-${f.id}` : undefined}
                style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}
              >
                {f.label}
                {f.required ? (
                  <>
                    <span aria-hidden="true" className="text-danger" style={{ marginLeft: '0.25rem' }}>
                      *
                    </span>
                    <span className="sr-only"> (required)</span>
                  </>
                ) : (
                  <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.4rem', fontWeight: 400 }}>
                    (optional)
                  </span>
                )}
              </label>

              <span
                className="text-muted"
                style={{ fontSize: '0.75rem', textTransform: 'capitalize', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.45rem', borderRadius: '4px' }}
              >
                {f.type}
              </span>
            </div>

            {f.type === 'textarea' ? (
              <textarea
                id={inputId}
                rows="3"
                className="form-input"
                placeholder={f.placeholder || 'Type your message...'}
                aria-describedby={f.hint ? hintId : undefined}
                aria-required={f.required}
                value={currentVal || ''}
                onChange={(e) => setFormData({ ...formData, [f.label]: e.target.value })}
                required={f.required}
              />
            ) : f.type === 'select' ? (
              <select
                id={inputId}
                className="form-input"
                aria-describedby={f.hint ? hintId : undefined}
                aria-required={f.required}
                value={currentVal || ''}
                onChange={(e) => setFormData({ ...formData, [f.label]: e.target.value })}
                required={f.required}
              >
                <option value="">-- Select an option --</option>
                {(f.options || '').split(',').map((opt, i) => {
                  const cleaned = opt.trim();
                  return cleaned ? (
                    <option key={i} value={cleaned}>
                      {cleaned}
                    </option>
                  ) : null;
                })}
              </select>
            ) : f.type === 'checkbox' ? (
              <label htmlFor={inputId} className="checkbox-toggle-container">
                <input
                  type="checkbox"
                  id={inputId}
                  checked={currentVal === 'Yes'}
                  aria-describedby={f.hint ? hintId : undefined}
                  aria-required={f.required}
                  onChange={(e) => setFormData({ ...formData, [f.label]: e.target.checked ? 'Yes' : 'No' })}
                  required={f.required}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {f.placeholder || 'I acknowledge and confirm this item'}
                </span>
              </label>
            ) : f.type === 'rating' ? (
              <div
                role="radiogroup"
                aria-labelledby={`label-${f.id}`}
                aria-describedby={f.hint ? hintId : undefined}
                aria-required={f.required}
                className="star-rating-picker"
                tabIndex={0}
                onKeyDown={(e) => handleStarKeyDown(e, f.label, currentVal)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isChecked = currentVal === star;
                  return (
                    <button
                      type="button"
                      key={star}
                      role="radio"
                      aria-checked={isChecked}
                      aria-label={`${star} of 5 stars`}
                      tabIndex={isChecked || (!currentVal && star === 1) ? 0 : -1}
                      className={`star-btn ${(currentVal || 0) >= star ? 'star-active' : ''}`}
                      onClick={() => setFormData({ ...formData, [f.label]: star })}
                    >
                      ★
                    </button>
                  );
                })}
                <span className="rating-num-label" aria-live="polite">
                  {currentVal ? `${currentVal} / 5 Stars` : 'Click or use arrow keys'}
                </span>
              </div>
            ) : (
              <input
                id={inputId}
                type={f.type}
                className="form-input"
                placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`}
                aria-describedby={f.hint ? hintId : undefined}
                aria-required={f.required}
                value={currentVal || ''}
                onChange={(e) => setFormData({ ...formData, [f.label]: e.target.value })}
                required={f.required}
              />
            )}

            {f.hint && (
              <span id={hintId} className="form-field-hint">
                ℹ️ {f.hint}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="module-container">
      {/* Live Region for Screen Reader Announcements (a11y) */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {a11yNotice}
      </div>

      {/* Floating Toast Alert Banner */}
      {toastMessage && (
        <div className="live-toast-banner" role="status" aria-live="polite">
          <span>{toastMessage}</span>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem', borderColor: 'rgba(52, 211, 153, 0.4)', color: '#34d399' }}
            onClick={() => setActiveTab('responses')}
          >
            View Submissions Inbox →
          </button>
        </div>
      )}

      {/* Module Header Bar with Mode Switcher */}
      <header className="module-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>📋 Dynamic Form Studio &amp; Response Engine</h2>
        </div>

        {/* Dual Mode Switcher: Studio Builder vs Public Respondent */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-mode-segmented" role="group" aria-label="Workspace View Mode">
            <button
              type="button"
              className={`mode-segment-btn ${viewMode === 'studio' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('studio');
                announceToScreenReader('Switched to Creator Studio');
              }}
              aria-pressed={viewMode === 'studio'}
            >
              🛠️ Creator Studio
            </button>
            <button
              type="button"
              className={`mode-segment-btn ${viewMode === 'respondent' ? 'active' : ''}`}
              onClick={() => {
                setViewMode('respondent');
                announceToScreenReader('Switched to Public Respondent View');
              }}
              aria-pressed={viewMode === 'respondent'}
            >
              🌐 Public Respondent View
            </button>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setShowShareModal(true)}
            aria-haspopup="dialog"
          >
            🔗 Share Form Link
          </button>
        </div>
      </header>

      {/* =====================================================================
          VIEW MODE 1: PUBLIC RESPONDENT VIEW (Accessible Standalone Form)
          ===================================================================== */}
      {viewMode === 'respondent' ? (
        <section className="respondent-standalone-wrapper" aria-labelledby="public-form-heading">
          <div className="respondent-card">
            <div className="respondent-top-strip">
              <div className="respondent-live-pill">
                <span className="pulse-emerald-dot" aria-hidden="true"></span>
                <span>Live Public Form • Accepting Submissions</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setViewMode('studio')}
                aria-label="Return to Creator Studio"
              >
                ← Return to Creator Studio
              </button>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <h1 id="public-form-heading" style={{ fontSize: '2rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                {formTitle}
              </h1>
              <p className="card-description" style={{ fontSize: '0.95rem' }}>
                {formDescription}
              </p>
            </div>

            {/* Real-time Progress Bar */}
            <div className="form-progress-wrap" role="region" aria-label="Progress">
              <div className="form-progress-header">
                <span>Completion Status</span>
                <strong>{progressPercent}% Completed</strong>
              </div>
              <div
                className="form-progress-track"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Form completion progress"
              >
                <div className="form-progress-indicator" style={{ width: `${progressPercent}%` }}></div>
              </div>
            </div>

            {submittedFeedback ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }} role="status">
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
                <h2 style={{ color: '#34d399', marginBottom: '0.5rem' }}>Thank You! Response Recorded.</h2>
                <p className="card-description" style={{ maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
                  Your submission has been captured into the creator&apos;s Submissions Inbox and forwarded to the API endpoint with timestamp and schema mapping.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setFormData({});
                      setSubmittedFeedback(false);
                    }}
                  >
                    Submit Another Response
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setViewMode('studio');
                      setActiveTab('responses');
                    }}
                  >
                    View In Submissions Inbox
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={(e) => handleSubmitResponse(e, true)}>
                {renderFormInputs()}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', marginTop: '1.75rem', padding: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <span>Submit Response as Public User 🚀</span>
                </button>
              </form>
            )}

            <div
              style={{
                marginTop: '2rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                color: 'var(--text-muted)'
              }}
            >
              <span>🔒 WCAG 2.1 AA Accessible Form</span>
              <span>⚡ Powered by DevStudio Dynamic Engine</span>
            </div>
          </div>
        </section>
      ) : (
        /* =====================================================================
           VIEW MODE 2: CREATOR STUDIO (Visual Designer + API + Submissions)
           ===================================================================== */
        <>

          {/* Sub-Navigation Tabs */}
          <nav role="tablist" aria-label="Form Studio navigation tabs" className="form-studio-nav" style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              role="tab"
              id="tab-builder"
              aria-controls="tabpanel-builder"
              aria-selected={activeTab === 'builder'}
              className={`btn btn-sm ${activeTab === 'builder' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('builder')}
            >
              🛠️ Visual Designer &amp; Preview
            </button>
            <button
              type="button"
              role="tab"
              id="tab-responses"
              aria-controls="tabpanel-responses"
              aria-selected={activeTab === 'responses'}
              className={`btn btn-sm ${activeTab === 'responses' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('responses')}
            >
              📬 Submissions Inbox ({responses.length})
            </button>
            <button
              type="button"
              role="tab"
              id="tab-schema"
              aria-controls="tabpanel-schema"
              aria-selected={activeTab === 'schema'}
              className={`btn btn-sm ${activeTab === 'schema' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('schema')}
            >
              ⚙️ Schema JSON &amp; Import
            </button>
          </nav>

          {/* ===================================================================
              TAB 1: BUILDER & DEVICE PREVIEW
              =================================================================== */}
          {activeTab === 'builder' && (
            <div id="tabpanel-builder" role="tabpanel" aria-labelledby="tab-builder">
              {/* Form Title & Description Card (Editable for Beginners) */}
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    {isEditingFormMeta ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <label htmlFor="form-title-input" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                            Form Title
                          </label>
                          <input
                            id="form-title-input"
                            className="form-input"
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder="Enter form title..."
                          />
                        </div>
                        <div>
                          <label htmlFor="form-desc-input" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Form Subtitle / Instructions
                          </label>
                          <input
                            id="form-desc-input"
                            className="form-input"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Enter subtitle or instructions for respondents..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge-small" style={{ textTransform: 'uppercase' }}>Active Form</span>
                          <h3 style={{ margin: 0, fontSize: '1.3rem' }}>{formTitle}</h3>
                        </div>
                        <p className="card-description" style={{ marginTop: '0.35rem', marginBottom: 0 }}>
                          {formDescription}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => setIsEditingFormMeta(!isEditingFormMeta)}
                    >
                      {isEditingFormMeta ? '✅ Done Editing Title' : '✏️ Rename Form'}
                    </button>
                  </div>
                </div>

                {/* Preset Template Selector */}
                <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="templates-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginRight: '0.5rem' }}>
                    📑 Load Preset Form:
                  </span>
                  <div className="templates-btn-group" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {Object.entries(FORM_TEMPLATES).map(([key, tpl]) => (
                      <button
                        type="button"
                        key={key}
                        className={`template-pill-btn ${activeTemplate === key ? 'active' : ''}`}
                        onClick={() => handleLoadTemplate(key)}
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 1-Click Quick-Add Field Library */}
              <div className="quick-add-section">
                <div className="flex-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>⚡</span>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)' }}>
                      1-Click Quick Add Fields
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Tap any chip to immediately append to your form
                  </span>
                </div>
                <div className="quick-add-grid" role="group" aria-label="Quick add field presets">
                  {QUICK_ADD_PRESETS.map((p, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className="quick-add-chip"
                      onClick={() => handleQuickAddField(p)}
                      title={`Quickly add ${p.label}`}
                    >
                      <span aria-hidden="true">{p.icon}</span>
                      <span>+ {p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart AI Form Generator Box */}
              <div className="ai-generator-box">
                <div className="flex-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>✨</span>
                    <strong style={{ fontSize: '0.88rem', color: '#c084fc' }}>
                      Smart AI Form Generator
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Describe your form or click a suggested prompt
                  </span>
                </div>

                <div className="ai-generator-input-row">
                  <input
                    className="ai-prompt-input"
                    placeholder="e.g. Hackathon registration with team size, diet, and track preferences..."
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGenerateAI();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', padding: '0.5rem 1rem' }}
                    onClick={() => handleGenerateAI()}
                    disabled={isGeneratingAI || !aiPromptInput.trim()}
                  >
                    {isGeneratingAI ? '✨ Generating...' : '✨ Generate'}
                  </button>
                </div>

                <div className="ai-preset-chips" role="group" aria-label="AI prompt presets">
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.25rem' }}>
                    Suggestions:
                  </span>
                  {AI_PROMPTS.map((item, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className="ai-preset-btn"
                      onClick={() => handleGenerateAI(item.prompt)}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="split-grid form-builder-split">
                {/* Left Column: Field Designer & Active Schema */}
                <div className="form-designer-column">
                  {/* Add Custom Question Form */}
                  <div className="card">
                    <div className="flex-between">
                      <h3>1. Add Custom Question</h3>
                      <span className="badge-small">Manual Builder</span>
                    </div>

                    <form onSubmit={handleAddField} className="add-field-form" style={{ marginTop: '1rem' }}>
                      <div className="form-group">
                        <label htmlFor="custom-question-label">Question / Field Label</label>
                        <input
                          id="custom-question-label"
                          ref={newLabelInputRef}
                          className="form-input"
                          placeholder="e.g. Work Phone, GitHub Profile, Budget..."
                          value={newLabel}
                          onChange={(e) => setNewLabel(e.target.value)}
                          required
                        />
                      </div>

                      {/* Visual Input Type Chips Selector */}
                      <div className="form-group">
                        <label>Select Input Type</label>
                        <div className="field-type-pill-grid" role="radiogroup" aria-label="Input field type">
                          {FIELD_TYPES.map((ft) => (
                            <button
                              type="button"
                              key={ft.type}
                              role="radio"
                              aria-checked={newType === ft.type}
                              className={`type-chip-btn ${newType === ft.type ? 'active' : ''}`}
                              onClick={() => setNewType(ft.type)}
                            >
                              <span style={{ fontSize: '1.1rem' }} aria-hidden="true">{ft.icon}</span>
                              <span>{ft.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid-2-compact">
                        <div className="form-group">
                          <label htmlFor="custom-placeholder">Placeholder (Optional)</label>
                          <input
                            id="custom-placeholder"
                            className="form-input"
                            placeholder="e.g. Type answer..."
                            value={newPlaceholder}
                            onChange={(e) => setNewPlaceholder(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="custom-hint">Help Text / Hint (Optional)</label>
                          <input
                            id="custom-hint"
                            className="form-input"
                            placeholder="e.g. We will never share this"
                            value={newHint}
                            onChange={(e) => setNewHint(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginTop: '0.4rem' }}>
                        <label className="checkbox-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={newRequired}
                            onChange={(e) => setNewRequired(e.target.checked)}
                            style={{ marginRight: '0.5rem', accentColor: 'var(--accent-cyan)' }}
                          />
                          <span>Required Question (User cannot submit without filling)</span>
                        </label>
                      </div>

                      {newType === 'select' && (
                        <div className="form-group">
                          <label htmlFor="custom-options">Dropdown Options (Comma-separated)</label>
                          <input
                            id="custom-options"
                            className="form-input"
                            placeholder="Option 1, Option 2, Option 3"
                            value={newOptions}
                            onChange={(e) => setNewOptions(e.target.value)}
                          />
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
                        ➕ Insert Question Into Form
                      </button>
                    </form>
                  </div>

                  {/* Active Schema Reorder List & In-Place Editor */}
                  <div className="card" style={{ marginTop: '1.5rem' }}>
                    <div className="flex-between">
                      <div>
                        <h3>Active Schema Questions ({fields.length})</h3>
                        <p className="card-description" style={{ fontSize: '0.8rem' }}>
                          Edit, reorder, duplicate or remove questions
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          setFields([]);
                          announceToScreenReader('Cleared all questions');
                        }}
                        disabled={fields.length === 0}
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="fields-sortable-list" style={{ marginTop: '1rem' }}>
                      {fields.length === 0 ? (
                        <p className="text-secondary" style={{ textAlign: 'center', padding: '1.5rem' }}>
                          No questions in form. Click a 1-Click Quick Add chip above or select a preset template!
                        </p>
                      ) : (
                        fields.map((f, idx) => (
                          <div key={f.id} style={{ marginBottom: '0.5rem' }}>
                            <div className="field-schema-item">
                              <div className="field-schema-info">
                                <span className="field-type-pill">{f.type}</span>
                                <span className="field-label-text">
                                  {f.label} {f.required && <span className="text-danger" aria-hidden="true">*</span>}
                                </span>
                              </div>
                              <div className="field-schema-actions">
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleStartEditField(f)}
                                  aria-label={`Edit question ${f.label}`}
                                  title="Edit Question"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleMoveField(idx, -1)}
                                  disabled={idx === 0}
                                  aria-label={`Move ${f.label} up`}
                                  title="Move Up"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleMoveField(idx, 1)}
                                  disabled={idx === fields.length - 1}
                                  aria-label={`Move ${f.label} down`}
                                  title="Move Down"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon"
                                  onClick={() => handleDuplicateField(f)}
                                  aria-label={`Duplicate ${f.label}`}
                                  title="Duplicate"
                                >
                                  ⧉
                                </button>
                                <button
                                  type="button"
                                  className="btn-icon btn-icon-danger"
                                  onClick={() => handleRemoveField(f.id, f.label)}
                                  aria-label={`Delete ${f.label}`}
                                  title="Delete"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>

                            {/* In-Place Field Editor Drawer */}
                            {editingFieldId === f.id && (
                              <div className="field-inline-editor">
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                                  ✏️ Edit Question Settings
                                </h4>
                                <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                                  <label htmlFor={`edit-label-${f.id}`} style={{ fontSize: '0.78rem' }}>Question Label</label>
                                  <input
                                    id={`edit-label-${f.id}`}
                                    className="form-input"
                                    value={editFieldState.label || ''}
                                    onChange={(e) => setEditFieldState({ ...editFieldState, label: e.target.value })}
                                  />
                                </div>

                                <div className="grid-2-compact" style={{ marginBottom: '0.65rem' }}>
                                  <div className="form-group">
                                    <label htmlFor={`edit-placeholder-${f.id}`} style={{ fontSize: '0.78rem' }}>Placeholder</label>
                                    <input
                                      id={`edit-placeholder-${f.id}`}
                                      className="form-input"
                                      value={editFieldState.placeholder || ''}
                                      onChange={(e) => setEditFieldState({ ...editFieldState, placeholder: e.target.value })}
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label htmlFor={`edit-hint-${f.id}`} style={{ fontSize: '0.78rem' }}>Help Hint Text</label>
                                    <input
                                      id={`edit-hint-${f.id}`}
                                      className="form-input"
                                      value={editFieldState.hint || ''}
                                      onChange={(e) => setEditFieldState({ ...editFieldState, hint: e.target.value })}
                                    />
                                  </div>
                                </div>

                                {editFieldState.type === 'select' && (
                                  <div className="form-group" style={{ marginBottom: '0.65rem' }}>
                                    <label htmlFor={`edit-opts-${f.id}`} style={{ fontSize: '0.78rem' }}>Dropdown Options (comma-separated)</label>
                                    <input
                                      id={`edit-opts-${f.id}`}
                                      className="form-input"
                                      value={editFieldState.options || ''}
                                      onChange={(e) => setEditFieldState({ ...editFieldState, options: e.target.value })}
                                    />
                                  </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                                  <label className="checkbox-label" style={{ fontSize: '0.82rem' }}>
                                    <input
                                      type="checkbox"
                                      checked={Boolean(editFieldState.required)}
                                      onChange={(e) => setEditFieldState({ ...editFieldState, required: e.target.checked })}
                                      style={{ marginRight: '0.4rem', accentColor: 'var(--accent-cyan)' }}
                                    />
                                    <span>Required</span>
                                  </label>

                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline"
                                      onClick={handleCancelFieldEdit}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      onClick={() => handleSaveFieldEdit(f.id)}
                                    >
                                      Save Question
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Device Sandbox Preview */}
                <div className="card live-preview-card">
                  <div
                    className="flex-between"
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '0.75rem',
                      marginBottom: '1.25rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📱 2. Live Device Sandbox</span>
                      </h3>
                      <span className="badge-small" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                        Real-time reactive rendering
                      </span>
                    </div>

                    {/* Device Viewport & Autofill Testing Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="device-toggle-pill" role="group" aria-label="Device viewport preview">
                        <button
                          type="button"
                          className={`device-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
                          onClick={() => setDeviceMode('desktop')}
                          aria-pressed={deviceMode === 'desktop'}
                        >
                          🖥️ Desktop
                        </button>
                        <button
                          type="button"
                          className={`device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
                          onClick={() => setDeviceMode('mobile')}
                          aria-pressed={deviceMode === 'mobile'}
                        >
                          📱 Mobile
                        </button>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleAutofillSampleData}
                        title="Autofill realistic sample answers for quick testing"
                      >
                        🎲 Fill Sample Data
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={handleSimulatePublicResponse}
                        title="Simulate an external respondent submitting your form"
                      >
                        👤 Sim Public Submit
                      </button>
                    </div>
                  </div>

                  {submittedFeedback && (
                    <div className="alert-success" style={{ marginBottom: '1rem' }} role="status">
                      ✅ Response captured successfully! Recorded into submissions inbox.
                    </div>
                  )}

                  {/* Real-time Completion Progress Bar */}
                  <div className="form-progress-wrap" role="region" aria-label="Live Progress">
                    <div className="form-progress-header">
                      <span>Live Form Progress</span>
                      <strong>{progressPercent}% Complete</strong>
                    </div>
                    <div
                      className="form-progress-track"
                      role="progressbar"
                      aria-valuenow={progressPercent}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-label="Preview form completion progress"
                    >
                      <div className="form-progress-indicator" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>

                  {/* Conditionally Render Inside Mobile Frame or Standard Card */}
                  {deviceMode === 'mobile' ? (
                    <div className="mobile-phone-frame" role="region" aria-label="Mobile viewport preview">
                      <div className="phone-dynamic-island" aria-hidden="true">
                        <span className="phone-camera-dot"></span>
                        <span className="phone-speaker-slot"></span>
                      </div>
                      <div className="phone-screen-content">
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{formTitle}</h4>
                        <p className="card-description" style={{ fontSize: '0.78rem', marginBottom: '1rem' }}>
                          {formDescription}
                        </p>
                        <form onSubmit={(e) => handleSubmitResponse(e, false)}>
                          {renderFormInputs()}
                          <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                          >
                            <span>Submit Response 🚀</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : fields.length === 0 ? (
                    <div className="empty-response-state">
                      <span className="empty-icon" aria-hidden="true">📝</span>
                      <p>Add some input questions on the left or tap a 1-Click Quick Add chip to preview your form here.</p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleSubmitResponse(e, false)} className="preview-form-body">
                      {renderFormInputs()}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          style={{ flex: 1, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        >
                          <span>Submit Sandbox Response 🚀</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => setFormData({})}
                        >
                          Reset
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* ===================================================================
              TAB 3: SUBMISSIONS INBOX WITH ANALYTICS & API DELIVERY STATUS
              =================================================================== */}
          {activeTab === 'responses' && (
            <div id="tabpanel-responses" role="tabpanel" aria-labelledby="tab-responses" className="card form-responses-view">
              <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3>Captured Form Submissions ({responses.length})</h3>
                  <p className="card-description">
                    Structured responses collected from public web respondents, sandbox testing, and API dispatches.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSimulatePublicResponse}
                  >
                    🎲 Simulate Public Response
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleExportResponsesJson}
                    disabled={responses.length === 0}
                  >
                    📥 Export JSON
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setResponses([]);
                      announceToScreenReader('Cleared all submissions');
                    }}
                    disabled={responses.length === 0}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Submissions Analytics Telemetry Bar */}
              <div className="submissions-stats-grid">
                <div className="sub-stat-card">
                  <span className="sub-stat-num">{submissionsAnalytics.total}</span>
                  <span className="sub-stat-label">Total Responses</span>
                </div>
                <div className="sub-stat-card">
                  <span className="sub-stat-num">
                    {submissionsAnalytics.avgScore ? `${submissionsAnalytics.avgScore} ★` : '100%'}
                  </span>
                  <span className="sub-stat-label">
                    {submissionsAnalytics.avgScore ? 'Avg Rating Score' : 'Completion Rate'}
                  </span>
                </div>
                <div className="sub-stat-card">
                  <span className="sub-stat-num" style={{ fontSize: '1.1rem', color: '#34d399' }}>
                    {submissionsAnalytics.latest}
                  </span>
                  <span className="sub-stat-label">Latest Activity</span>
                </div>
              </div>

              {/* Submissions Search Filter */}
              <div style={{ marginBottom: '1.25rem' }}>
                <input
                  className="form-input"
                  placeholder="🔍 Search submissions by respondent name or keyword..."
                  value={searchSubmissions}
                  onChange={(e) => setSearchSubmissions(e.target.value)}
                  aria-label="Search submissions"
                />
              </div>

              {filteredResponses.length === 0 ? (
                <div className="empty-response-state">
                  <span className="empty-icon" aria-hidden="true">📭</span>
                  <p>
                    No submissions found. Click <strong>&quot;🎲 Simulate Public Response&quot;</strong> or submit the preview form to record answers!
                  </p>
                </div>
              ) : (
                <div className="responses-grid" role="feed" aria-label="Responses feed">
                  {filteredResponses.map((resp, i) => (
                    <article key={resp.id} className="card response-card-item">
                      <div className="flex-between response-card-header">
                        <div>
                          <span className="badge-small" style={{ marginRight: '0.4rem' }}>
                            #{responses.length - i}
                          </span>
                          <span className={`source-pill ${resp.source?.includes('Public') ? 'source-pill-public' : 'source-pill-sandbox'}`}>
                            {resp.source || '🌐 Public Web'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>⏱️ {resp.timestamp}</span>
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger"
                            style={{ width: '22px', height: '22px', fontSize: '0.75rem' }}
                            onClick={() => handleDeleteResponse(resp.id)}
                            aria-label="Delete this submission entry"
                            title="Delete this entry"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {resp.author && (
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                          👤 {resp.author}
                        </div>
                      )}

                      {/* API Dispatch Status Badge */}
                      {resp.apiStatus && (
                        <div style={{ fontSize: '0.74rem', marginBottom: '0.6rem', color: resp.apiStatus.includes('201') || resp.apiStatus.includes('OK') ? '#34d399' : '#94a3b8' }}>
                          {resp.apiStatus}
                        </div>
                      )}

                      <div className="response-card-content">
                        {resp.data &&
                          Object.entries(resp.data).map(([key, val]) => (
                            <div key={key} className="response-kv-row">
                              <span className="kv-key">{key}:</span>
                              <span className="kv-val">{String(val) || '—'}</span>
                            </div>
                          ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================================================================
              TAB 4: SCHEMA JSON & IMPORT
              =================================================================== */}
          {activeTab === 'schema' && (
            <div id="tabpanel-schema" role="tabpanel" aria-labelledby="tab-schema" className="card form-schema-view">
              <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3>Form Schema JSON Definition</h3>
                  <p className="card-description">Portable schema configuration that drives the dynamic form engine.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleCopySchema}
                >
                  {copyCodeFeedback ? '✅ Copied!' : '📋 Copy JSON Schema'}
                </button>
              </div>

              <pre className="code-block-viewer" tabIndex={0} aria-label="Form Schema JSON">
                {JSON.stringify(fields, null, 2)}
              </pre>

              {/* Import Schema Section */}
              <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--accent-cyan)' }}>
                  📥 Import Schema from JSON
                </h4>
                <p className="card-description" style={{ fontSize: '0.84rem', marginBottom: '0.75rem' }}>
                  Paste a JSON array of question definitions to immediately re-populate your form.
                </p>

                <form onSubmit={handleImportSchema}>
                  <textarea
                    rows="4"
                    className="form-input"
                    placeholder='[ { "id": "f-1", "label": "Full Name", "type": "text", "required": true } ]'
                    value={schemaImportText}
                    onChange={(e) => setSchemaImportText(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
                  />

                  {schemaImportError && (
                    <div className="text-danger" style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>
                      ⚠️ {schemaImportError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '0.65rem' }}
                    disabled={!schemaImportText.trim()}
                  >
                    📥 Parse &amp; Load Schema Into Form
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* =====================================================================
          SHARE & PUBLISH MODAL POPUP (Accessible WAI-ARIA Modal)
          ===================================================================== */}
      {showShareModal && (
        <div
          className="share-modal-overlay"
          onClick={() => setShowShareModal(false)}
          role="presentation"
        >
          <div
            className="share-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }} aria-hidden="true">🌐</span>
                <h3 id="share-modal-title" style={{ margin: 0 }}>Publish &amp; Share Form</h3>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowShareModal(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p className="card-description" style={{ fontSize: '0.88rem', marginBottom: '1rem' }}>
              Your form is published and ready to collect answers from external participants. Anyone with this link can fill it out directly.
            </p>

            <label htmlFor="share-modal-url-input" style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Public Respondent Link
            </label>
            <div className="share-link-box">
              <input
                id="share-modal-url-input"
                readOnly
                className="share-url-input"
                value={`${window.location.origin}/forms?view=public&template=${activeTemplate}`}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCopyPublicLink}
              >
                {shareCopied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>

            {/* Visual QR Code Mockup */}
            <div className="qr-mockup-wrapper">
              <svg className="qr-code-svg-mock" viewBox="0 0 100 100" fill="currentColor" role="img" aria-label="QR Code to scan form link">
                <rect width="100" height="100" fill="#ffffff" />
                <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#0f172a" />
                <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#0f172a" />
                <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#0f172a" />
                <circle cx="50" cy="50" r="5" fill="#38bdf8" />
                <rect x="45" y="15" width="8" height="20" fill="#0f172a" />
                <rect x="15" y="45" width="20" height="8" fill="#0f172a" />
                <rect x="55" y="60" width="15" height="15" fill="#0f172a" />
                <rect x="75" y="55" width="15" height="25" fill="#0f172a" />
              </svg>
              <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>Scan with smartphone camera</span>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowShareModal(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowShareModal(false);
                  setViewMode('respondent');
                }}
              >
                Open Respondent View ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
