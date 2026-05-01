import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function DataTable({ headers, rows, columnMeta, onColumnTypeChange }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  if (!headers || headers.length === 0) return null;

  const sorted = useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortCol] ?? '', bv = b[sortCol] ?? '';
      const an = parseFloat(String(av).replace(/[$,%]/g, ''));
      const bn = parseFloat(String(bv).replace(/[$,%]/g, ''));
      if (!isNaN(an) && !isNaN(bn)) return sortDir === 'asc' ? an - bn : bn - an;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [rows, sortCol, sortDir]);

  const displayRows = sorted.slice(0, 10);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const getColType = (h) => columnMeta?.find(c => c.name === h)?.type || 'text';
  const isNumeric = (h) => getColType(h) === 'number';

  const cycleType = (e, colName) => {
    e.stopPropagation();
    if (!onColumnTypeChange) return;
    const current = getColType(colName);
    const types = ['text', 'number', 'date'];
    const next = types[(types.indexOf(current) + 1) % types.length];
    onColumnTypeChange(colName, next);
  };

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
      {/* Scrollable container — shows ALL columns */}
      <div style={{ overflowX: 'auto', maxHeight: '260px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', minWidth: `${headers.length * 90}px` }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr>
              {headers.map(h => (
                <th key={h} onClick={() => handleSort(h)} style={{
                  background: '#f8fafc', padding: '0.5rem 0.65rem',
                  textAlign: isNumeric(h) ? 'right' : 'left',
                  fontWeight: 700, color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  position: 'sticky', top: 0,
                  userSelect: 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: isNumeric(h) ? 'flex-end' : 'flex-start' }}>
                    <span>{h}</span>
                    {sortCol === h
                      ? (sortDir === 'asc' ? <ArrowUp size={8} /> : <ArrowDown size={8} />)
                      : <ArrowUpDown size={8} style={{ opacity: 0.3 }} />}
                    <span onClick={(e) => cycleType(e, h)} style={{
                      fontSize: '0.55rem', padding: '1px 5px', borderRadius: '99px',
                      background: getColType(h) === 'number' ? '#eff6ff' : getColType(h) === 'date' ? '#f0fdf4' : '#faf5ff',
                      color: getColType(h) === 'number' ? '#3b82f6' : getColType(h) === 'date' ? '#16a34a' : '#7c3aed',
                      fontWeight: 700, letterSpacing: '0.03em', cursor: 'pointer', border: '1px solid currentColor'
                    }} title="Click to change format">{getColType(h)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                {headers.map(h => (
                  <td key={h} style={{
                    padding: '0.45rem 0.65rem',
                    borderBottom: '1px solid #f1f5f9',
                    color: 'var(--text-main)',
                    textAlign: isNumeric(h) ? 'right' : 'left',
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: isNumeric(h) ? 'tabular-nums' : 'normal',
                    fontWeight: isNumeric(h) ? 600 : 400,
                  }}>
                    {row[h] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: '0.35rem 0.65rem', background: '#fcfcfd',
        fontSize: '0.65rem', color: 'var(--text-dim)',
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Showing <strong>{displayRows.length}</strong> of <strong>{rows.length}</strong> rows</span>
        <span><strong>{headers.length}</strong> columns</span>
      </div>
    </div>
  );
}
