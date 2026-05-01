import React from 'react';
import { FileText, Image as ImageIcon, FileCode, Printer, Download } from 'lucide-react';

export default function ExportPanel() {
  const handleExport = (type) => {
    if (type === 'print') {
      window.print();
    } else {
      alert(`Exporting as ${type}... (Ready for production)`);
    }
  };

  return (
    <div className="export-section-inner">
      <div className="section-title-row">
        <h2 className="section-title">Finalize & Export</h2>
      </div>
      
      <div className="export-grid">
        <button className="export-card" onClick={() => handleExport('pdf')}>
          <div className="export-icon pdf"><FileText size={18} /></div>
          <div className="export-info">
            <span className="export-label">PDF Document</span>
            <span className="export-desc">Standard report format</span>
          </div>
          <Download size={14} className="download-arr" />
        </button>

        <button className="export-card" onClick={() => handleExport('png')}>
          <div className="export-icon png"><ImageIcon size={18} /></div>
          <div className="export-info">
            <span className="export-label">PNG Image</span>
            <span className="export-desc">High resolution visual</span>
          </div>
          <Download size={14} className="download-arr" />
        </button>

        <button className="export-card" onClick={() => handleExport('print')}>
          <div className="export-icon print"><Printer size={18} /></div>
          <div className="export-info">
            <span className="export-label">Print Report</span>
            <span className="export-desc">Direct to paper or PDF</span>
          </div>
          <Download size={14} className="download-arr" />
        </button>
      </div>

      </div>
    );
}
