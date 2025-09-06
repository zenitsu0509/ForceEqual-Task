'use client';

import { useState, useRef } from 'react';

interface FileUploadProps {
  onUploadSuccess: (filename: string) => void;
  apiKey: string;
}

export default function FileUpload({ onUploadSuccess, apiKey }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setSuccess(`PDF uploaded successfully! Processed ${result.chunks} chunks.`);
      onUploadSuccess(result.filename);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
        Upload PDF Document
      </h2>
      
      <div
        className="file-upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
          className="input-file"
        />
        
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
        <p style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>
          Click to select a PDF file or drag and drop
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Maximum file size: 10MB
        </p>
      </div>

      {isUploading && (
        <div className="loading" style={{ marginTop: '1rem' }}>
          <div className="spinner"></div>
          Processing PDF...
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </div>
  );
}
