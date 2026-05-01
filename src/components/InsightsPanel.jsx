import React from 'react';

const colorMap = {
  accent:  { card: 'accent',  icon: 'icon-accent'  },
  success: { card: 'success', icon: 'icon-success'  },
  warning: { card: 'warning', icon: 'icon-warning'  },
  cyan:    { card: 'cyan',    icon: 'icon-cyan'      },
  danger:  { card: 'danger',  icon: 'icon-danger'    },
};

const trendClass = {
  '↑ Increasing': 'trend-up',
  '↓ Decreasing': 'trend-down',
  '→ Stable':     'trend-flat',
};

export default function InsightsPanel({ insights }) {
  if (!insights || insights.length === 0) return null;
  return (
    <div className="insights-grid">
      {insights.map((ins, i) => {
        const c = colorMap[ins.color] || colorMap.accent;
        const extraClass = trendClass[ins.value] || '';
        return (
          <div
            key={i}
            className={`insight-card ${c.card}`}
            style={{ animationDelay: `${i * 0.055}s` }}
            title={ins.sub || ''}
          >
            <div className={`insight-icon ${c.icon}`}>
              <span role="img" aria-label={ins.label}>{ins.icon}</span>
            </div>
            <div className="insight-label">{ins.label}</div>
            <div className={`insight-value ${extraClass}`}>{ins.value}</div>
            {ins.sub && <div className="insight-sub">{ins.sub}</div>}
          </div>
        );
      })}
    </div>
  );
}
