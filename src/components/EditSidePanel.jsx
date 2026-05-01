import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';

const EditSidePanel = ({ isOpen, onClose, item, onUpdate, columnMeta }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (item) {
      setConfig({ ...item.config });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onUpdate({ ...item, config: newConfig });
  };


  return (
    <div className={`editor-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings size={20} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Component Editor</h2>
        </div>
        <button className="icon-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Common Settings */}
        <div className="form-group">
          <label className="ctrl-label">Title</label>
          <input 
            type="text" 
            className="ctrl-select"
            style={{ width: '100%' }}
            value={config?.title || ''} 
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>

        {item.type === 'metric' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="ctrl-label">Value</label>
              <input 
                type="text" 
                className="ctrl-select"
                style={{ width: '100%' }}
                value={config?.value || ''} 
                onChange={(e) => handleChange('value', e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="ctrl-label">Trend</label>
              <select 
                className="ctrl-select"
                style={{ width: '100%' }}
                value={config?.trend || 'up'}
                onChange={(e) => handleChange('trend', e.target.value)}
              >
                <option value="up">Increasing (Up)</option>
                <option value="down">Decreasing (Down)</option>
                <option value="flat">Stable (Flat)</option>
              </select>
            </div>
          </>
        )}

        {item.type === 'chart' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="ctrl-label">Chart Type</label>
              <select 
                className="ctrl-select"
                style={{ width: '100%' }}
                value={config?.type || 'bar'}
                onChange={(e) => handleChange('type', e.target.value)}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
          </>
        )}

        {item.type === 'text' && (
          <div className="form-group">
            <label className="ctrl-label">Content</label>
            <textarea 
              className="ctrl-select"
              style={{ width: '100%', height: '8rem' }}
              value={config?.content || ''} 
              onChange={(e) => handleChange('content', e.target.value)}
            />
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button className="btn btn-lavender" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditSidePanel;
