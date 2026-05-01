import React from 'react';

/* ─── Shared shimmer styles injected once ─────────────────────────── */
const skeletonCSS = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .skeleton {
    border-radius: 6px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
  }
  .canvas-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow);
  }
  /* Layout utilities used by skeletons */
  .sk-grid-2  { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
  .sk-grid-4  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
  .sk-p4      { padding: 1rem; }
  .sk-p6      { padding: 1.5rem; }
  .sk-mb2     { margin-bottom: 0.5rem; }
  .sk-mb4     { margin-bottom: 1rem; }
  .sk-mb6     { margin-bottom: 1.5rem; }
  .sk-h4      { height: 1rem; }
  .sk-h6      { height: 1.5rem; }
  .sk-h8      { height: 2rem; }
  .sk-h80     { height: 20rem; }
  .sk-hfull   { height: calc(100% - 2.5rem); }
  .sk-w20     { width: 5rem; }
  .sk-w32     { width: 8rem; }
  .sk-w40     { width: 10rem; }
  .sk-w48     { width: 12rem; }
  .sk-wfull   { width: 100%; }
  .sk-flex    { display: flex; }
  .sk-flex1   { flex: 1; }
  .sk-between { justify-content: space-between; }
  .sk-center  { align-items: center; }
  .sk-gap4    { gap: 1rem; }
  .sk-rows > * + * { margin-top: 1rem; }
`;

function InjectStyles() {
  return <style>{skeletonCSS}</style>;
}

export function SkeletonTable() {
  return (
    <div className="canvas-card sk-p6 sk-rows">
      <InjectStyles />
      <div className="sk-flex sk-between sk-center sk-mb6">
        <div className="skeleton sk-h8 sk-w32" />
        <div className="skeleton sk-h8 sk-w48" />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="sk-flex sk-gap4">
          <div className="skeleton sk-h4 sk-flex1" />
          <div className="skeleton sk-h4 sk-flex1" />
          <div className="skeleton sk-h4 sk-flex1" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCharts() {
  return (
    <div className="sk-grid-2">
      <InjectStyles />
      {[...Array(2)].map((_, i) => (
        <div key={i} className="canvas-card sk-p6 sk-h80">
          <div className="skeleton sk-h6 sk-w40 sk-mb4" />
          <div className="skeleton sk-hfull sk-wfull" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonInsights() {
  return (
    <div className="sk-grid-4">
      <InjectStyles />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="canvas-card sk-p4">
          <div className="skeleton sk-h4 sk-w20 sk-mb2" />
          <div className="skeleton sk-h8 sk-w32" />
        </div>
      ))}
    </div>
  );
}
