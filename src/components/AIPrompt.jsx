import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const AIPrompt = ({ onGenerate, loading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  return (
    <div className="ai-prompt-container">
      <form onSubmit={handleSubmit} className="premium-input-group">
        <div className="input-with-icon">
          <Sparkles className="input-icon text-primary" size={20} />
          <input 
            type="text" 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., 'Create a sales performance report' or 'Analyze my growth'..."
            className="premium-input"
            disabled={loading}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'Analyzing...' : 'Generate AI Report'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
};

export default AIPrompt;
