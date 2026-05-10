import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import {
  Shield, Edit3, Download, X, Moon, Sun, Clock,
  Layout, Database, Table as TableIcon, Plus, RotateCcw, Copy, GripVertical, FileSpreadsheet, Image as ImageIcon, FileText,
  Zap, ShieldCheck, Ghost, Trash2, Lock, Star, Send, Maximize, Minimize
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { loginWithGoogle, logout } from './auth';
import { 
  LogOut, User as UserIcon, LogIn 
} from 'lucide-react';

import { BarChartPanel, LineChartPanel, AreaChartPanel, PieChartPanel, TableChartPanel } from './components/Charts';
import DataTable      from './components/DataTable';
import SidebarEditor  from './components/SidebarEditor';

import DownloadModal  from './components/DownloadModal';
import AddVisualModal from './components/AddVisualModal';
import AboutUs        from './components/AboutUs';
import PrivacyPolicy  from './components/PrivacyPolicy';
import ContactUs      from './components/ContactUs';

import { analyzeColumns, buildManualChartData, fmt } from './utils/dataAnalysis';
import { generateAIReport } from './utils/aiGenerator';

import './index.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const SAMPLE_CSV = `Product,Revenue,Units,Date
Alpha,12400,320,2024-01-01
Beta,9800,215,2024-02-01
Gamma,15600,410,2024-03-01
Delta,7200,180,2024-04-01
Epsilon,18900,490,2024-05-01
Zeta,11300,295,2024-06-01
Eta,14200,370,2024-07-01
Theta,16800,440,2024-08-01
Iota,9100,240,2024-09-01
Kappa,21500,560,2024-10-01`;

const CHART_MAP = {
  bar: BarChartPanel, line: LineChartPanel,
  area: AreaChartPanel, pie: PieChartPanel,
  table: TableChartPanel,
};

/* ── Layout helpers ─────────────────────────────────────────────────────────── */

function computeInitialLayouts(items) {
  const layouts = [];
  let cursorY = 0;

  const metrics = items.filter(it => it.type === 'metric');
  metrics.forEach((item, i) => {
    layouts.push({
      i: item.id,
      x: (i % 4) * 3,
      y: Math.floor(i / 4) * 2,
      w: 3, h: 2, minW: 2, minH: 2,
    });
  });
  cursorY = metrics.length > 0 ? Math.ceil(metrics.length / 4) * 2 : 0;

  const charts = items.filter(it => it.type === 'chart');
  charts.forEach((item, i) => {
    layouts.push({
      i: item.id,
      x: (i % 2) * 6,
      y: cursorY + Math.floor(i / 2) * 5,
      w: 6, h: 5, minW: 3, minH: 3,
    });
  });

  return layouts;
}

function getNewItemLayout(item, existingLayouts) {
  const isMetric = item.type === 'metric';
  let maxY = 0;
  existingLayouts.forEach(l => { if (l.y + l.h > maxY) maxY = l.y + l.h; });
  return {
    i: item.id,
    x: 0, y: maxY,
    w: isMetric ? 3 : 6,
    h: isMetric ? 2 : 5,
    minW: isMetric ? 2 : 3,
    minH: isMetric ? 2 : 3,
  };
}

/* ── Grid Item Card ─────────────────────────────────────────────────────────── */

function GridItemCard({ item, isEditMode, onEditClick, onDuplicate, onRemove, onSaveTitle }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const cardRef = useRef(null);

  const isMetric = item.type === 'metric';
  const isTable = item.config.type === 'table';
  const ChartComp = !isMetric ? (CHART_MAP[item.config.type] || BarChartPanel) : null;

  const kpiColorClass = isMetric ? `kpi-${item.config.type || 'accent'}` : '';

  const downloadAsImage = async () => {
    if (!cardRef.current) return;
    try {
      // Hide controls temporarily
      const controls = cardRef.current.querySelector('.grid-card-header');
      if (controls) controls.style.opacity = '0';
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: item.config.type === 'metric' ? null : '#ffffff',
        logging: false,
        useCORS: true
      });
      
      if (controls) controls.style.opacity = '1';
      
      canvas.toBlob((blob) => {
        saveAs(blob, `${item.config.title || 'visual'}.png`);
      });
    } catch (err) {
      console.error('Download failed', err);
    }
    setShowDownloadMenu(false);
  };

  const downloadAsCSV = () => {
    if (!isTable || !item.config.data) return;
    const csv = Papa.unparse(item.config.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${item.config.title || 'data'}.csv`);
    setShowDownloadMenu(false);
  };

  const downloadAsPDF = async () => {
    if (!cardRef.current) return;
    try {
      const controls = cardRef.current.querySelector('.grid-card-header');
      if (controls) controls.style.opacity = '0';
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: item.config.type === 'metric' ? null : '#ffffff',
        useCORS: true
      });
      
      if (controls) controls.style.opacity = '1';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${item.config.title || 'visual'}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    }
    setShowDownloadMenu(false);
  };

  return (
    <div className={`grid-item-inner ${isEditMode ? 'is-editing' : ''} ${kpiColorClass}`} ref={cardRef}>
      {/* Header / Drag Handle */}
      <div className={`grid-card-header ${isEditMode ? 'draggable-header' : ''}`}>
        <div className="grid-card-title-area">
          {isEditMode && <GripVertical size={14} className="grid-card-drag-icon" />}
          {isEditingTitle && isEditMode ? (
            <input
              autoFocus
              className="inline-title-input text-xs font-bold"
              value={tempTitle}
              placeholder="Enter title"
              onChange={e => setTempTitle(e.target.value)}
              onBlur={() => { onSaveTitle(item.id, tempTitle); setIsEditingTitle(false); }}
              onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setIsEditingTitle(false); }}
              onMouseDown={e => e.stopPropagation()}
            />
          ) : (
            <span
              className={`grid-card-title ${isEditMode ? 'editable' : ''}`}
              onClick={() => { if (isEditMode) { setTempTitle(item.config.title || ''); setIsEditingTitle(true); } }}
              title={isEditMode ? 'Click to edit title' : ''}
            >
              {item.config.title || 'Untitled'}
            </span>
          )}
        </div>

        <div className="grid-card-actions">
          {/* Download Options */}
          {!isEditMode && (
            <div className="download-dropdown-container">
              <button 
                className="icon-btn download-trigger" 
                title="Export Visual"
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              >
                <Download size={12} />
              </button>
              {showDownloadMenu && (
                <div className="download-menu" onMouseLeave={() => setShowDownloadMenu(false)}>
                  <button onClick={downloadAsImage}>
                    <ImageIcon size={12} /> PNG Image
                  </button>
                  <button onClick={downloadAsPDF}>
                    <FileText size={12} /> PDF Document
                  </button>
                  {isTable && (
                    <button onClick={downloadAsCSV}>
                      <FileSpreadsheet size={12} /> CSV Data
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {isEditMode && (
            <>
              <button className="icon-btn" title="Edit" onClick={() => onEditClick(item)}><Edit3 size={12} /></button>
              {!isMetric && <button className="icon-btn" title="Duplicate" onClick={() => onDuplicate(item)}><Copy size={12} /></button>}
              <button className="icon-btn text-danger" title="Remove" onClick={() => onRemove(item.id)}><X size={12} /></button>
            </>
          )}
        </div>
      </div>

      {/* Formula (edit mode) */}
      {isEditMode && !isMetric && item.config.dataKey && item.config.labelKey && (
        <div className="grid-card-formula">
          Formula: {item.config.aggMethod === 'custom' ? item.config.customFormula : `${(item.config.aggMethod || 'SUM').toUpperCase()}(${item.config.dataKey})`} by {item.config.labelKey}
        </div>
      )}
      {isEditMode && isMetric && (
        <div className="grid-card-formula">
          Formula: {item.config.aggMethod === 'custom' ? item.config.customFormula : `${(item.config.aggMethod || 'SUM').toUpperCase()}(${item.config.dataKey || 'value'})`}
        </div>
      )}

      {/* Body */}
      {isMetric ? (
        <>
          <div className="kpi-value">{item.config.value}</div>
        </>
      ) : (
        <div className="grid-card-body">
          <ChartComp config={item.config} />
        </div>
      )}
    </div>
  );
}

// ── Feedback Component ───────────────────────────────────────────────────
function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || comment.length < 5) return;

    setIsSubmitting(true);
    const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSexlYS1aC2Ev1Qyacyy2muHA42MRTWxBD-irukoheHxQza4dQ/formResponse";
    const formData = new FormData();
    formData.append("entry.1103747824", rating);
    formData.append("entry.710481527", comment);

    try {
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });
      setSubmitted(true);
      setRating(0);
      setComment('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Feedback failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-sidebar-wrap">
      <div className="feedback-card-premium">
        {submitted ? (
          <div className="feedback-success-state">
            <div className="success-icon-wrap">✨</div>
            <h3>Thanks for your feedback!</h3>
            <p>We appreciate your help in improving Miyamo.</p>
          </div>
        ) : (
          <>
            <div className="feedback-header">
              <h3>Share Your Feedback</h3>
              <p>Help us improve Miyamo</p>
            </div>

            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="star-rating-group">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${(hoverRating || rating) >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star size={24} fill={(hoverRating || rating) >= star ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>

              <textarea
                className="feedback-textarea"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              <button 
                type="submit" 
                className="btn-submit-feedback" 
                disabled={isSubmitting || rating === 0 || comment.length < 5}
              >
                {isSubmitting ? (
                  <span className="loading-spinner-small"></span>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>

              <div className="feedback-privacy">
                <Shield size={12} />
                <span>We never store or access your report data.</span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main App ───────────────────────────────────────────────────────────────── */


export default function App() {
  const [rawText,    setRawText]    = useState('');
  const [headers,    setHeaders]    = useState([]);
  const [rows,       setRows]       = useState([]);
  const [columnMeta, setColumnMeta] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [dark,       setDark]       = useState(false);

  const [reportTitle,     setReportTitle]     = useState('Intelligence Report');
  const [isEditingTitle,  setIsEditingTitle]  = useState(false);
  const [tempTitle,       setTempTitle]       = useState('');
  const [isDownloadOpen,  setIsDownloadOpen]  = useState(false);
  const [isAddVisualOpen, setIsAddVisualOpen] = useState(false);
  const [items,           setItems]           = useState([]);
  const [editingItem,     setEditingItem]     = useState(null);
  const [isAboutOpen,     setIsAboutOpen]     = useState(false);
  const [isPrivacyOpen,   setIsPrivacyOpen]   = useState(false);
  const [currentPath,     setCurrentPath]     = useState(window.location.pathname);
  const [appError,        setAppError]        = useState(null);
  const [isExporting,     setIsExporting]     = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reportWidth, setReportWidth] = useState(1100);
  const [reportHeight, setReportHeight] = useState('auto');
  const [resizingType, setResizingType] = useState(null); // 'width', 'height', 'both'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDataDrawerOpen, setIsDataDrawerOpen] = useState(false);

  // ── Orientation Detection (landscape = mini-desktop) ──
  const [isLandscape, setIsLandscape] = useState(
    () => window.matchMedia('(orientation: landscape) and (max-height: 600px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(orientation: landscape) and (max-height: 600px)');
    const handler = (e) => {
      setIsLandscape(e.matches);
      if (e.matches) setIsDataDrawerOpen(false); // close drawer on rotate
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Grid layout state
  const [gridLayouts, setGridLayouts] = useState([]);

  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const titleInputRef = useRef(null);
  const reportRef     = useRef(null);
  const reportCardRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      reportCardRef.current?.requestFullscreen?.().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ── Simple Routing ──
  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Manual Resizing Logic ──
  const startResizing = (e, type) => {
    e.preventDefault();
    setResizingType(type);
  };

  useEffect(() => {
    if (!resizingType) return;

    const onMouseMove = (e) => {
      if (resizingType === 'width' || resizingType === 'both') {
        const newWidth = e.clientX - reportCardRef.current.getBoundingClientRect().left;
        setReportWidth(Math.max(600, newWidth));
      }
      if (resizingType === 'height' || resizingType === 'both') {
        const newHeight = e.clientY - reportCardRef.current.getBoundingClientRect().top;
        setReportHeight(Math.max(500, newHeight));
      }
    };

    const onMouseUp = () => setResizingType(null);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizingType]);

  useEffect(() => {
    // 1. Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    // 2. Handle redirect results (for mobile browsers or blocked popups)
    import('./auth').then(({ handleRedirectResult }) => {
      handleRedirectResult();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [isEditingTitle]);

  const handleTitleClick = () => {
    if (isEditMode) { setTempTitle(reportTitle); setIsEditingTitle(true); }
  };
  const saveTitle   = () => { setReportTitle(tempTitle || 'Intelligence Report'); setIsEditingTitle(false); };
  const cancelTitle = () => setIsEditingTitle(false);

  // ── CSV Processing ────────────────────────────────────────────────────────
  const processCSV = useCallback((text) => {
    if (!text.trim()) { setHeaders([]); setRows([]); setColumnMeta([]); setItems([]); setGridLayouts([]); return; }
    setLoading(true);
    setTimeout(() => {
      try {
        const result = Papa.parse(text.trim(), { header: true, skipEmptyLines: true });
        const parsedHeaders = result.meta.fields || [];
        const parsedRows    = result.data;
        const meta          = analyzeColumns(parsedHeaders, parsedRows);
        setHeaders(parsedHeaders);
        setRows(parsedRows);
        setColumnMeta(meta);
        const generated = generateAIReport('summary', parsedHeaders, meta, parsedRows).items;
        setItems(generated);
        setGridLayouts(computeInitialLayouts(generated));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const handleColumnTypeChange = useCallback((colName, newType) => {
    setColumnMeta(prev => prev.map(c => c.name === colName ? { ...c, type: newType } : c));
  }, []);

  // ── Edit Handlers ─────────────────────────────────────────────────────────
  const handleEditClick = (item) => setEditingItem(item);

  const handleSaveItem = (updatedConfig) => {
    try {
      if (!editingItem || !updatedConfig) { setEditingItem(null); return; }

      // For table type with tableColumns, build multi-column data
      if (updatedConfig.type === 'table' && updatedConfig.tableColumns && updatedConfig.tableColumns.length > 0) {
        let tableData = rows.map(r => {
          const obj = {};
          updatedConfig.tableColumns.forEach(col => { obj[col] = r[col] ?? ''; });
          return obj;
        });
        if (updatedConfig.filterN === 'top5') tableData = tableData.slice(0, 5);
        else if (updatedConfig.filterN === 'top10') tableData = tableData.slice(0, 10);
        const finalConfig = { ...updatedConfig, data: tableData };
        setItems(prev => prev.map(it => it.id === editingItem.id ? { ...it, config: finalConfig } : it));
        setEditingItem(null);
        return;
      }

      const labelKey = updatedConfig.labelKey || updatedConfig.xCol || headers[0] || 'Unknown';
      const dataKey  = updatedConfig.dataKey  || updatedConfig.yCol || columnMeta.find(c => c.type === 'number')?.name || 'value';
      let updatedData = [];
      try {
        updatedData = buildManualChartData(rows, labelKey, dataKey, editingItem.type === 'chart' ? updatedConfig.type : 'bar',
          updatedConfig.aggMethod || 'sum', updatedConfig.filterN || 'all', updatedConfig.sortDir || 'none', updatedConfig.customFormula || '');
      } catch (err) {
        updatedData = editingItem.config?.data || [];
      }
      const finalConfig = { ...updatedConfig, labelKey, dataKey, data: updatedData };
      if (editingItem.type === 'metric') finalConfig.value = fmt((updatedData[0])?.value ?? 0);
      setItems(prev => prev.map(it => it.id === editingItem.id ? { ...it, config: finalConfig } : it));
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      setAppError('Failed to save. Please try again.');
      setEditingItem(null);
    }
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(it => it.id !== id));
    setGridLayouts(prev => prev.filter(l => l.i !== id));
  };

  const duplicateItem = (item) => {
    const clone = { ...item, id: `${item.id}-copy-${Date.now()}`,
      config: { ...item.config, title: `${item.config.title} (Copy)` } };
    setItems(prev => {
      const idx = prev.findIndex(it => it.id === item.id);
      const next = [...prev];
      next.splice(idx + 1, 0, clone);
      return next;
    });
    setGridLayouts(prev => {
      const newLayout = getNewItemLayout(clone, prev);
      return [...prev, newLayout];
    });
  };

  const handleSaveChartTitle = (id, newTitle) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, config: { ...it.config, title: newTitle } } : it));
  };

  const handleAddVisual = (newItem) => {
    setItems(prev => [...prev, newItem]);
    setGridLayouts(prev => [...prev, getNewItemLayout(newItem, prev)]);
  };

  // ── Grid Layout Change ────────────────────────────────────────────────────
  const handleLayoutChange = useCallback((newLayout) => {
    setGridLayouts(newLayout.map(l => ({
      ...l,
      minW: l.minW || 2,
      minH: l.minH || 2,
    })));
  }, []);

  const hasData = headers.length > 0 && rows.length > 0;

  // Build the layout object for ResponsiveGridLayout
  const currentLayouts = useMemo(() => {
    const layoutMap = new Map(gridLayouts.map(l => [l.i, l]));
    const allLayouts = items.map((item, idx) => {
      if (layoutMap.has(item.id)) return layoutMap.get(item.id);
      return getNewItemLayout(item, gridLayouts);
    });
    // Use a single layout for all breakpoints to ensure consistency as requested
    return { lg: allLayouts, md: allLayouts, sm: allLayouts };
  }, [items, gridLayouts]);

  if (authLoading) {
    return (
      <div className={`app-wrapper ${dark ? 'dark' : ''} auth-loading-screen`}>
        <div className="loading-spinner-main"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-gate-container">
        <div className="landing-split">
          {/* ── Left Section: Visual Infographic ── */}
          <section className="hero-visual-section">
            <div className="hero-visual-content">
              <div className="hero-visual-header">
                <img src="/logo.png" alt="Miyamo Logo" className="visual-logo-img" />
              </div>
              <div className="infographic-container">
                <img 
                  src="/hero-infographic.png" 
                  alt="Everything in Seconds Infographic" 
                  className="hero-infographic-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="infographic-placeholder">✨ Infographic Illustration Here</div>';
                  }}
                />
              </div>
            </div>
          </section>

          {/* ── Right Section: Auth ── */}
          <section className="auth-section">
            <div className="login-card-cute">
              <div className="login-cat-visual">
                <img src="/New miyamo app logo.png" alt="Miyamo Logo" className="cute-mascot-img" />
              </div>
              <div className="login-header-cute">
                <h2>Welcome to Miyamo</h2>
                <div className="cute-subtitle">FAST. PRIVATE. RELIABLE.</div>
              </div>
              
              <div className="login-actions-cute">
                <button 
                  className="btn-google-cute" 
                  onClick={async () => {
                    setIsAuthenticating(true);
                    try {
                      await loginWithGoogle();
                    } finally {
                      setIsAuthenticating(false);
                    }
                  }} 
                  disabled={isAuthenticating}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" />
                  <span>{isAuthenticating ? 'Signing you in...' : 'Continue with Google'}</span>
                </button>

                <div className="privacy-note-cute">
                  <div className="privacy-badge-icon"><Shield size={12} /></div>
                  <span>We never store or access your report data.</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-wrapper${dark ? ' dark' : ''}${isLandscape ? ' is-landscape' : ''}`}>
      {appError && (
        <div className="error-toast" onClick={() => setAppError(null)}>⚠️ {appError} (Click to dismiss)</div>
      )}

      {/* ── Navbar ── */}
      <header className="top-navbar">
        <div className="flex items-center gap-4">
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Layout size={24} />}
          </button>
          <a href="/" className="logo-link">
            <img src="/logo.png" alt="Miyamo Logo" className="miyamo-logo" onError={(e) => { 
              e.target.style.display = 'none'; 
              const fallback = document.getElementById('fallback-logo');
              if (fallback) fallback.style.display = 'flex';
            }} />
            <div id="fallback-logo" style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ color: '#8b5cf6', fontSize: '1.2rem' }}>⚡</div>
              <div className="app-name">Miyamo</div>
            </div>
            <div className="app-subtitle text-xs text-muted desktop-only" style={{ marginLeft: '1rem' }}>Data Insights Engine</div>
          </a>
        </div>

        {/* ── Center Section: Privacy Banner ── */}
        <div className="nav-center-banner desktop-only">
          <div className="privacy-pill-premium">
            <ShieldCheck size={14} className="privacy-pill-icon" />
            <p>
              This is your <strong>private workspace</strong>. Your data never leaves your control, 
              and <strong>nothing is stored</strong>, accessed, or <strong>tracked</strong>.
            </p>
            <div className="secure-pulse-dot"></div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="status-pill pill-green desktop-only"><Shield size={14} /> Encrypted</div>
          
          {user && (
            <div className="user-session-pill">
              <div className="user-avatar-wrap">
                <img src={user.photoURL} alt="User Avatar" className="user-avatar-nav" onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="avatar-fallback">${user.displayName?.[0] || user.email?.[0]}</div>`;
                }} />
              </div>
              <div className="user-meta-nav desktop-only">
                <span className="user-nav-name">{user.displayName || 'Analyst'}</span>
                <span className="user-nav-email">{user.email}</span>
              </div>
              <div className="user-actions-divider"></div>
              <button className="nav-action-btn logout-btn" title="Sign Out" onClick={logout}>
                <LogOut size={16} />
              </button>
            </div>
          )}

          <button className="nav-action-btn theme-btn" title="Toggle Theme" onClick={() => { setDark(!dark); setIsMobileMenuOpen(false); }}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      {currentPath === '/contact' ? (
        <ContactUs />
      ) : currentPath === '/about' ? (
        <AboutUs onTryNow={() => navigateTo('/')} />
      ) : currentPath === '/privacy' ? (
        <PrivacyPolicy />
      ) : (
        <main className="app-main">

        {/* Left Sidebar */}
        <aside className={`sidebar-left ${isMobileMenuOpen ? 'mobile-open' : ''} ${!isSidebarVisible ? 'collapsed' : ''}`}>
          <section className="card-premium">
            <div className="section-label"><Database size={12} /> Paste your data</div>
            <div className="flex justify-between mb-4">
              <span className="text-xs font-bold">CSV / Tabular Data</span>
              <div className="flex gap-2">
                <button className="btn btn-ghost" onClick={() => { setRawText(SAMPLE_CSV); processCSV(SAMPLE_CSV); }}>
                  <Plus size={14} /> Load Sample
                </button>
                <button className="btn btn-danger-ghost" onClick={() => { setRawText(''); processCSV(''); }}>
                  <RotateCcw size={14} /> Clear
                </button>
              </div>
            </div>
            <textarea
              className="textarea-sidebar"
              placeholder="Paste CSV data here..."
              value={rawText}
              onChange={e => { setRawText(e.target.value); processCSV(e.target.value); }}
            />
          </section>

          {hasData && (
            <section className="card-premium">
              <div className="section-label"><TableIcon size={12} /> Data Preview</div>
              <DataTable headers={headers} rows={rows} columnMeta={columnMeta} onColumnTypeChange={handleColumnTypeChange} />
            </section>
          )}

          <SidebarEditor
            editingItem={editingItem}
            onSave={handleSaveItem}
            onCancel={() => setEditingItem(null)}
            onDelete={removeItem}
            columnMeta={columnMeta}
            headers={headers}
          />

          <FeedbackForm />
        </aside>

        {/* Divider with Toggle Button */}
        <div className="sidebar-divider desktop-only" onClick={() => setIsSidebarVisible(!isSidebarVisible)}>
          <div className="sidebar-toggle-line" title={isSidebarVisible ? "Hide Panel" : "Show Panel"}>
            {isSidebarVisible ? <X size={14} /> : <Database size={14} />}
          </div>
        </div>

        {/* Right Canvas */}
        <section className={`content-right ${isFullscreen ? 'fullscreen-active' : ''}`}>

          <div 
            className={`report-card ${isFullscreen ? 'is-fullscreen' : ''} ${resizingType ? 'is-resizing' : ''}`} 
            ref={reportCardRef}
            style={!isFullscreen ? { width: `${reportWidth}px`, height: reportHeight === 'auto' ? 'auto' : `${reportHeight}px` } : {}}
          >
            {/* Custom Resizer Handles - desktop only */}
            {!isFullscreen && (
              <>
                <div className="report-resizer-right" onMouseDown={(e) => startResizing(e, 'width')} />
                <div className="report-resizer-bottom" onMouseDown={(e) => startResizing(e, 'height')} />
                <div className="report-resizer-corner" onMouseDown={(e) => startResizing(e, 'both')} />
              </>
            )}

            <div className="report-header-row">
              <h2 className="app-name">Visualisation Report</h2>
              
              <div className="report-header-actions">
                {/* Premium Full Screen Button */}
                <button 
                  className={`btn-report-action btn-fullscreen-premium ${isFullscreen ? 'is-active' : ''}`}
                  onClick={toggleFullscreen}
                  data-tooltip={isFullscreen ? "Exit full screen" : "Expand report to full screen"}
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                  <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
                </button>

                {isEditMode && (
                  <button className="btn-report-action btn-ghost" onClick={() => setIsAddVisualOpen(true)}>
                    <Plus size={16} /> <span>Add Visual</span>
                  </button>
                )}
                <button className={`btn-report-action btn-ghost ${isEditMode ? 'active-edit' : ''}`} onClick={() => setIsEditMode(!isEditMode)}>
                  <Edit3 size={16} /> <span>{isEditMode ? 'Done Editing' : 'Edit Report'}</span>
                </button>
                <button className="btn-report-action btn-lavender" onClick={() => setIsDownloadOpen(true)}>
                  <Download size={16} /> <span>Download</span>
                </button>
              </div>
            </div>

            <div className="report-inner-canvas" ref={reportRef}>
              {!hasData ? (
                <div className="centered-empty">
                  <Layout size={48} className="mb-4 opacity-20" />
                  <p>Paste your data to generate a report</p>
                </div>
              ) : (
                <>
                  {/* Title */}
                  <div className="title-edit-wrapper">
                    {isEditingTitle && isEditMode ? (
                      <input ref={titleInputRef} className="report-title-input" value={tempTitle}
                        onChange={e => setTempTitle(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') cancelTitle(); }}
                      />
                    ) : (
                      <h1 className={`report-title-center ${isEditMode ? 'editable-hover' : ''}`} onClick={handleTitleClick}>
                        {reportTitle}
                      </h1>
                    )}
                  </div>

                  {/* ── Grid Layout for ALL items ── */}
                  <Responsive
                    className="layout"
                    layouts={currentLayouts}
                    width={isFullscreen ? window.innerWidth - 60 : reportWidth - 112} // Adjusted for padding: (2.5rem card + 1rem canvas) * 2
                    breakpoints={{ lg: 0 }} // Disable breakpoints to prevent reflow
                    cols={{ lg: 12 }}
                    rowHeight={60}
                    margin={[12, 12]}
                    containerPadding={[8, 8]}
                    isDraggable={isEditMode}
                    isResizable={isEditMode}
                    draggableHandle=".draggable-header"
                    compactType="vertical"
                    onLayoutChange={(layout) => handleLayoutChange(layout)}
                    useCSSTransforms={!isExporting}
                  >
                    {items.map(item => (
                      <div key={item.id} className={item.type === 'metric' ? 'kpi-grid-item' : ''}>
                        <GridItemCard
                          item={item}
                          isEditMode={isEditMode}
                          onEditClick={handleEditClick}
                          onDuplicate={duplicateItem}
                          onRemove={removeItem}
                          onSaveTitle={handleSaveChartTitle}
                        />
                      </div>
                    ))}
                  </Responsive>
                </>
              )}
            </div>
            

          </div>
        </section>
      </main>
      )}

      {/* ── Mobile Data Drawer ── */}
      {isDataDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsDataDrawerOpen(false)} />
      )}
      <div className={`mobile-data-drawer ${isDataDrawerOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-handle" onClick={() => setIsDataDrawerOpen(false)}>
          <div className="drawer-pill" />
          <span>Data Input</span>
          <button className="drawer-close-btn" onClick={() => setIsDataDrawerOpen(false)}><X size={18} /></button>
        </div>
        <div className="mobile-drawer-body">
          <div className="section-label"><Database size={12} /> Paste your data</div>
          <div className="flex justify-between mb-4">
            <span className="text-xs font-bold">CSV / Tabular Data</span>
            <div className="flex gap-2">
              <button className="btn btn-ghost" onClick={() => { setRawText(SAMPLE_CSV); processCSV(SAMPLE_CSV); setIsDataDrawerOpen(false); }}>
                <Plus size={14} /> Sample
              </button>
              <button className="btn btn-danger-ghost" onClick={() => { setRawText(''); processCSV(''); }}>
                <RotateCcw size={14} /> Clear
              </button>
            </div>
          </div>
          <textarea
            className="textarea-sidebar"
            placeholder="Paste CSV data here..."
            value={rawText}
            onChange={e => { setRawText(e.target.value); processCSV(e.target.value); }}
            style={{ minHeight: '160px' }}
          />
          {hasData && (
            <div style={{ marginTop: '1rem' }}>
              <div className="section-label"><TableIcon size={12} /> Data Preview</div>
              <DataTable headers={headers} rows={rows} columnMeta={columnMeta} onColumnTypeChange={handleColumnTypeChange} />
            </div>
          )}
          <button
            className="btn-lavender mobile-drawer-done"
            onClick={() => setIsDataDrawerOpen(false)}
            style={{ marginTop: '1.5rem', width: '100%', padding: '0.85rem', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            Done — View Report
          </button>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div className="mobile-bottom-bar">
        <button
          className={`mobile-bar-btn ${isDataDrawerOpen ? 'active' : ''}`}
          onClick={() => setIsDataDrawerOpen(!isDataDrawerOpen)}
        >
          <Database size={20} />
          <span>Data</span>
        </button>
        <button
          className={`mobile-bar-btn ${isEditMode ? 'active' : ''}`}
          onClick={() => setIsEditMode(!isEditMode)}
        >
          <Edit3 size={20} />
          <span>{isEditMode ? 'Done' : 'Edit'}</span>
        </button>
        {isEditMode && (
          <button
            className="mobile-bar-btn mobile-bar-btn-primary"
            onClick={() => setIsAddVisualOpen(true)}
          >
            <Plus size={22} />
            <span>Add</span>
          </button>
        )}
        <button
          className="mobile-bar-btn"
          onClick={() => setIsDownloadOpen(true)}
        >
          <Download size={20} />
          <span>Export</span>
        </button>
        <button
          className="mobile-bar-btn"
          onClick={() => { setDark(!dark); }}
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
          <span>Theme</span>
        </button>
      </div>

      <footer className="app-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', borderTop: '1px solid var(--border)' }}>
        <div className="footer-links" style={{ display: 'flex', gap: '1.5rem' }}>
          <button onClick={() => navigateTo('/about')} className="footer-link-btn">About Us</button>
          <button onClick={() => navigateTo('/privacy')} className="footer-link-btn">Privacy Policy</button>
          <button onClick={() => navigateTo('/contact')} className="footer-link-btn">Contact Us</button>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
          Miyamo · 100% client-side · No servers, no cookies, no tracking
        </div>
      </footer>

      <DownloadModal 
        isOpen={isDownloadOpen} 
        onClose={() => setIsDownloadOpen(false)} 
        reportRef={reportRef} 
        title={reportTitle} 
        setIsExporting={setIsExporting}
      />
      <AddVisualModal isOpen={isAddVisualOpen} onClose={() => setIsAddVisualOpen(false)}
        onAdd={handleAddVisual} columnMeta={columnMeta} rows={rows} headers={headers} />
    </div>
  );
}
