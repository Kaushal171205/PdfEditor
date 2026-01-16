import React, { useState } from 'react';
import styles from './Convert.module.css';

const Convert = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  return (
    <div className={styles.convertContainer}>
      <h1 className={styles.title}>PDF to Word Converter</h1>
      <p className={styles.subtitle}>
        Transform your PDF documents into editable Word files instantly.
        Client-side conversion ensures your data never leaves your device.
      </p>

      <div className={styles.uploadCard}>
        <label
          className={styles.dropZone}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className={styles.uploadText}>
            {selectedFile ? 'Change File' : 'Click to Upload or Drag & Drop'}
          </span>
          <span className={styles.uploadSubtext}>Supported Format: PDF</span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
        </label>

        {selectedFile && (
          <div className={styles.fileInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg style={{ width: '24px', height: '24px', color: '#0369a1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className={styles.fileName}>{selectedFile.name}</span>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        <button
          className={styles.convertBtn}
          disabled={!selectedFile}
          onClick={() => alert(`Starting conversion for ${selectedFile.name}...`)}
        >
          Convert to Word
        </button>
      </div>
    </div>
  );
};

export default Convert;