import React from 'react';
import { Zap, Target, LayoutGrid, ShieldCheck, Rocket, Lock, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import './AboutUs.css';

export default function AboutUs({ onTryNow }) {
  return (
    <main className="about-page-container">
      {/* 1. Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="hero-badge">About Miyamo</div>
          <h1>Smarter, Faster Reporting — Built for You</h1>
          <p>Create professional reports in seconds without complexity, while keeping your data completely private and under your control.</p>
          <button className="btn-lavender hero-cta-btn" onClick={onTryNow}>
            Start Creating Free <ArrowRight size={18} className="cta-icon" />
          </button>
        </div>
        <div className="hero-visual-wrapper">
          <div className="hero-visual-glass">
            <div className="mock-report-header">
              <div className="mock-dot" style={{ backgroundColor: '#f87171' }}></div>
              <div className="mock-dot" style={{ backgroundColor: '#fbbf24' }}></div>
              <div className="mock-dot" style={{ backgroundColor: '#34d399' }}></div>
            </div>
            <img src="/hero-infographic.png" alt="Miyamo Reporting Flow" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      {/* 2. What We Do */}
      <section className="about-what-we-do">
        <div className="what-we-do-grid">
          <div className="what-we-do-text">
            <h2>Transforming Raw Data into Instant Clarity</h2>
            <p className="lead-text">Reporting shouldn’t take hours. Our platform transforms your data into clean, structured reports in seconds — so you can focus on insights, not formatting.</p>
            <ul className="benefits-list">
              <li><CheckCircle2 size={18} style={{ color: '#10b981' }} /> Convert CSV/tabular data into visual reports instantly.</li>
              <li><CheckCircle2 size={18} style={{ color: '#10b981' }} /> No manual formatting or repetitive spreadsheet work.</li>
              <li><CheckCircle2 size={18} style={{ color: '#10b981' }} /> Fully designed for speed, simplicity, and zero friction.</li>
            </ul>
          </div>
          <div className="what-we-do-visual">
            <div className="transformation-graphic">
              <div className="raw-data-box"><FileText size={32} /><span>Raw Data</span></div>
              <div className="arrow-box"><ArrowRight size={24} /></div>
              <div className="clean-report-box"><LayoutGrid size={32} /><span>Clean Report</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us */}
      <section className="about-why-choose-us">
        <h2>Why Choose Us</h2>
        <p className="section-subtitle">Everything you need, nothing you don't.</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feat-icon-box"><Zap size={24} /></div>
            <h3>Instant Generation</h3>
            <p>Go from raw data to a fully built dashboard in a fraction of a second.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon-box"><Target size={24} /></div>
            <h3>Simple & Intuitive</h3>
            <p>No steep learning curves. Drag, drop, and resize effortlessly.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon-box"><LayoutGrid size={24} /></div>
            <h3>Professional Output</h3>
            <p>Clean aesthetics that make you and your data look great.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon-box"><ShieldCheck size={24} /></div>
            <h3>100% Data Privacy</h3>
            <p>Everything stays on your machine. Zero server uploads.</p>
          </div>
          <div className="feature-card">
            <div className="feat-icon-box"><Rocket size={24} /></div>
            <h3>Built for Speed</h3>
            <p>Lightweight architecture that never bogs down your browser.</p>
          </div>
        </div>
      </section>

      {/* 4. Data Privacy & Trust */}
      <section className="about-privacy-trust">
        <div className="privacy-trust-container">
          <div className="privacy-icon-large"><Lock size={48} /></div>
          <h2>Uncompromising Privacy</h2>
          <p className="privacy-statement">
            This is your <strong>private workspace</strong>. Your data never leaves your control. We do not store, access, or track your information — ensuring complete privacy and peace of mind.
          </p>
          <div className="privacy-badges">
            <span className="privacy-badge">No hidden tracking</span>
            <span className="privacy-badge">No data storage</span>
            <span className="privacy-badge">No third-party access</span>
          </div>
        </div>
      </section>

      {/* 5. Who It's For & 6. Vision */}
      <section className="about-audience-vision">
        <div className="audience-vision-grid">
          <div className="vision-card">
            <h3>Our Vision</h3>
            <p>“To make reporting effortless, fast, and privacy-first for everyone.”</p>
            <div className="trust-statements">
              <div><ShieldCheck size={16}/> Built with simplicity and performance in mind.</div>
              <div><ShieldCheck size={16}/> Designed for real-world workflows.</div>
              <div><ShieldCheck size={16}/> Focused on privacy-first architecture.</div>
            </div>
          </div>
          <div className="audience-card">
            <h3>Who It's For</h3>
            <p>Whether you're a professional, a growing team, or a business handling data at scale, this platform is designed to simplify your reporting workflow.</p>
            <div className="audience-tags">
              <span>Professionals</span>
              <span>Marketing Teams</span>
              <span>Businesses</span>
              <span>Students</span>
              <span>Data Analysts</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Call to Action */}
      <section className="about-cta-section">
        <div className="cta-content">
          <h2>Ready to transform your workflow?</h2>
          <p>Stop wasting hours on manual formatting. Start creating reports instantly.</p>
          <button className="btn-lavender btn-large" onClick={onTryNow}>
            Try Miyamo Now
          </button>
        </div>
      </section>
    </main>
  );
}
