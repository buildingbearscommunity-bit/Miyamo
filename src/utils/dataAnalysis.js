// ── Type Detection ──────────────────────────────────────────────────────────

const DATE_PATTERNS = [
  /^\d{4}-\d{2}-\d{2}$/,
  /^\d{2}\/\d{2}\/\d{4}$/,
  /^\d{2}-\d{2}-\d{4}$/,
  /^\d{4}\/\d{2}\/\d{2}$/,
  /^\w{3,9}\s\d{1,2},?\s\d{4}$/i,
];

export function detectColumnType(values) {
  const nonEmpty = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
  if (nonEmpty.length === 0) return 'text';
  const asNumbers = nonEmpty.map((v) => Number(String(v).replace(/[$,%]/g, '').trim()));
  if (asNumbers.every((n) => !isNaN(n))) return 'number';
  const isDate = nonEmpty.every((v) => DATE_PATTERNS.some((p) => p.test(String(v).trim())));
  if (isDate) return 'date';
  return 'text';
}

export function analyzeColumns(headers, rows) {
  return headers.map((header, idx) => {
    const values = rows.map((row) => row[header] ?? row[idx]);
    return { name: header, type: detectColumnType(values), index: idx };
  });
}

// ── Numeric Stats ────────────────────────────────────────────────────────────

export function numericStats(values) {
  const nums = values
    .map((v) => parseFloat(String(v).replace(/[$,%]/g, '').trim()))
    .filter((n) => !isNaN(n));
  if (nums.length === 0) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  const avg = sum / nums.length;
  const variance = nums.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / nums.length;
  return {
    min: Math.min(...nums),
    max: Math.max(...nums),
    avg,
    sum,
    count: nums.length,
    stdDev: Math.sqrt(variance),
    values: nums,
  };
}

// ── Trend Detection ──────────────────────────────────────────────────────────

export function detectTrend(values) {
  const nums = values.map((v) => parseFloat(String(v).replace(/[$,%]/g, '').trim())).filter((n) => !isNaN(n));
  if (nums.length < 2) return 'flat';
  let ups = 0, downs = 0;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) ups++;
    else if (nums[i] < nums[i - 1]) downs++;
  }
  if (ups > downs) return 'increasing';
  if (downs > ups) return 'decreasing';
  return 'flat';
}

// ── Growth Rate ──────────────────────────────────────────────────────────────

export function calcGrowthRate(values) {
  const nums = values.map((v) => parseFloat(String(v).replace(/[$,%]/g, '').trim())).filter((n) => !isNaN(n));
  if (nums.length < 2 || nums[0] === 0) return null;
  const first = nums[0];
  const last = nums[nums.length - 1];
  return ((last - first) / Math.abs(first)) * 100;
}

// ── Outlier Detection (IQR method) ──────────────────────────────────────────

export function detectOutliers(rows, colName) {
  const nums = rows
    .map((r) => ({ row: r, val: parseFloat(String(r[colName] ?? '').replace(/[$,%]/g, '').trim()) }))
    .filter((x) => !isNaN(x.val));
  if (nums.length < 4) return [];
  const sorted = [...nums].sort((a, b) => a.val - b.val);
  const q1 = sorted[Math.floor(sorted.length * 0.25)].val;
  const q3 = sorted[Math.floor(sorted.length * 0.75)].val;
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  return nums.filter((x) => x.val < lo || x.val > hi).map((x) => x.row);
}

// ── Most Consistent Category (lowest CV) ─────────────────────────────────────

export function findMostConsistent(rows, labelCol, numCol) {
  const groups = {};
  rows.forEach((r) => {
    const key = String(r[labelCol] ?? '').trim();
    const val = parseFloat(String(r[numCol] ?? '').replace(/[$,%]/g, '').trim());
    if (key && !isNaN(val)) {
      if (!groups[key]) groups[key] = [];
      groups[key].push(val);
    }
  });
  let best = null, bestCV = Infinity;
  Object.entries(groups).forEach(([label, vals]) => {
    if (vals.length < 2) return;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg === 0) return;
    const sd = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / vals.length);
    const cv = sd / avg;
    if (cv < bestCV) { bestCV = cv; best = label; }
  });
  return best;
}

// ── Data Aggregation ─────────────────────────────────────────────────────────

export function aggregateData(rows, xCol, yCol, method = 'sum') {
  const groups = {};
  
  rows.forEach(r => {
    const xVal = String(r[xCol] ?? 'Unknown').trim();
    const yVal = parseFloat(String(r[yCol] ?? '0').replace(/[$,%]/g, '').trim());
    
    if (!groups[xVal]) {
      groups[xVal] = { sum: 0, count: 0, values: [] };
    }
    
    if (!isNaN(yVal)) {
      groups[xVal].sum += yVal;
      groups[xVal].count += 1;
      groups[xVal].values.push(yVal);
    }
  });

  return Object.entries(groups).map(([name, stats]) => {
    let resultValue = 0;
    if (method === 'sum') resultValue = stats.sum;
    else if (method === 'avg') resultValue = stats.count > 0 ? stats.sum / stats.count : 0;
    else if (method === 'count') resultValue = stats.count;
    else if (method === 'min') resultValue = stats.values.length > 0 ? Math.min(...stats.values) : 0;
    else if (method === 'max') resultValue = stats.values.length > 0 ? Math.max(...stats.values) : 0;
    
    return { name, [yCol]: resultValue, value: resultValue }; // Provide both for compatibility
  });
}

// ── Custom Expression Evaluator ──────────────────────────────────────────────

export function evaluateCustomExpression(rows, xCol, expression) {
  const groups = {};
  
  // Sort rows chronologically if a date column exists
  let sortedRows = [...rows];
  if (rows.length > 0) {
    const firstRow = rows[0];
    const dateCol = Object.keys(firstRow).find(key => {
       const val = String(firstRow[key]);
       return isNaN(val) && !isNaN(Date.parse(val)) && val.length > 5;
    });
    if (dateCol) {
       sortedRows.sort((a, b) => new Date(a[dateCol]) - new Date(b[dateCol]));
    }
  }
  
  sortedRows.forEach(r => {
    const xVal = String(r[xCol] ?? 'Unknown').trim();
    if (!groups[xVal]) groups[xVal] = { rows: [] };
    groups[xVal].rows.push(r);
  });

  const results = [];
  const regex = /(SUM|AVG|COUNT|MIN|MAX|FIRST|LAST)\s*\(\s*([^)]+)\s*\)/ig;
  const neededAggs = [];
  let matches;
  while ((matches = regex.exec(expression)) !== null) {
    neededAggs.push({
      full: matches[0],
      method: matches[1].toLowerCase(),
      col: matches[2].trim()
    });
  }

  for (const [name, group] of Object.entries(groups)) {
    let groupExpr = expression;
    
    for (const agg of neededAggs) {
      let sum = 0, count = 0, min = Infinity, max = -Infinity, first = null, last = null;
      for (const r of group.rows) {
        const yVal = parseFloat(String(r[agg.col] ?? '0').replace(/[$,%]/g, '').trim());
        if (!isNaN(yVal)) {
          sum += yVal; count += 1;
          if (yVal < min) min = yVal;
          if (yVal > max) max = yVal;
          if (first === null) first = yVal;
          last = yVal;
        }
      }
      
      let aggVal = 0;
      if (agg.method === 'sum') aggVal = sum;
      else if (agg.method === 'avg') aggVal = count > 0 ? sum / count : 0;
      else if (agg.method === 'count') aggVal = count;
      else if (agg.method === 'min') aggVal = min === Infinity ? 0 : min;
      else if (agg.method === 'max') aggVal = max === -Infinity ? 0 : max;
      else if (agg.method === 'first') aggVal = first === null ? 0 : first;
      else if (agg.method === 'last') aggVal = last === null ? 0 : last;
      
      groupExpr = groupExpr.split(agg.full).join(aggVal);
    }
    
    try {
      if (/[^0-9+\-*/().\s]/.test(groupExpr)) {
        throw new Error("Invalid syntax or characters in formula. Use basic math (+ - * /) and Aggregations (SUM, AVG, MIN, MAX, COUNT, FIRST, LAST).");
      }
      // eslint-disable-next-line no-new-func
      const resultValue = new Function(`return ${groupExpr}`)();
      if (!isFinite(resultValue) || isNaN(resultValue)) {
         results.push({ name, value: 0 }); 
      } else {
         results.push({ name, value: resultValue });
      }
    } catch (e) {
      throw new Error(`Formula syntax error: ${e.message}`);
    }
  }
  
  return results;
}

// ── Smart Chart Suggestion ───────────────────────────────────────────────────

export function suggestChart(columnMeta, rowCount) {
  const numericCols = columnMeta.filter((c) => c.type === 'number');
  const textCols    = columnMeta.filter((c) => c.type === 'text');
  const dateCols    = columnMeta.filter((c) => c.type === 'date');

  if (dateCols.length > 0 && numericCols.length > 0) {
    return { 
      type: 'line', 
      xCol: dateCols[0].name, 
      yCol: numericCols[0].name,
      method: 'sum',
      reason: `Suggested: ${numericCols[0].name} Trend over ${dateCols[0].name}` 
    };
  }
  if (textCols.length > 0 && numericCols.length > 0) {
    return { 
      type: 'bar', 
      xCol: textCols[0].name, 
      yCol: numericCols[0].name,
      method: 'sum',
      reason: `Suggested: Total ${numericCols[0].name} by ${textCols[0].name}` 
    };
  }
  return null;
}

// ── Build Chart Data with Aggregation ────────────────────────────────────────

export function buildManualChartData(rows, xCol, yCol, chartType, method, filter, sortDir, customFormula = '') {
  let data;
  if (method === 'custom') {
    if (!customFormula || !customFormula.trim()) throw new Error("Custom formula cannot be empty");
    data = evaluateCustomExpression(rows, xCol, customFormula);
    data = data.map(d => ({ ...d, [yCol]: d.value })); // compatibility map
  } else {
    data = aggregateData(rows, xCol, yCol, method);
  }

  // Filter top N with implicit sort
  if (filter === 'top5' || filter === 'top10') {
    if (sortDir !== 'asc') data.sort((a, b) => b.value - a.value); // Force desc for Top N unless strictly asc
    data = data.slice(0, filter === 'top5' ? 5 : 10);
  } else {
    // Regular Sort for 'all'
    if (sortDir === 'asc')  data.sort((a, b) => a.value - b.value);
    else if (sortDir === 'desc') data.sort((a, b) => b.value - a.value);
  }

  return data;
}


// ── Auto Chart Configs ───────────────────────────────────────────────────────

export function buildChartConfigs(headers, rows, columnMeta) {
  const configs = [];
  const numericCols = columnMeta.filter((c) => c.type === 'number');
  const textCols    = columnMeta.filter((c) => c.type === 'text');
  const dateCols    = columnMeta.filter((c) => c.type === 'date');
  const labelCol    = textCols[0] || dateCols[0] || columnMeta[0];

  if (!labelCol || numericCols.length === 0) return configs;
  const labelKey = labelCol.name;

  // Bar
  if (numericCols.length > 0) {
    const dataKey = numericCols[0].name;
    configs.push({
      id: 'bar', type: 'bar',
      title: `${dataKey} by ${labelKey}`, subtitle: 'Categorical comparison',
      dataKey, labelKey,
      data: rows.slice(0, 30).map((r) => ({
        name: String(r[labelKey] ?? '').slice(0, 16),
        [dataKey]: parseFloat(String(r[dataKey]).replace(/[$,%]/g, '')) || 0,
      })),
    });
  }

  // Line
  if (numericCols.length > 0) {
    const dataKey = numericCols[0].name;
    configs.push({
      id: 'line', type: 'line',
      title: `${dataKey} Trend`, subtitle: 'Values over time / sequence',
      dataKey, labelKey,
      data: rows.slice(0, 50).map((r) => ({
        name: String(r[labelKey] ?? '').slice(0, 16),
        [dataKey]: parseFloat(String(r[dataKey]).replace(/[$,%]/g, '')) || 0,
      })),
    });
  }

  // Pie (only small datasets)
  if (numericCols.length > 0 && rows.length <= 30) {
    const dataKey = numericCols[0].name;
    const pieData = rows.slice(0, 8).map((r) => ({
      name: String(r[labelKey] ?? '').slice(0, 20),
      value: Math.abs(parseFloat(String(r[dataKey]).replace(/[$,%]/g, '')) || 0),
    }));
    if (pieData.length > 1) {
      configs.push({ id: 'pie', type: 'pie', title: `${dataKey} Distribution`, subtitle: 'Share of total', dataKey, data: pieData });
    }
  }

  // Area (2nd numeric)
  if (numericCols.length > 1) {
    const dataKey = numericCols[1].name;
    configs.push({
      id: 'area', type: 'area',
      title: `${dataKey} Area`, subtitle: 'Cumulative view',
      dataKey, labelKey,
      data: rows.slice(0, 50).map((r) => ({
        name: String(r[labelKey] ?? '').slice(0, 16),
        [dataKey]: parseFloat(String(r[dataKey]).replace(/[$,%]/g, '')) || 0,
      })),
    });
  }

  return configs;
}

// ── Format helper ────────────────────────────────────────────────────────────

export function fmt(n, dec = 0) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(dec);
}

// ── Insights Generator ───────────────────────────────────────────────────────

export function generateInsights(headers, rows, columnMeta) {
  const insights = [];
  const numericCols = columnMeta.filter((c) => c.type === 'number');
  const dateCols    = columnMeta.filter((c) => c.type === 'date');
  const textCols    = columnMeta.filter((c) => c.type === 'text');

  if (numericCols.length > 0) {
    const col = numericCols[0];
    const vals = rows.map((r) => r[col.name] ?? r[col.index]);
    const stats = numericStats(vals);

    if (stats) {
      // Max row label
      const maxRow = rows.find((r) => {
        const v = parseFloat(String(r[col.name] ?? '').replace(/[$,%]/g, '').trim());
        return Math.abs(v - stats.max) < 0.001;
      });
      const maxLabel = textCols[0] ? (maxRow?.[textCols[0].name] ?? '') : '';

      // Top % contribution
      const topPct = stats.sum > 0 ? ((stats.max / stats.sum) * 100).toFixed(1) : null;

      insights.push({
        type: 'max', label: `Highest ${col.name}`,
        value: fmt(stats.max),
        sub: maxLabel ? `${maxLabel}${topPct ? ` · ${topPct}% of total` : ''}` : `across ${stats.count} records`,
        color: 'success', icon: '📈',
      });
      insights.push({
        type: 'min', label: `Lowest ${col.name}`,
        value: fmt(stats.min),
        sub: `across ${stats.count} records`,
        color: 'danger', icon: '📉',
      });
      insights.push({
        type: 'avg', label: `Average ${col.name}`,
        value: fmt(stats.avg, 1),
        sub: `σ = ${fmt(stats.stdDev, 1)}`,
        color: 'accent', icon: '⟨x⟩',
      });

      // Growth rate
      const growth = calcGrowthRate(vals);
      if (growth !== null) {
        insights.push({
          type: 'growth', label: 'Growth Rate',
          value: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
          sub: `first → last ${col.name}`,
          color: growth >= 0 ? 'success' : 'danger', icon: growth >= 0 ? '🚀' : '📊',
        });
      }

      // Outliers
      const outlierRows = detectOutliers(rows, col.name);
      if (outlierRows.length > 0) {
        const labelKey = textCols[0]?.name || dateCols[0]?.name;
        const outlierLabels = labelKey
          ? outlierRows.slice(0, 2).map((r) => r[labelKey]).join(', ')
          : `${outlierRows.length} point(s)`;
        insights.push({
          type: 'outlier', label: 'Outliers Detected',
          value: `${outlierRows.length}`,
          sub: `e.g. ${outlierLabels}`,
          color: 'warning', icon: '⚠️',
        });
      }

      // Most consistent (only when text + repeated values)
      if (textCols.length > 0 && rows.length > numericCols.length) {
        const consistent = findMostConsistent(rows, textCols[0].name, col.name);
        if (consistent) {
          insights.push({
            type: 'consistent', label: 'Most Consistent',
            value: consistent,
            sub: `lowest variance in ${col.name}`,
            color: 'cyan', icon: '🎯',
          });
        }
      }
    }
  }

  // Multi-column totals
  numericCols.slice(1, 3).forEach((col) => {
    const vals = rows.map((r) => r[col.name] ?? r[col.index]);
    const stats = numericStats(vals);
    if (stats) {
      insights.push({
        type: 'sum', label: `Total ${col.name}`,
        value: fmt(stats.sum),
        sub: `avg ${fmt(stats.avg, 1)}`,
        color: 'cyan', icon: '∑',
      });
    }
  });

  // Date trend
  if (dateCols.length > 0 && numericCols.length > 0) {
    const numCol = numericCols[0];
    const vals = rows.map((r) => r[numCol.name] ?? r[numCol.index]);
    const trend = detectTrend(vals);
    const trendMap = { increasing: '↑ Increasing', decreasing: '↓ Decreasing', flat: '→ Stable' };
    insights.push({
      type: 'trend', label: 'Trend',
      value: trendMap[trend],
      sub: `${numCol.name} over time`,
      color: trend === 'increasing' ? 'success' : trend === 'decreasing' ? 'danger' : 'accent',
      icon: '📅',
    });
  }

  // Summary
  insights.push({
    type: 'rows', label: 'Total Records',
    value: rows.length.toLocaleString(),
    sub: `${headers.length} columns`,
    color: 'warning', icon: '🗂️',
  });

  if (textCols.length > 0) {
    const col = textCols[0];
    const unique = new Set(rows.map((r) => r[col.name] ?? r[col.index])).size;
    insights.push({
      type: 'categories', label: `Unique ${col.name}`,
      value: unique.toLocaleString(),
      sub: 'distinct values',
      color: 'accent', icon: '🏷️',
    });
  }

  return insights.slice(0, 10);
}

