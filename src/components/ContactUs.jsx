import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Clock, ShieldCheck, ChevronDown, ChevronUp, Star } from 'lucide-react';
import './ContactUs.css';

const FAQS = [
  {
    question: "Do you store my data?",
    answer: "No. Miyamo processes everything locally in your browser. Your data never leaves your device and is not uploaded to any server."
  },
  {
    question: "How long does it take to get a response?",
    answer: "We aim to respond to all inquiries within 24 hours during normal business days."
  },
  {
    question: "Can I use Miyamo for commercial purposes?",
    answer: "Yes, you can use Miyamo to generate reports for commercial purposes. There are no restrictions on the generated outputs."
  }
];

export default function ContactUs() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;
    setIsSubmitting(true);
    
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSexlYS1aC2Ev1Qyacyy2muHA42MRTWxBD-irukoheHxQza4dQ/formResponse";
    const formData = new FormData();
    formData.append("entry.1103747824", rating);
    formData.append("entry.710481527", comment);

    try {
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });
      setSubmitted(true);
      setRating(0);
      setComment('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Feedback failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="contact-page-container">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Get in Touch</h1>
          <p>Have questions, feedback, or need help? We’re here to assist you.</p>
        </div>
      </section>

      {/* Main Split Content */}
      <section className="contact-main-section">
        <div className="contact-card-premium">
          <div className="contact-split-layout">
            
            {/* Left Side: Info */}
            <div className="contact-info-side">
              <div className="contact-icon-badge">
                <MessageSquare size={28} />
              </div>
              <h2>Contact Information</h2>
              <p className="contact-intro">Reach out to us directly through the following channels. We're always happy to help.</p>
              
              <div className="contact-methods">
                <a href="mailto:buildingbearscommunity@gmail.com" className="contact-method-card">
                  <div className="method-icon"><Mail size={24} /></div>
                  <div className="method-text">
                    <span className="method-label">Email Support</span>
                    <span className="method-value">buildingbearscommunity@gmail.com</span>
                  </div>
                </a>
                
                <a href="https://www.instagram.com/miyamo.app" target="_blank" rel="noopener noreferrer" className="contact-method-card">
                  <div className="method-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </div>
                  <div className="method-text">
                    <span className="method-label">Instagram</span>
                    <span className="method-value">@miyamo.app</span>
                  </div>
                </a>
              </div>

              <div className="contact-trust-indicators">
                <div className="trust-item">
                  <Clock size={18} /> <span>We typically respond within 24 hours</span>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="contact-form-side">
              {submitted ? (
                <div className="contact-success">
                  <div className="success-icon-large">✨</div>
                  <h3>Feedback Submitted!</h3>
                  <p>Thanks for sharing your experience. We appreciate it.</p>
                </div>
              ) : (
                <>
                  <div className="form-header text-center">
                    <h3>Share Your Feedback</h3>
                    <p className="text-muted" style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>Help us improve Miyamo</p>
                  </div>
                  
                  <div className="feedback-stars-large">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        className="star-btn-large"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star 
                          size={44} 
                          fill={(hoverRating || rating) >= star ? '#c084fc' : 'none'} 
                          stroke={(hoverRating || rating) >= star ? '#c084fc' : '#cbd5e1'}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="feedback-textarea-container">
                    <textarea 
                      className="feedback-textarea-large"
                      placeholder="Share your experience..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <button 
                    onClick={handleSubmit} 
                    className="btn-lavender btn-submit-contact" 
                    disabled={isSubmitting || rating === 0 || !comment.trim()}
                    style={{ marginTop: '1.5rem', width: '100%' }}
                  >
                    {isSubmitting ? 'Submitting...' : <><Send size={18} /> Submit Feedback</>}
                  </button>

                  <div className="form-privacy-note" style={{ marginTop: '1.5rem' }}>
                    <ShieldCheck size={14} />
                    <span>We never store or access your report data.</span>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${openFaqIndex === i ? 'open' : ''}`} onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}>
              <div className="faq-question">
                <h4>{faq.question}</h4>
                {openFaqIndex === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {openFaqIndex === i && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
