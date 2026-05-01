import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { buildManualChartData } from '../utils/dataAnalysis';

const CHART_TYPES = [
  { value: 'bar',   label: 'Bar',   icon: '📊' },
  { value: 'line',  label: 'Line',  icon: '📈' },
  { value: 'pie',   label: 'Pie',   icon: '🥧' },
  { value: 'area',  label: 'Area',  icon: '🌊' },
  { value: 'table', label: 'Table', icon: '📋' },
];

export default function AddVisualModal({ isOpen, onClose, onAdd, columnMeta, rows, headers }) {
  const [chartType, setChartType] = useState('bar');
  const [dimension, setDimension] = useState('');
  const [measure,   setMeasure]   = useState('');
  const [aggMethod,     setAggMethod]     = useState('sum');
  const [customFormula, setCustomFormula] = useState('');
  const [filterN,       setFilterN]       = useState('all');
  const [title,     setTitle]     = useState('');
  const [tableColumns, setTableColumns] = useState([]);

  const numericCols = (columnMeta || []).filter(c => c.type === 'number');
  const allCols     = columnMeta || [];
  const allHeaders  = headers || allCols.map(c => c.name);

  React.useEffect(() => {
    if (isOpen) {
      setDimension(allCols.find(c => c.type !== 'number')?.name || allCols[0]?.name || '');
      setMeasure(numericCols[0]?.name || '');
      setTitle(''); setChartType('bar'); setAggMethod('sum'); setCustomFormula(''); setFilterN('all');
      setTableColumns([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleTableColumn = (colName) => {
    setTableColumns(prev => 
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const handleAdd = () => {
    if (chartType === 'table') {
      // Multi-column table
      const cols = tableColumns.length > 0 ? tableColumns : allHeaders.slice(0, 4);
      let tableData = rows.map(r => {
        const obj = {};
        cols.forEach(col => { obj[col] = r[col] ?? ''; });
        return obj;
      });
      if (filterN === 'top5') tableData = tableData.slice(0, 5);
      else if (filterN === 'top10') tableData = tableData.slice(0, 10);

      onAdd({
        id: `chart-custom-${Date.now()}`,
        type: 'chart',
        config: {
          type: 'table',
          title: title || 'Data Table',
          tableColumns: cols,
          labelKey: cols[0], dataKey: cols[1] || cols[0],
          aggMethod, filterN,
          data: tableData,
        },
      });
      onClose();
      return;
    }

    if (!dimension || !measure) return;
    onAdd({
      id: `chart-custom-${Date.now()}`,
      type: 'chart',
      config: {
        type: chartType,
        title: title || `${measure} by ${dimension}`,
        labelKey: dimension, dataKey: measure, aggMethod, filterN, customFormula,
        data: buildManualChartData(rows, dimension, measure, chartType, aggMethod, filterN, 'desc', customFormula),
      },
    });
    onClose();
  };

  const fieldStyle = {
    width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px',
    border: '1px solid var(--border)', fontSize: '0.8125rem',
    outline: 'none', background: '#f8fafc', color: 'var(--text-main)',
  };
  const labelStyle = {
    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
    color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem',
  };

  const getColType = (colName) => {
    const found = allCols.find(c => c.name === colName);
    return found?.type || 'text';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-surface" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="visual-title">Add Visualization</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="modal-body">
          {/* Chart Type Grid */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Chart Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.5rem' }}>
              {CHART_TYPES.map(ct => (
                <button key={ct.value} onClick={() => setChartType(ct.value)} style={{
                  padding: '0.75rem 0.5rem', borderRadius: '10px', cursor: 'pointer',
                  border: chartType === ct.value ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: chartType === ct.value ? '#f5f3ff' : '#f8fafc',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                  transition: 'all 0.15s',
                }}>
                  <span style={{ fontSize: '1.25rem' }}>{ct.icon}</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: chartType === ct.value ? 'var(--primary)' : 'var(--text-muted)' }}>{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table: Multi-column selector */}
          {chartType === 'table' ? (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Select Columns to Display</label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px',
                  maxHeight: '180px', overflowY: 'auto', padding: '8px',
                  border: '1px solid var(--border)', borderRadius: '8px', background: '#fafbfc'
                }}>
                  {allHeaders.map(col => {
                    const selected = tableColumns.includes(col);
                    return (
                      <button
                        key={col}
                        onClick={() => toggleTableColumn(col)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                          border: selected ? '1.5px solid var(--primary)' : '1px solid #e2e8f0',
                          background: selected ? '#f5f3ff' : '#fff',
                          fontSize: '0.72rem', fontWeight: 600,
                          color: selected ? 'var(--primary)' : 'var(--text-main)',
                          transition: 'all 0.15s',
                        }}
                      >
                        {selected ? <Check size={12} /> : <Plus size={12} style={{ opacity: 0.3 }} />}
                        <span style={{ flex: 1, textAlign: 'left' }}>{col}</span>
                        <span style={{
                          fontSize: '0.5rem', padding: '1px 5px', borderRadius: '99px', fontWeight: 700,
                          background: getColType(col) === 'number' ? '#eff6ff' : getColType(col) === 'date' ? '#f0fdf4' : '#faf5ff',
                          color: getColType(col) === 'number' ? '#3b82f6' : getColType(col) === 'date' ? '#16a34a' : '#7c3aed',
                        }}>{getColType(col)}</span>
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                  {tableColumns.length === 0 
                    ? `No columns selected — will default to first 4 columns` 
                    : `${tableColumns.length} column${tableColumns.length > 1 ? 's' : ''} selected`}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Row Limit</label>
                  <select value={filterN} onChange={e => setFilterN(e.target.value)} style={fieldStyle}>
                    <option value="all">All Rows</option>
                    <option value="top5">First 5</option>
                    <option value="top10">First 10</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Title (optional)</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Data Table" style={fieldStyle} />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Dimension */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Dimension (X-Axis / Groups)</label>
                <select value={dimension} onChange={e => setDimension(e.target.value)} style={fieldStyle}>
                  {allCols.map(c => <option key={c.name} value={c.name}>{c.name} ({c.type})</option>)}
                </select>
              </div>

              {/* Measure */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Measure (Y-Axis / Value)</label>
                <select value={measure} onChange={e => setMeasure(e.target.value)} style={fieldStyle}>
                  {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              {/* Aggregation + Filter + Title */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Aggregation</label>
                  <select value={aggMethod} onChange={e => setAggMethod(e.target.value)} style={fieldStyle}>
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count</option>
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Limit</label>
                  <select value={filterN} onChange={e => setFilterN(e.target.value)} style={fieldStyle}>
                    <option value="all">All</option>
                    <option value="top5">Top 5</option>
                    <option value="top10">Top 10</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Title (optional)</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder={`${measure} by ${dimension}`} style={fieldStyle} />
                </div>
              </div>

              {aggMethod === 'custom' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label style={labelStyle}>Formula Expression</label>
                  <input 
                    type="text" 
                    value={customFormula} 
                    onChange={e => setCustomFormula(e.target.value)}
                    placeholder="e.g. SUM(Sales) / COUNT(Orders)" 
                    style={{...fieldStyle, fontFamily: 'monospace'}} 
                  />
                </div>
              )}
            </>
          )}
        </div>

        <footer style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', marginTop: '1.25rem' }}>
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Cancel</button>
          <button className="btn btn-lavender" style={{ flex: 2, justifyContent: 'center' }} onClick={handleAdd}
            disabled={chartType !== 'table' && (!dimension || !measure)}>
            <Plus size={14} /> Add to Report
          </button>
        </footer>
      </div>
    </div>
  );
}
