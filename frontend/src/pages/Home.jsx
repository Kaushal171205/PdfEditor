import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [pdfFile, setPdfFile] = useState(null)
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      // Show modal instead of navigating immediately
    } else {
      alert('Please upload a valid PDF file')
    }
  }

  // Handle drag & drop
  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]

    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
    } else {
      alert('Only PDF files are allowed')
    }
  }

  const handleEditorChoice = (type) => {
    if (!pdfFile) return;

    if (type === 'visual') {
      navigate('/editor', { state: { pdfFile } });
    } else {
      navigate('/code-editor', { state: { pdfFile } });
    }
  };

  return (
    <section className={styles.home}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <h1 className={styles.title}>
          Edit PDFs <span>like code</span>
        </h1>

        <p className={styles.subtitle}>
          A modern PDF editor that lets you edit text, images, and structure
          with developer-level precision — fast, clean, and intuitive.
        </p>

        {/* Upload Box */}
        <div
          className={styles.uploadBox}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <p className={styles.uploadTitle}>Drop your PDF here</p>
          <span className={styles.uploadSub}>
            or click to browse your files
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={handleFileChange}
          />
        </div>

        {/* Editor Choice Modal */}
        {pdfFile && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Choose Editor Mode</h3>
              <p>How would you like to edit <strong>{pdfFile.name}</strong>?</p>

              <div className={styles.modalActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => handleEditorChoice('visual')}
                >
                  Visual Editor
                  <span>Drag & Drop, WYSIWYG</span>
                </button>

                <button
                  className={styles.secondaryBtn}
                  onClick={() => handleEditorChoice('code')}
                >
                  Code Editor
                  <span>Edit markup directly</span>
                </button>
              </div>

              <button
                className={styles.cancelBtn}
                onClick={() => setPdfFile(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <Link to="/editor" className={styles.secondaryBtn}>
            Try Demo
          </Link>

          <Link to="/about" className={styles.secondaryBtn}>
            Learn More
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.features}>
        <Feature
          title="Editable Text & Media"
          description="Modify text, fonts, images, videos, and GIFs directly inside PDFs."
        />

        <Feature
          title="PDF ↔ Excel Conversion"
          description="Convert documents without breaking layouts or data integrity."
        />

        <Feature
          title="One-Click Formatter"
          description="Clean, align, and structure documents instantly — like a code formatter."
        />

        <Feature
          title="Privacy-Focused"
          description="Your files stay secure. No unnecessary cloud storage or tracking."
        />
      </div>
    </section>
  )
}

/* Feature Card Component */
function Feature({ title, description }) {
  return (
    <div className={styles.featureCard}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}
