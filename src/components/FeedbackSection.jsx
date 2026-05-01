import React, { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, Send, Check, TrendingUp } from 'lucide-react';

const FeedbackSection = ({ editingItemTitle }) => {
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [history, setHistory] = useState([]);

  // Load history from localStorage
  const loadHistory = () => {
    const data = JSON.parse(localStorage.getItem('quickinsights_feedback') || '[]');
    setHistory(data);
  };

  useEffect(() => {
    loadHistory();
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, []);

  const handleFeedbackSubmit = () => {
    if (feedback.rating === 0 || !feedback.comment.trim()) return;

    // 1. Save to Local Storage
    const existingFeedback = JSON.parse(localStorage.getItem('quickinsights_feedback') || '[]');
    const newEntry = {
      itemTitle: editingItemTitle || 'General',
      ...feedback,
      timestamp: new Date().toISOString()
    };
    existingFeedback.push(newEntry);
    localStorage.setItem('quickinsights_feedback', JSON.stringify(existingFeedback));
    
    // 2. Update local state
    setHistory(existingFeedback);
    setSubmitted(true);
    setFeedback({ rating: 0, comment: '' });

    // 3. Reset success message after 3 seconds
    setTimeout(() => setSubmitted(false), 3000);
  };

  // Compute Stats
  const stats = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    history.forEach(f => {
      if (counts[f.rating] !== undefined) counts[f.rating]++;
    });
    return counts;
  }, [history]);

  // Filter and Sort Best Comments (4-5 stars)
  const bestComments = useMemo(() => {
    return history
      .filter(f => f.rating >= 4 && f.comment.trim().length > 0)
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
  }, [history]);

  return (
    <section className="card-premium feedback-container-card">
      <div className="section-header-row">
        <div className="section-label-premium">
          <MessageSquare size={12} /> Share Your Feedback
        </div>
      </div>
      
      {submitted ? (
        <div className="feedback-status-msg success">
          <Check size={16} /> Feedback submitted successfully
        </div>
      ) : (
        <div className="feedback-form">
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="star-btn"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
              >
                <Star 
                  size={20} 
                  fill={(hoverRating || feedback.rating) >= star ? 'var(--warning)' : 'none'} 
                  stroke={(hoverRating || feedback.rating) >= star ? 'var(--warning)' : 'var(--text-dim)'}
                />
              </button>
            ))}
            <span className="rating-text">
              {feedback.rating ? `${feedback.rating}/5 Stars` : 'Rate experience'}
            </span>
          </div>
          
          <textarea
            className="premium-input-field feedback-textarea"
            placeholder="Any suggestions or comments?"
            value={feedback.comment}
            onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
          />
          
          <button 
            className="btn-feedback-submit"
            disabled={feedback.rating === 0 || !feedback.comment.trim()}
            onClick={handleFeedbackSubmit}
          >
            <Send size={12} /> Submit Feedback
          </button>
        </div>
      )}

      {/* ── Rating Summary Distribution ── */}
      <div className="rating-distribution-row">
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="rating-badge">
            <span className="badge-star">⭐ {star}</span>
            <span className="badge-count">{stats[star] || 0}</span>
          </div>
        ))}
      </div>

      {/* ── Best Comments Section ── */}
      {bestComments.length > 0 && (
        <div className="top-feedback-section">
          <div className="section-label-mini">
            <TrendingUp size={10} /> Top Feedback
          </div>
          <div className="feedback-scroll-list">
            {bestComments.map((c, i) => (
              <div key={i} className="feedback-comment-card">
                <div className="comment-meta">
                  <div className="comment-stars">
                    {[...Array(5)].map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={8} 
                        fill={idx < c.rating ? 'var(--warning)' : 'none'} 
                        stroke={idx < c.rating ? 'var(--warning)' : 'var(--text-muted)'} 
                      />
                    ))}
                  </div>
                  <span className="comment-date">{new Date(c.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="comment-text">{c.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .feedback-container-card {
          margin-top: 1.5rem;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          box-shadow: var(--shadow);
        }
        .rating-stars {
          display: flex; gap: 6px; margin-bottom: 1rem; align-items: center;
        }
        .star-btn {
          background: none; border: none; padding: 0; cursor: pointer; transition: transform 0.15s;
        }
        .star-btn:hover { transform: scale(1.15); }
        .rating-text {
          font-size: 0.65rem; color: var(--text-dim); margin-left: 8px; font-weight: 700;
        }
        .feedback-textarea {
          min-height: 80px; font-size: 0.75rem; resize: none; margin-bottom: 0.75rem; line-height: 1.4;
        }
        .btn-feedback-submit {
          width: 100%; background: var(--primary-gradient); color: #fff; border: none;
          padding: 0.75rem; border-radius: 10px; font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
          cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2);
        }
        .btn-feedback-submit:hover:not(:disabled) {
          transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.25);
        }
        .btn-feedback-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .btn-feedback-submit:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(1); }
        
        .feedback-status-msg {
          font-size: 0.72rem; font-weight: 600; padding: 0.85rem; border-radius: 10px;
          display: flex; align-items: center; gap: 0.6rem; border: 1px solid transparent;
          animation: slideIn 0.3s ease-out;
        }
        .feedback-status-msg.success {
          background: #f0fdf4; color: #16a34a; border-color: #dcfce7;
        }

        /* ── Summary Distribution ── */
        .rating-distribution-row {
          display: flex; justify-content: space-between; margin-top: 1.25rem;
          padding-top: 1rem; border-top: 1px solid #f1f5f9; gap: 4px;
        }
        .rating-badge {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          padding: 0.4rem 0.25rem; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9;
        }
        .badge-star { font-size: 0.6rem; font-weight: 800; color: var(--text-dim); margin-bottom: 2px; }
        .badge-count { font-size: 0.65rem; font-weight: 800; color: var(--text-main); }

        /* ── Top Feedback Section ── */
        .top-feedback-section { margin-top: 1.25rem; }
        .section-label-mini {
          font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
          color: var(--text-muted); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 4px;
        }
        .feedback-scroll-list {
          max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 4px;
        }
        .feedback-scroll-list::-webkit-scrollbar { width: 4px; }
        .feedback-scroll-list::-webkit-scrollbar-track { background: transparent; }
        .feedback-scroll-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }

        .feedback-comment-card {
          padding: 0.75rem; background: #fff; border: 1px solid #f1f5f9; border-radius: 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: transform 0.2s;
        }
        .feedback-comment-card:hover { transform: translateX(2px); border-color: var(--primary); }
        .comment-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
        .comment-stars { display: flex; gap: 1px; }
        .comment-date { font-size: 0.55rem; color: var(--text-muted); font-weight: 600; }
        .comment-text { font-size: 0.72rem; color: var(--text-main); line-height: 1.4; font-weight: 500; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default FeedbackSection;
