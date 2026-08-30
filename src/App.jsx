import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import ResumeBuilder from './components/ResumeBuilder';
import Portfolio from './components/Portfolio';
import FormBuilder from './components/FormBuilder';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-layout">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container main-workspace">
        {/* Workspace Quick Header Bar for Modules */}
        {activeTab !== 'home' && (
          <div className="workspace-banner no-print">
            <div className="banner-left">
              <button className="btn btn-sm btn-outline" onClick={() => setActiveTab('home')} style={{ marginBottom: '0.5rem' }}>
                ← Back to Home
              </button>
              <h1 className="banner-title">
                {activeTab === 'resume' && '📄 Draft & Export Professional Resume'}
                {activeTab === 'portfolio' && '💼 Interactive Developer Portfolio'}
                {activeTab === 'forms' && '📋 Dynamic Form Builder & Responses'}
              </h1>
            </div>
            <div className="banner-status">
              <span className="status-dot"></span> All Systems Operational
            </div>
          </div>
        )}

        {/* Dynamic View Switching */}
        {activeTab === 'home' && <Home setActiveTab={setActiveTab} />}
        {activeTab === 'resume' && <ResumeBuilder />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'forms' && <FormBuilder />}
      </main>

      <footer className="footer no-print">
        <p>DevStudio — In-browser unified branding and developer suite • Built with React &amp; JSX</p>
      </footer>
    </div>
  );
}
