import React, { useState, useEffect } from 'react';
import { X, Check, Settings2, Trash2, ChevronUp, ChevronDown, Database, Layout, Type, Layers, BarChart2, Table, Eye } from 'lucide-react';

const SidebarEditor = ({ editingItem, onSave, onCancel, onDelete, columnMeta, headers }) => {
  const [localConfig, setLocalConfig] = useState(null);

  useEffect(() => {
    if (editingItem && editingItem.config) {
      const cfg = { ...editingItem.config };
      if (cfg.type === 'table' && !cfg.tableColumns) {
        const label = cfg.labelKey || 'name';
        const key = cfg.dataKey || 'value';
        cfg.tableColumns = label === key ? [label] : [label, key];
      }
      setLocalConfig(cfg);
    } else {
      setLocalConfig(null);
    }
  }, [editingItem]);

  // Render placeholder when not editing
  if (!editingItem || !localConfig) {
    return (
      <section className="card-premium placeholder-editor-card">
        <div className="section-header-row">
          <div className="section-label-premium">
            <Settings2 size={12} /> Edit Visualization
          </div>
        </div>
        <div className="placeholder-note-content">
          <div className="placeholder-icon-ring">
            <Settings2 size={24} className="opacity-40" />
          </div>
          <p className="placeholder-main-text">No visual selected</p>
          <p className="placeholder-sub-text">Select a report element to customize its appearance and data here.</p>
        </div>
        <style jsx>{`
          .placeholder-editor-card {
            border: 1px dashed var(--border);
            background: #fafbfc;
            transition: all 0.3s ease;
          }
          .placeholder-note-content {
            padding: 2.5rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .placeholder-icon-ring {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #fff;
            border: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.25rem;
            color: var(--primary);
            box-shadow: var(--shadow);
          }
          .placeholder-main-text {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
          }
          .placeholder-sub-text {
            font-size: 0.72rem;
            color: var(--text-dim);
            line-height: 1.5;
            max-width: 200px;
          }
        `}</style>
      </section>
    );
  }

  const itemType = editingItem?.type || 'metric';
  const isChart = itemType === 'chart';
  const isMetric = itemType === 'metric';
  const isTable = isChart && localConfig.type === 'table';
  const numericCols = Array.isArray(columnMeta) ? columnMeta.filter(c => c && c.type === 'number') : [];
  const allCols = Array.isArray(columnMeta) ? columnMeta : [];
  const allHeaders = headers || allCols.map(c => c.name);

  const handleChange = (field, value) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const tableColumns = localConfig.tableColumns || [];
  const addTableColumn = (colName) => {
    if (!tableColumns.includes(colName)) {
      handleChange('tableColumns', [...tableColumns, colName]);
    }
  };

  const removeTableColumn = (colName) => {
    handleChange('tableColumns', tableColumns.filter(c => c !== colName));
  };

  const moveColumn = (idx, dir) => {
    const cols = [...tableColumns];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= cols.length) return;
    [cols[idx], cols[newIdx]] = [cols[newIdx], cols[idx]];
    handleChange('tableColumns', cols);
  };

  const getColType = (colName) => {
    const found = allCols.find(c => c.name === colName);
    return found?.type || 'text';
  };

  const availableColumns = allHeaders.filter(h => !tableColumns.includes(h));

  return (
    <section className="card-premium sidebar-editor-active editing-card-expand">
      <div className="section-header-row">
        <div className="section-label-premium">
          <Settings2 size={12} /> Edit Visualization
        </div>
        <button className="delete-action-btn" onClick={() => onDelete(editingItem.id)} title="Remove Item">
          <Trash2 size={14} />
        </button>
      </div>

      <div className="editor-form-grid">
        {isMetric && (
          <>
            <div className="editor-field full-width">
              <label className="editor-label"><Type size={12} /> Display Title</label>
              <input 
                className="premium-input-field"
                value={localConfig.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g. Total Revenue"
              />
            </div>

            <div className="editor-field full-width">
              <label className="editor-label"><Database size={12} /> Metric Source</label>
              <select 
                className="premium-select-field"
                value={localConfig.dataKey || ''}
                onChange={(e) => handleChange('dataKey', e.target.value)}
              >
                {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="editor-field full-width">
              <label className="editor-label"><Layers size={12} /> Aggregation</label>
              <select 
                className="premium-select-field" 
                value={localConfig.aggMethod || 'sum'} 
                onChange={(e) => handleChange('aggMethod', e.target.value)}
              >
                <option value="sum">Sum</option>
                <option value="avg">Average</option>
                <option value="count">Count</option>
                <option value="min">Min</option>
                <option value="max">Max</option>
                <option value="custom">Formula</option>
              </select>
            </div>

            {localConfig.aggMethod === 'custom' && (
              <div className="editor-field full-width">
                <label className="editor-label">Custom Formula</label>
                <input 
                  type="text" 
                  className="premium-input-field" 
                  value={localConfig.customFormula || ''}
                  onChange={(e) => handleChange('customFormula', e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                  placeholder="e.g. SUM(Revenue) / COUNT(Product)"
                />
              </div>
            )}
          </>
        )}



        {isChart && !isTable && (
          <>
            <div className="editor-field full-width">
              <label className="editor-label"><Layout size={12} /> Dimension (X-Axis)</label>
              <select 
                className="premium-select-field"
                value={localConfig.labelKey}
                onChange={(e) => handleChange('labelKey', e.target.value)}
              >
                {allCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="editor-row-split">
              <div className="editor-field">
                <label className="editor-label"><BarChart2 size={12} /> Chart Type</label>
                <select className="premium-select-field" value={localConfig.type} onChange={(e) => handleChange('type', e.target.value)}>
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="pie">Pie</option>
                  <option value="area">Area</option>
                  <option value="table">Table</option>
                </select>
              </div>
              <div className="editor-field">
                <label className="editor-label"><Layers size={12} /> Aggregation</label>
                <select className="premium-select-field" value={localConfig.aggMethod || 'sum'} onChange={(e) => handleChange('aggMethod', e.target.value)}>
                  <option value="sum">Sum</option>
                  <option value="avg">Average</option>
                  <option value="count">Count</option>
                  <option value="min">Min</option>
                  <option value="max">Max</option>
                  <option value="custom">Formula</option>
                </select>
              </div>
            </div>

            {localConfig.aggMethod === 'custom' && (
              <div className="editor-field full-width">
                <label className="editor-label">Custom Formula</label>
                <input 
                  type="text" 
                  className="premium-input-field" 
                  value={localConfig.customFormula || ''}
                  onChange={(e) => handleChange('customFormula', e.target.value)}
                  style={{ fontFamily: 'monospace' }}
                  placeholder="e.g. SUM(Revenue) / COUNT(Product)"
                />
              </div>
            )}

            <div className="editor-field full-width">
              <label className="editor-label"><Eye size={12} /> Visibility Options</label>
              <div className="editor-checkbox-row split" style={{ marginTop: '0.25rem' }}>
                <label className="checkbox-container">
                  <input type="checkbox" checked={localConfig.showLabels} onChange={(e) => handleChange('showLabels', e.target.checked)} />
                  <span className="checkbox-label">Labels</span>
                </label>
                <label className="checkbox-container">
                  <input type="checkbox" checked={localConfig.showLegend} onChange={(e) => handleChange('showLegend', e.target.checked)} />
                  <span className="checkbox-label">Legend</span>
                </label>
              </div>
            </div>
          </>
        )}

        {isTable && (
          <>
            <div className="editor-field full-width" style={{ marginBottom: '0.5rem' }}>
              <label className="editor-label"><Table size={12} /> Visible Columns</label>
              <div className="table-col-list">
                {tableColumns.map((col, idx) => (
                  <div key={col} className="table-col-item">
                    <span className="table-col-name">{col}</span>
                    <div className="flex gap-1">
                      <button className="icon-btn-tiny" onClick={() => moveColumn(idx, -1)} disabled={idx === 0} title="Move Up"><ChevronUp size={10} /></button>
                      <button className="icon-btn-tiny" onClick={() => moveColumn(idx, 1)} disabled={idx === tableColumns.length - 1} title="Move Down"><ChevronDown size={10} /></button>
                      <button className="icon-btn-tiny text-danger" onClick={() => removeTableColumn(col)} title="Remove"><X size={10} /></button>
                    </div>
                  </div>
                ))}
              </div>
              {availableColumns.length > 0 && (
                <select className="premium-select-field" style={{ marginTop: '0.5rem' }} value="" onChange={(e) => addTableColumn(e.target.value)}>
                  <option value="">+ Add Column</option>
                  {availableColumns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </>
        )}
      </div>

      <div className="editor-footer-actions">
        <button className="btn-secondary-sidebar" onClick={onCancel}>Cancel</button>
        <button className="btn-primary-sidebar" onClick={() => onSave(localConfig)}>
          <Check size={14} /> Save Changes
        </button>
      </div>

      <style jsx>{`
        .editing-card-expand {
          animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          border-left: 4px solid var(--primary);
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .icon-btn-tiny {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px;
          cursor: pointer; color: var(--text-dim); transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .icon-btn-tiny:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); transform: scale(1.1); }
        .icon-btn-tiny:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </section>
  );
};

export default SidebarEditor;
