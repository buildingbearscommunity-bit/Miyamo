import { fmt, numericStats, detectTrend, calcGrowthRate, aggregateData } from './dataAnalysis';

export function generateAIReport(prompt, headers, columnMeta, rows) {
  const numericCols = columnMeta.filter(c => c.type === 'number');
  const textCols    = columnMeta.filter(c => c.type === 'text');
  const dateCols    = columnMeta.filter(c => c.type === 'date');

  const report = { title: 'Visualisation Report', items: [] };
  if (numericCols.length === 0) return report;

  const mainNum  = numericCols[0];
  const catCol   = textCols[0] || dateCols[0];
  const dateCol  = dateCols[0];
  const labelCol = catCol?.name || headers[0] || mainNum.name;

  const vals  = rows.map(r => r[mainNum.name]);
  const stats = numericStats(vals);
  if (!stats) return report;

  const trend  = detectTrend(vals);
  const growth = calcGrowthRate(vals);

  // ── KPI Cards ────────────────────────────────────────────────────────────
  const push = (id, title, value, sub, type, dataKey, aggMethod, customFormula) =>
    report.items.push({ id, type: 'metric', config: { title, value, sub, type, dataKey, aggMethod, customFormula } });

  push('kpi-sum',   `Total ${mainNum.name}`,   fmt(stats.sum),       `Sum · ${rows.length} records`,          'accent',  mainNum.name, 'sum');
  push('kpi-avg',   `Average ${mainNum.name}`,  fmt(stats.avg, 1),    `Mean · σ = ${fmt(stats.stdDev, 1)}`,    'warning', mainNum.name, 'avg');
  push('kpi-max',   `Highest ${mainNum.name}`,  fmt(stats.max),       'Peak performance recorded',             'success', mainNum.name, 'max');
  push('kpi-min',   `Lowest ${mainNum.name}`,   fmt(stats.min),       'Minimum baseline detected',             'danger',  mainNum.name, 'min');
  push('kpi-count', 'Total Records',            String(rows.length),  `${headers.length} columns detected`,   'accent',  mainNum.name, 'count');

  if (growth !== null) {
    push('kpi-growth', 'Growth Rate',
      `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
      `First → last ${mainNum.name}`,
      growth > 0 ? 'success' : 'danger',
      mainNum.name, 'custom', `(LAST(${mainNum.name}) - FIRST(${mainNum.name})) / FIRST(${mainNum.name}) * 100`);
  }

  if (numericCols.length > 1) {
    const sec = numericCols[1];
    const s2  = numericStats(rows.map(r => r[sec.name]));
    if (s2) {
      push('kpi-sec-sum', `Total ${sec.name}`,   fmt(s2.sum),     `Sum across all records`, 'warning', sec.name, 'sum');
      push('kpi-sec-avg', `Average ${sec.name}`, fmt(s2.avg, 1),  'Mean value',             'accent',  sec.name, 'avg');
    }
  }

  // ── Charts — always minimum 4 ─────────────────────────────────────────────
  const lineLabel = dateCol?.name || labelCol;
  const areaNum   = numericCols.length > 1 ? numericCols[1] : numericCols[0];
  const areaLbl   = dateCol?.name || labelCol;
  const areaMth   = numericCols.length > 1 ? 'sum' : 'avg';

  const addChart = (id, type, title, labelKey, dataKey, aggMethod, data) =>
    report.items.push({ id, type: 'chart', config: { type, title, labelKey, dataKey, aggMethod, data } });

  // Chart 1 — Bar
  addChart('chart-bar', 'bar',
    `${mainNum.name} by ${labelCol}`, labelCol, mainNum.name, 'sum',
    aggregateData(rows, labelCol, mainNum.name, 'sum').slice(0, 10));

  // Chart 2 — Line (date if available, else categorical)
  addChart('chart-line', 'line',
    dateCol ? `${mainNum.name} over Time` : `${mainNum.name} Trend`,
    lineLabel, mainNum.name, 'sum',
    aggregateData(rows, lineLabel, mainNum.name, 'sum'));

  // Chart 3 — Pie / Distribution
  addChart('chart-pie', 'pie',
    `${mainNum.name} Distribution`, labelCol, mainNum.name, 'sum',
    aggregateData(rows, labelCol, mainNum.name, 'sum').slice(0, 7));

  // Chart 4 — Area (second metric or avg of primary)
  addChart('chart-area', 'area',
    numericCols.length > 1 ? `${areaNum.name} Trend` : `${mainNum.name} (Avg)`,
    areaLbl, areaNum.name, areaMth,
    aggregateData(rows, areaLbl, areaNum.name, areaMth));

  // Chart 5+ — Extra numeric columns
  numericCols.slice(2, 5).forEach((col, i) => {
    addChart(`chart-extra-${i}`, ['bar', 'line', 'pie'][i % 3],
      `${col.name} by ${labelCol}`, labelCol, col.name, 'sum',
      aggregateData(rows, labelCol, col.name, 'sum').slice(0, 10));
  });

  return report;
}
