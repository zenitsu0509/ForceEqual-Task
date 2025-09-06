'use client';

import { useState } from 'react';

interface QAProps {
  apiKey: string;
  uploadedFiles: string[];
}

interface Source {
  filename: string;
  chunkIndex: number;
  content: string;
}

interface QAResponse {
  answer: string;
  sources: Source[];
  context?: string;
}

export default function QASection({ apiKey, uploadedFiles }: QAProps) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<QAResponse | null>(null);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError('');
    setResponse(null);

    try {
      const requestBody: any = { question };
      if (selectedFile) {
        requestBody.filename = selectedFile;
      }

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get answer');
      }

      const result = await response.json();
      setResponse(result);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setIsLoading(false);
    }
  };

  if (uploadedFiles.length === 0) {
    return (
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          Ask Questions
        </h2>
        <p style={{ color: '#6b7280' }}>
          Please upload a PDF document first to start asking questions.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
        Ask Questions About Your Documents
      </h2>

      <form onSubmit={handleSubmit}>
        {uploadedFiles.length > 1 && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Select Document (optional - leave empty to search all):
            </label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
              }}
            >
              <option value="">All documents</option>
              {uploadedFiles.map((filename) => (
                <option key={filename} value={filename}>
                  {filename}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Your Question:
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask any question about the uploaded PDF content..."
            className="textarea"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="btn btn-primary"
        >
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              Getting Answer...
            </div>
          ) : (
            'Ask Question'
          )}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {response && (
        <div className="answer-box">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Answer:
          </h3>
          <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {response.answer}
          </p>

          {response.sources && response.sources.length > 0 && (
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Sources:
              </h4>
              {response.sources.map((source, index) => (
                <div key={index} className="source-item">
                  <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                    {source.filename} (Chunk {source.chunkIndex + 1})
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    {source.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
