import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList
} from 'recharts';

export const PALETTE = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6'];

const TOOLTIP_STYLE = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: '0.75rem',
  color: '#1e293b',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  padding: '8px 12px',
  zIndex: 1000
};

const AXIS_STYLE = { fontSize: 10, fill: '#94a3b8', fontFamily: 'Inter,sans-serif' };

function tickFormatter(val) {
  if (typeof val === 'number') {
    if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + 'M';
    if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + 'K';
    return val;
  }
  const s = String(val);
  return s.length > 8 ? s.slice(0, 8) + '…' : s;
}

const CustomLegend = (props) => {
  const { payload } = props;
  if (!payload) return null;
  return (
    <ul style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'center', 
      gap: '12px', 
      listStyle: 'none', 
      padding: '10px 0 0 0', 
      margin: 0,
      fontSize: '10px',
      fontWeight: 600,
      color: '#64748b'
    }}>
      {payload.map((entry, index) => (
        <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

// ── Chart Wrapper ─────────────────────────────────────────────────────────────

export function ChartWrapper({ children }) {
  return (
    <div style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 0 }}>
      {children}
    </div>
  );
}

// ── Bar ───────────────────────────────────────────────────────────────────────

export function BarChartPanel({ config }) {
  const key = config.dataKey || 'value';
  const legendPayload = config.data.map((d, i) => ({
    value: d.name,
    type: 'circle',
    color: PALETTE[i % PALETTE.length]
  }));

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={config.data} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={AXIS_STYLE} hide={config.data.length > 12} />
          <YAxis tick={AXIS_STYLE} tickFormatter={tickFormatter} width={50} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
          {config.showLegend && <Legend content={(props) => <CustomLegend {...props} payload={legendPayload} />} verticalAlign="bottom" height={36} />}
          <Bar dataKey={key} radius={[4, 4, 0, 0]} maxBarSize={40}>
            {config.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            {config.showLabels && <LabelList dataKey={key} position="top" style={{ fontSize: 9, fill: '#64748b' }} formatter={tickFormatter} />}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ── Line ──────────────────────────────────────────────────────────────────────

export function LineChartPanel({ config }) {
  const key = config.dataKey || 'value';
  const legendPayload = [{ value: config.title || key, type: 'circle', color: PALETTE[0] }];

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={config.data} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={AXIS_STYLE} hide={config.data.length > 12} />
          <YAxis tick={AXIS_STYLE} tickFormatter={tickFormatter} width={50} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {config.showLegend && <Legend content={(props) => <CustomLegend {...props} payload={legendPayload} />} verticalAlign="bottom" height={36} />}
          <Line type="monotone" dataKey={key} stroke={PALETTE[0]} strokeWidth={2.5} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }}>
            {config.showLabels && <LabelList dataKey={key} position="top" offset={10} style={{ fontSize: 9, fill: '#64748b' }} formatter={tickFormatter} />}
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ── Area ──────────────────────────────────────────────────────────────────────

export function AreaChartPanel({ config }) {
  const key = config.dataKey || 'value';
  const legendPayload = [{ value: config.title || key, type: 'circle', color: PALETTE[2] }];

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={config.data} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`areaGrad_${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={PALETTE[2]} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={PALETTE[2]} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={AXIS_STYLE} hide={config.data.length > 12} />
          <YAxis tick={AXIS_STYLE} tickFormatter={tickFormatter} width={50} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {config.showLegend && <Legend content={(props) => <CustomLegend {...props} payload={legendPayload} />} verticalAlign="bottom" height={36} />}
          <Area type="monotone" dataKey={key} stroke={PALETTE[2]} strokeWidth={2} fill={`url(#areaGrad_${key})`}>
             {config.showLabels && <LabelList dataKey={key} position="top" offset={10} style={{ fontSize: 9, fill: '#64748b' }} formatter={tickFormatter} />}
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

// ── Pie ───────────────────────────────────────────────────────────────────────

export function PieChartPanel({ config }) {
  const [zoom, setZoom] = useState(1);
  const hasLabels = config.showLabels;
  const baseOuter = hasLabels ? 55 : 70;
  const baseInner = hasLabels ? 35 : 45;
  
  const outerRadius = baseOuter * zoom;
  const innerRadius = baseInner * zoom;

  const legendPayload = config.data.map((d, i) => ({
    value: d.name,
    type: 'circle',
    color: PALETTE[i % PALETTE.length]
  }));

  const handleZoom = (delta) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  return (
    <ChartWrapper>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Zoom Controls */}
        <div style={{ 
          position: 'absolute', top: 5, right: 5, zIndex: 10, 
          display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.8)', 
          padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' 
        }}>
          <button 
            onClick={() => handleZoom(0.1)} 
            style={{ padding: '2px 6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}
            title="Zoom In"
          >+</button>
          <button 
            onClick={() => handleZoom(-0.1)} 
            style={{ padding: '2px 6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}
            title="Zoom Out"
          >-</button>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={config.data}
              cx="50%"
              cy="45%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey="value"
              labelLine={hasLabels}
              label={hasLabels ? ({ name, percent, x, y, cx, cy, fill }) => {
                const truncatedName = name.length > 8 ? name.slice(0, 8) + '...' : name;
                return (
                  <text 
                    x={x} y={y} fill={fill} 
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="central" 
                    style={{ fontSize: 8, fontWeight: 700, fontFamily: 'Inter' }}
                  >
                    {`${truncatedName} ${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              } : false}
            >
              {config.data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {config.showLegend && <Legend content={(props) => <CustomLegend {...props} payload={legendPayload} />} verticalAlign="bottom" height={30} />}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartWrapper>
  );
}

// ── Table (enhanced multi-column) ─────────────────────────────────────────────

export function TableChartPanel({ config }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Determine columns to display
  const columns = useMemo(() => {
    if (config.tableColumns && config.tableColumns.length > 0) {
      return config.tableColumns;
    }
    // Fallback: labelKey + dataKey
    const label = config.labelKey || 'name';
    const key = config.dataKey || 'value';
    return label === key ? [label] : [label, key];
  }, [config.tableColumns, config.labelKey, config.dataKey]);

  // Sort data
  const sortedData = useMemo(() => {
    const data = config.data || [];
    if (!sortCol) return data;
    return [...data].sort((a, b) => {
      const av = a[sortCol] ?? '';
      const bv = b[sortCol] ?? '';
      const an = parseFloat(String(av).replace(/[$,%]/g, ''));
      const bn = parseFloat(String(bv).replace(/[$,%]/g, ''));
      if (!isNaN(an) && !isNaN(bn)) return sortDir === 'asc' ? an - bn : bn - an;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [config.data, sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const isNumeric = (val) => {
    if (val === null || val === undefined || val === '') return false;
    return !isNaN(parseFloat(String(val).replace(/[$,%]/g, '')));
  };

  const isColNumeric = (col) => {
    const firstVal = (config.data || [])[0]?.[col];
    return isNumeric(firstVal);
  };

  return (
    <ChartWrapper>
      <div style={{ width: '100%', height: '100%', overflowY: 'auto', overflowX: 'auto', fontSize: '0.72rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${columns.length * 100}px` }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              {columns.map(col => {
                const numeric = isColNumeric(col);
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    style={{
                      textAlign: numeric ? 'right' : 'left',
                      padding: '8px 10px',
                      borderBottom: '2px solid var(--border)',
                      color: sortCol === col ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      background: '#fafbfc',
                      userSelect: 'none',
                      transition: 'color 0.15s',
                    }}
                  >
                    {col} {sortCol === col ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((d, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                {columns.map(col => {
                  const val = d[col] ?? d.name ?? '—';
                  const numeric = isNumeric(val);
                  return (
                    <td
                      key={col}
                      style={{
                        padding: '7px 10px',
                        color: 'var(--text-main)',
                        textAlign: numeric ? 'right' : 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px',
                        fontVariantNumeric: numeric ? 'tabular-nums' : 'normal',
                        fontWeight: numeric ? 600 : 400,
                      }}
                      title={String(val)}
                    >
                      {numeric ? tickFormatter(parseFloat(String(val).replace(/[$,%]/g, ''))) : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {sortedData.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            No data to display
          </div>
        )}
      </div>
    </ChartWrapper>
  );
}

export default function Charts() { return null; }
