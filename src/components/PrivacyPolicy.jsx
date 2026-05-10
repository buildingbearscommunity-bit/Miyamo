import React from 'react';
import { Shield, Lock, Eye, Database, Cookie, AlertTriangle, ShieldCheck } from 'lucide-react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <main className="privacy-page-container">
      {/* 1. Hero Section */}
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <div className="hero-badge">
            <Shield size={16} /> Privacy Policy
          </div>
          <h1>Your privacy and data security are our top priorities.</h1>
          <p>
            We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our platform.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="privacy-content-section">
        <div className="privacy-card-premium">
          
          {/* 3. Data Collection */}
          <div className="privacy-section">
            <div className="section-icon-wrap"><Database size={24} /></div>
            <div className="section-text">
              <h2>Data Collection & Processing</h2>
              <p>
                Our platform is designed as a <strong>private workspace</strong>. Any data you use to generate reports is processed locally in your browser. 
              </p>
              <ul>
                <li>We do <strong>NOT</strong> store, save, or retain your CSV files or report data.</li>
                <li>We do <strong>NOT</strong> access or monitor your generated content.</li>
                <li>Your data stays strictly within your control.</li>
              </ul>
            </div>
          </div>

          <div className="privacy-divider"></div>

          {/* 4. Personal Information */}
          <div className="privacy-section">
            <div className="section-icon-wrap"><Eye size={24} /></div>
            <div className="section-text">
              <h2>Personal Information</h2>
              <p>
                We only collect minimal information when absolutely necessary. We only collect personal information that you voluntarily provide to us, such as your email address when contacting us for support or sharing feedback. We believe in no unnecessary data collection.
              </p>
            </div>
          </div>

          <div className="privacy-divider"></div>

          {/* 5. Cookies & Tracking & 6. Third-Party Services */}
          <div className="privacy-section">
            <div className="section-icon-wrap"><Cookie size={24} /></div>
            <div className="section-text">
              <h2>Cookies & Third-Party Advertising</h2>
              <p>
                To keep our service free and operational, we may use cookies or similar technologies to improve user experience, support analytics, and utilize advertising services such as <strong>Google Ads</strong>.
              </p>
              <ul>
                <li>Third-party services like Google Ads may use cookies to serve you relevant advertisements based on your visit.</li>
                <li>We do not control the data usage of these third-party services.</li>
                <li>You maintain full control over cookies and can restrict or disable them via your browser settings. We encourage you to review their respective privacy policies.</li>
              </ul>
            </div>
          </div>

          <div className="privacy-divider"></div>

          {/* 7. Data Security */}
          <div className="privacy-section">
            <div className="section-icon-wrap"><Lock size={24} /></div>
            <div className="section-text">
              <h2>Data Security</h2>
              <p>
                We implement robust technical measures to ensure your data remains secure. Because we do not store your working data on our servers, the risk of data exposure is inherently minimized. All data processing occurs locally within your own secure browser environment.
              </p>
            </div>
          </div>

          <div className="privacy-divider"></div>

          {/* 8. Your Control & Rights */}
          <div className="privacy-section">
            <div className="section-icon-wrap"><ShieldCheck size={24} /></div>
            <div className="section-text">
              <h2>Your Rights & Control</h2>
              <p>
                You remain in full control of your data at all times. Since we do not retain or store your reporting data, there is no retention risk. You can use our platform with complete confidence.
              </p>
            </div>
          </div>

          <div className="privacy-divider"></div>

          {/* 9. Changes to Policy & 10. Contact */}
          <div className="privacy-section">
            <div className="section-icon-wrap"><AlertTriangle size={24} /></div>
            <div className="section-text">
              <h2>Changes & Contact Information</h2>
              <p>
                We may update this Privacy Policy when necessary to reflect changes in our practices or legal requirements. Updates will always be reflected on this page.
              </p>
              <div className="contact-box">
                <p><strong>Questions about your privacy?</strong></p>
                <p>Email: <a href="mailto:buildingbearscommunity@gmail.com">buildingbearscommunity@gmail.com</a></p>
                <p>Instagram: <a href="https://www.instagram.com/miyamo.app" target="_blank" rel="noopener noreferrer">@miyamo.app</a></p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
