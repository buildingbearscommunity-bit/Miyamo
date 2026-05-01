import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const ChartEditModal = ({ isOpen, onClose, config, onSave, columnMeta, itemType }) => {
  const [localConfig, setLocalConfig] = useState(null);

  useEffect(() => {
    if (config) {
      setLocalConfig({ ...config });
    }
  }, [config]);

  if (!isOpen || !localConfig) return null;

  const numericCols = columnMeta.filter(c => c.type === 'number');
  const allCols = columnMeta;

  const handleChange = (field, value) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const isChart = itemType === 'chart';
  const isMetric = itemType === 'metric';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-surface" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="visual-title">Edit {isChart ? 'Visualization' : 'Metric Card'}</h2>
          <button className="action-btn" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="modal-body">
          {isMetric && (
            <div className="form-field">
              <label className="field-label">Metric Name (Title)</label>
              <input 
                className="premium-input"
                value={localConfig.title}
                onChange={(e) => handleChange('title', e.target.value)}
              />
            </div>
          )}

          <div className="form-field">
            <label className="field-label">{isChart ? 'Metric (Y-Axis)' : 'Metric'}</label>
            <select 
              className="premium-select"
              value={localConfig.dataKey}
              onChange={(e) => handleChange('dataKey', e.target.value)}
            >
              {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {isChart && (
            <>
              <div className="form-field">
                <label className="field-label">Dimension (X-Axis)</label>
                <select 
                  className="premium-select"
                  value={localConfig.labelKey}
                  onChange={(e) => handleChange('labelKey', e.target.value)}
                >
                  {allCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="form-field flex-1">
                  <label className="field-label">Chart Type</label>
                  <select 
                    className="premium-select"
                    value={localConfig.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                  >
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    <option value="pie">Pie</option>
                    <option value="area">Area</option>
                  </select>
                </div>
                <div className="form-field flex-1">
                  <label className="field-label">Aggregation</label>
                  <select 
                    className="premium-select"
                    value={localConfig.aggMethod || 'sum'}
                    onChange={(e) => handleChange('aggMethod', e.target.value)}
                  >
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                 <div className="form-field flex-1">
                  <label className="field-label">Sort</label>
                  <select 
                    className="premium-select"
                    value={localConfig.sortDir || 'none'}
                    onChange={(e) => handleChange('sortDir', e.target.value)}
                  >
                    <option value="none">Default</option>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div className="form-field flex-1">
                  <label className="field-label">Filter</label>
                  <select 
                    className="premium-select"
                    value={localConfig.filterN || 'all'}
                    onChange={(e) => handleChange('filterN', e.target.value)}
                  >
                    <option value="all">All Items</option>
                    <option value="top5">Top 5</option>
                    <option value="top10">Top 10</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={localConfig.showLabels}
                    onChange={(e) => handleChange('showLabels', e.target.checked)}
                  />
                  <span className="field-label" style={{ marginBottom: 0 }}>Show Data Labels</span>
                </label>
              </div>
            </>
          )}

          {isMetric && (
             <div className="form-field">
              <label className="field-label">Aggregation</label>
              <select 
                className="premium-select"
                value={localConfig.aggMethod || 'sum'}
                onChange={(e) => handleChange('aggMethod', e.target.value)}
              >
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="count">Count</option>
              </select>
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-3 pt-4 border-t">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(localConfig)}>
            <Check size={14} /> Save Changes
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ChartEditModal;
