import React from 'react';

export default function MetricCard({ config }) {
  const { title, value } = config;

  return (
    <div className="kpi-card-inner">
      <span className="kpi-label">{title}</span>
      <div className="kpi-value">{value}</div>
      </div>
  );
}
