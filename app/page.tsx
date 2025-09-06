'use client';

import { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import QASection from '../components/QASection';

export default function Home() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);

  useEffect(() => {
    // Try to get API key from localStorage
    const savedApiKey = localStorage.getItem('pdf-qa-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setShowApiKeyInput(false);
    }
  }, []);

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      localStorage.setItem('pdf-qa-api-key', apiKey);
      setShowApiKeyInput(false);
    }
  };

  const handleUploadSuccess = (filename: string) => {
    setUploadedFiles(prev => [...prev, filename]);
  };

  const resetApiKey = () => {
    localStorage.removeItem('pdf-qa-api-key');
    setApiKey('');
    setShowApiKeyInput(true);
  };

  if (showApiKeyInput) {
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem', textAlign: 'center' }}>
            PDF Q&A App
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem', textAlign: 'center' }}>
            Enter your API key to access the application
          </p>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
              }}
            />
          </div>
          
          <button
            onClick={handleApiKeySubmit}
            disabled={!apiKey.trim()}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Access Application
          </button>
          
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '6px' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              <strong>Note:</strong> You need a valid API key to access the protected routes. 
              In a production environment, this would be handled through proper authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          PDF Q&A Application
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Upload PDF documents and ask questions about their content using AI
        </p>
        <button
          onClick={resetApiKey}
          className="btn btn-secondary"
          style={{ marginTop: '1rem' }}
        >
          Change API Key
        </button>
      </header>

      <FileUpload onUploadSuccess={handleUploadSuccess} apiKey={apiKey} />

      {uploadedFiles.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Uploaded Documents
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {uploadedFiles.map((filename, index) => (
              <li
                key={index}
                style={{
                  padding: '0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>📄</span>
                <span style={{ fontWeight: '500' }}>{filename}</span>
                <span style={{ marginLeft: 'auto', color: '#059669', fontSize: '0.875rem' }}>
                  ✓ Ready for questions
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <QASection apiKey={apiKey} uploadedFiles={uploadedFiles} />

      <footer style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', color: '#6b7280' }}>
        <p>
          Built with Next.js, OpenAI API, and PDF processing capabilities.
        </p>
      </footer>
    </div>
  );
}
