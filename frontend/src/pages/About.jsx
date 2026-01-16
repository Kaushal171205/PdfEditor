import React from 'react';
import { Link } from 'react-router-dom';
import styles from './About.module.css';

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Empowering Your Document Workflow</h1>
        <p className={styles.subtitle}>
          Standardize, secure, and simplify your PDF management with our cutting-edge tools.
          Designed for speed, built for professionals.
        </p>
      </div>

      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={styles.iconWrapper} style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </div>
          <h3 className={styles.featureTitle}>Advanced Editing</h3>
          <p className={styles.featureDesc}>
            Modify text, insert images, and rearrange pages without compromising the original layout.
            Our intelligent editor understands document structure.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.iconWrapper} style={{ background: '#f3e8ff', color: '#9333ea' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          </div>
          <h3 className={styles.featureTitle}>Format Conversion</h3>
          <p className={styles.featureDesc}>
            Seamlessly convert PDFs to editable Word documents and Excel spreadsheets.
            Maintain formatting, tables, and fonts with high fidelity.
          </p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.iconWrapper} style={{ background: '#ecfccb', color: '#65a30d' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <h3 className={styles.featureTitle}>Secure & Private</h3>
          <p className={styles.featureDesc}>
            Your documents never leave your browser for basic editing.
            We prioritize your data privacy with client-side processing technology.
          </p>
        </div>
      </div>

      <div className={styles.ctaSection}>
        <Link to="/" className={styles.ctaButton}>Get Started Now</Link>
      </div>
    </div>
  )
}

export default About;