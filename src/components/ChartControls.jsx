import React from 'react';
import { PALETTE } from './Charts.jsx';

const CHART_TYPES = [
  { value: 'bar',  label: '📊 Bar Chart' },
  { value: 'line', label: '📈 Line Chart' },
  { value: 'area', label: '🌊 Area Chart' },
  { value: 'pie',  label: '🥧 Pie Chart' },
];

const FILTER_OPTIONS = [
  { value: 'all',   label: 'All rows' },
  { value: 'top5',  label: 'Top 5' },
  { value: 'top10', label: 'Top 10' },
];

const SORT_OPTIONS = [
  { value: 'none', label: 'Original order' },
  { value: 'desc', label: '↓ Descending' },
  { value: 'asc',  label: '↑ Ascending' },
];

const AGG_METHODS = [
  { value: 'sum',   label: 'Sum' },
  { value: 'avg',   label: 'Average' },
  { value: 'count', label: 'Count' },
];

function Select({ id, label, value, onChange, options, disabled, tooltip }) {
  return (
    <div className="ctrl-group">
      <label className="ctrl-label" htmlFor={id} title={tooltip}>
        {label}
        {tooltip && <span className="info-icon" title={tooltip}>?</span>}
      </label>
      <select
        id={id}
        className="ctrl-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function ChartControls({
  headers, columnMeta,
  xCol, yCol, chartType, aggMethod, filterMode, sortDir, suggestion, syncAll,
  onXCol, onYCol, onChartType, onAggMethod, onFilter, onSort, onSyncToggle, onApply,
}) {
  const numericCols = (columnMeta || []).filter((c) => c.type === 'number');
  const allCols = headers.map((h) => ({ value: h, label: h }));
  const numericColOptions = numericCols.map((c) => ({ value: c.name, label: c.name }));

  return (
    <div className="card ctrl-card">
      {/* Suggestion banner */}
      {suggestion && (
        <div className="suggestion-banner">
          <span className="suggestion-icon">💡</span>
          <div>
            <span className="suggestion-label">Smart Suggestion</span>
            <span className="suggestion-text">{suggestion.reason}</span>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => {
              // Fix: state setters are async; defer onApply() so React
              // can flush the queued updates before the apply runs.
              onXCol(suggestion.xCol);
              onYCol(suggestion.yCol);
              onChartType(suggestion.type);
              onAggMethod(suggestion.method || 'sum');
              setTimeout(onApply, 0);
            }}
          >
            Apply
          </button>
        </div>
      )}

      <div className="ctrl-row">
        <Select
          id="x-axis-col"
          label="Dimension"
          value={xCol}
          onChange={onXCol}
          options={allCols}
          disabled={!headers.length}
          tooltip="The category or group for the X-Axis"
        />
        <Select
          id="y-axis-col"
          label="Metric"
          value={yCol}
          onChange={onYCol}
          options={numericColOptions.length ? numericColOptions : allCols}
          disabled={!headers.length}
          tooltip="The numeric value for the Y-Axis"
        />
        <Select
          id="agg-method"
          label="Aggregation"
          value={aggMethod}
          onChange={onAggMethod}
          options={AGG_METHODS}
          disabled={!headers.length}
          tooltip="How to combine values if multiple rows share the same dimension"
        />
        <Select
          id="chart-type"
          label="Chart Type"
          value={chartType}
          onChange={onChartType}
          options={CHART_TYPES}
          disabled={!headers.length}
        />
        
        <div className="ctrl-group ctrl-apply">
          <label className="ctrl-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input 
              type="checkbox" 
              checked={syncAll} 
              onChange={(e) => onSyncToggle(e.target.checked)} 
              id="sync-toggle"
            />
            Sync All
          </label>
          <button
            className="btn btn-lavender"
            onClick={onApply}
            disabled={!headers.length}
            id="apply-chart-btn"
          >
            Render
          </button>
        </div>
      </div>

      <div className="ctrl-palette">
        <div className="ctrl-row" style={{ marginTop: 0, border: 0, padding: 0 }}>
          <Select
            id="sort-dir"
            label="Sort"
            value={sortDir}
            onChange={onSort}
            options={SORT_OPTIONS}
            disabled={!headers.length}
          />
          <Select
            id="filter-mode"
            label="Filter"
            value={filterMode}
            onChange={onFilter}
            options={FILTER_OPTIONS}
            disabled={!headers.length}
          />
        </div>
      </div>
    </div>

    <style>{`
      .ctrl-card {
        background: #fff;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: 1.25rem 1.5rem;
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .ctrl-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: flex-end;
        border-bottom: 1px solid var(--border);
        padding-bottom: 0.75rem;
      }
      .ctrl-palette .ctrl-row {
        border-bottom: none;
        padding-bottom: 0;
      }
      .ctrl-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        min-width: 120px;
        flex: 1;
      }
      .ctrl-apply {
        flex: 0 0 auto;
        min-width: unset;
      }
      .ctrl-label {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-dim);
        white-space: nowrap;
      }
      .ctrl-select {
        width: 100%;
        padding: 0.5rem 0.65rem;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: #f8fafc;
        font-size: 0.8125rem;
        color: var(--text-main);
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }
      .ctrl-select:focus {
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        background: #fff;
      }
      .ctrl-select:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .suggestion-banner {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: #f5f3ff;
        border: 1px solid #ddd6fe;
        border-radius: 10px;
        padding: 0.75rem 1rem;
        font-size: 0.8rem;
      }
      .suggestion-icon { font-size: 1.1rem; }
      .suggestion-banner > div {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .suggestion-label {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--primary);
      }
      .suggestion-text {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-main);
      }
      .info-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: var(--text-dim);
        color: #fff;
        font-size: 0.55rem;
        font-weight: 800;
        margin-left: 4px;
        cursor: help;
      }
    `}</style>
  );
}

