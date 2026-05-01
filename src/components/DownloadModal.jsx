import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Download, 
  CheckCircle,
  Loader2,
  FileBox,
  Heart,
  Coffee,
  Utensils,
  Pizza,
  Zap,
  Shield,
  QrCode
} from 'lucide-react';
import { useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import pptxgen from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

const DownloadModal = ({ isOpen, onClose, reportRef, title, setIsExporting }) => {
  const [loading, setLoading] = useState(null); // 'pdf', 'png', etc.
  const [done, setDone] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [supportCount, setSupportCount] = useState(120 + Math.floor(Math.random() * 15));

  const donationTiers = [
    { amount: 10, label: "Coffee", icon: "☕" },
    { amount: 20, label: "Snack", icon: "🥪" },
    { amount: 50, label: "Lunch", icon: "🍛" },
    { amount: 100, label: "Dinner", icon: "🍽️" }
  ];

  if (!isOpen) return null;

  const captureReport = async () => {
    if (!reportRef.current) return null;

    const element = reportRef.current;
    
    // 1. Store original styles to restore later
    const originalStyle = {
      height: element.style.height,
      overflow: element.style.overflow,
      maxHeight: element.style.maxHeight,
      position: element.style.position
    };

    // 2. Temporarily expand container to full height for capture
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    element.style.maxHeight = 'none';
    element.style.position = 'relative';

    // 3. Ensure we start from the top
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    // 4. Wait for layout settling and charts to render
    // Increased to 2s to allow for transform -> top/left recalculation
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: document.body.scrollWidth,
        windowHeight: document.body.scrollHeight,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          // Disable transitions in the clone to avoid mid-animation captures
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            el.style.transition = 'none';
            el.style.animation = 'none';
            el.style.willChange = 'auto';
          });

          // Ensure grid items are fully visible in the clone
          const gridItems = clonedDoc.querySelectorAll('.react-grid-item');
          gridItems.forEach(item => {
            item.style.visibility = 'visible';
            item.style.opacity = '1';
            item.style.display = 'block';
          });
        }
      });

      // 5. Restore original styles and scroll
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
      element.style.maxHeight = originalStyle.maxHeight;
      element.style.position = originalStyle.position;
      window.scrollTo(0, originalScrollY);

      return canvas;
    } catch (err) {
      console.error('Capture failed', err);
      // Restore on error
      element.style.height = originalStyle.height;
      element.style.overflow = originalStyle.overflow;
      element.style.maxHeight = originalStyle.maxHeight;
      element.style.position = originalStyle.position;
      window.scrollTo(0, originalScrollY);
      return null;
    }
  };

  const exportPNG = async () => {
    setLoading('png');
    setIsExporting(true);
    const canvas = await captureReport();
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setDone(prev => [...prev, 'png']);
    }
    setIsExporting(false);
    setLoading(null);
  };

  const exportJPEG = async () => {
    setLoading('jpeg');
    setIsExporting(true);
    const canvas = await captureReport();
    if (canvas) {
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
      setDone(prev => [...prev, 'jpeg']);
    }
    setIsExporting(false);
    setLoading(null);
  };

  const exportPDF = async () => {
    setLoading('pdf');
    setIsExporting(true);
    const canvas = await captureReport();
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${title.replace(/\s+/g, '_')}.pdf`);
      setDone(prev => [...prev, 'pdf']);
    }
    setIsExporting(false);
    setLoading(null);
  };

  const exportPPT = async () => {
    setLoading('ppt');
    setIsExporting(true);
    const canvas = await captureReport();
    if (canvas) {
      const pptx = new pptxgen();
      const slide = pptx.addSlide();
      slide.addImage({ 
        data: canvas.toDataURL('image/png'), 
        x: 0, y: 0, w: '100%', h: '100%' 
      });
      pptx.writeFile({ fileName: `${title.replace(/\s+/g, '_')}.pptx` });
      setDone(prev => [...prev, 'ppt']);
    }
    setIsExporting(false);
    setLoading(null);
  };

  const exportWord = async () => {
    setLoading('word');
    setIsExporting(true);
    const canvas = await captureReport();
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: title, bold: true, size: 48 }),
              ],
            }),
            new Paragraph({
              children: [
                new ImageRun({
                  data: imgData,
                  transformation: { width: 600, height: 400 }
                })
              ]
            })
          ]
        }]
      });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${title.replace(/\s+/g, '_')}.docx`);
      setDone(prev => [...prev, 'word']);
    }
    setIsExporting(false);
    setLoading(null);
  };

  const downloadAll = async () => {
    await exportPNG();
    await exportJPEG();
    await exportPDF();
    await exportPPT();
    await exportWord();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-surface" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2 className="visual-title">Export Report</h2>
          <button className="action-btn" onClick={onClose}><X size={18} /></button>
        </header>

        <div className="modal-body">
          {/* ── High-Conversion Support Section ── */}
          <div className="support-gateway-card">
            <div className="support-header">
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                This report saved you time. <br/>
                <span className="text-primary">Support Miyamo ❤️</span>
              </h3>
              <div className="social-proof-pill">
                <Zap size={10} className="fill-yellow-500 text-yellow-500" />
                <span>🔥 {supportCount} people supported today</span>
              </div>
            </div>

            <div className="micro-donation-grid">
              {donationTiers.map((tier) => (
                <button 
                  key={tier.amount}
                  className={`tier-btn ${selectedAmount === tier.amount ? 'active' : ''}`}
                  onClick={() => setSelectedAmount(tier.amount)}
                >
                  <span className="tier-icon">{tier.icon}</span>
                  <span className="tier-amt">₹{tier.amount}</span>
                  <span className="tier-label">{tier.label}</span>
                </button>
              ))}
            </div>

            <div className="qr-action-zone">
              <div className="qr-visual-wrap">
                <div className="qr-pulse-ring"></div>
                <div className="qr-box-premium">
                  <img src="/UPI.jpeg" alt="UPI QR Code" className="qr-image" />
                </div>
              </div>
              <div className="qr-text-meta">
                <h4 className="font-extrabold text-slate-900">Scan & Support Instantly</h4>
                <p className="text-xs text-slate-500 font-medium mb-2">Takes less than 10 seconds via UPI</p>
                {selectedAmount ? (
                  <div className="selected-status-msg active">
                    <span className="sparkle-icon">✨</span>
                    Scan the QR to complete your support <b>₹{selectedAmount}</b> ❤️
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Select an amount to start</p>
                )}
              </div>
            </div>

            <div className="support-footer">
              <p className="urgency-note">Your support helps us keep Miyamo free and running for everyone.</p>
              <div className="support-privacy-minimal">
                <Shield size={10} />
                <span>Private & Secure • Report data never stored</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mb-4 uppercase font-black tracking-[0.2em] text-center">Ready to Download?</p>
          
          <div className="export-options-grid">
            <ExportOption 
              icon={<ImageIcon className="text-blue-500" />} 
              label="PNG Image" 
              onClick={exportPNG} 
              isLoading={loading === 'png'}
              isDone={done.includes('png')}
            />
            <ExportOption 
              icon={<ImageIcon className="text-orange-500" />} 
              label="JPEG Image" 
              onClick={exportJPEG} 
              isLoading={loading === 'jpeg'}
              isDone={done.includes('jpeg')}
            />
            <ExportOption 
              icon={<FileText className="text-red-500" />} 
              label="PDF Document" 
              onClick={exportPDF} 
              isLoading={loading === 'pdf'}
              isDone={done.includes('pdf')}
            />
            <ExportOption 
              icon={<FileBox className="text-orange-600" />} 
              label="PowerPoint (PPT)" 
              onClick={exportPPT} 
              isLoading={loading === 'ppt'}
              isDone={done.includes('ppt')}
            />
            <ExportOption 
              icon={<FileCode className="text-blue-700" />} 
              label="Word Document" 
              onClick={exportWord} 
              isLoading={loading === 'word'}
              isDone={done.includes('word')}
            />
          </div>
        </div>

        <footer className="flex flex-col gap-3 pt-6 border-t mt-4">
          <button className="btn btn-primary w-full justify-center py-3" onClick={downloadAll}>
            <Download size={16} /> Download All Formats
          </button>
          <button className="btn btn-ghost w-full justify-center" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>

      <style jsx>{`
        .export-options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
        }
        .text-blue-500 { color: #3b82f6; }
        .text-orange-500 { color: #f97316; }
        .text-red-500 { color: #ef4444; }
        .text-orange-600 { color: #ea580c; }
        .text-blue-700 { color: #1d4ed8; }
        .w-full { width: 100%; }
        .justify-center { justify-content: center; }
        .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }

        .support-gateway-card {
          background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
          border: 2px solid #f1f5f9;
          border-radius: 32px;
          padding: 2.25rem 1.75rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s;
        }

        .support-gateway-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.06);
        }

        .social-proof-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #fff;
          border: 1px solid #f1f5f9;
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          font-size: 0.65rem;
          font-weight: 800;
          color: #64748b;
          margin-top: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
        }

        .micro-donation-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.6rem;
          margin: 1.5rem 0;
        }

        .tier-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          background: #fff;
          border: 2px solid #f1f5f9;
          padding: 1rem 0.5rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .tier-btn:hover {
          background: #fff;
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(132, 148, 255, 0.15);
        }

        .tier-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
          transform: scale(1.08);
          box-shadow: 0 12px 24px rgba(132, 148, 255, 0.35);
        }

        .tier-icon { font-size: 1.25rem; margin-bottom: 0.15rem; }
        .tier-amt { font-weight: 900; font-size: 0.95rem; line-height: 1; }
        .tier-label { font-size: 0.6rem; font-weight: 800; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }
        .tier-btn.active .tier-label { opacity: 1; color: rgba(255,255,255,0.9); }

        .qr-action-zone {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: #fff;
          padding: 1.25rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          margin-bottom: 1.5rem;
        }

        .qr-visual-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .qr-box-premium {
          position: relative;
          z-index: 2;
          width: 88px;
          height: 88px;
          background: #fff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          overflow: hidden;
        }

        .qr-image {
          width: 92%;
          height: 92%;
          object-fit: contain;
          border-radius: 8px;
        }


        .qr-pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          background: var(--primary);
          border-radius: 16px;
          opacity: 0.15;
          animation: qrPulse 2s infinite;
        }

        @keyframes qrPulse {
          0% { transform: translate(-50%, -50%) scale(0.95); opacity: 0.2; }
          70% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(0.95); opacity: 0; }
        }

        .qr-text-meta { flex: 1; }
        .qr-text-meta h4 { font-size: 0.95rem; margin-bottom: 0.15rem; }
        
        .selected-status-msg {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e1b4b;
          line-height: 1.4;
          padding: 0.6rem 0.8rem;
          background: #f1f5f9;
          border-radius: 12px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease-out;
        }

        .selected-status-msg.active {
          opacity: 1;
          transform: translateY(0);
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
        }

        .sparkle-icon {
          display: inline-block;
          margin-right: 0.4rem;
          animation: sparkle 1s ease-in-out infinite alternate;
        }

        @keyframes sparkle {
          from { transform: scale(1) rotate(0deg); opacity: 1; }
          to { transform: scale(1.2) rotate(10deg); opacity: 0.8; }
        }

        .support-footer { text-align: center; }
        .urgency-note {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94a3b8;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .support-privacy-minimal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-size: 0.55rem;
          color: #cbd5e1;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
};

const ExportOption = ({ icon, label, onClick, isLoading, isDone }) => (
  <button className="export-choice-item" onClick={onClick} disabled={isLoading}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="font-semibold text-sm">{label}</span>
    </div>
    {isLoading ? <Loader2 size={16} className="animate-spin text-primary" /> : 
     isDone ? <CheckCircle size={16} className="text-success" /> : 
     <Download size={16} className="text-dim" />}
    
    <style jsx>{`
      .export-choice-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.875rem 1rem;
        background: #f8fafc;
        border: 1px solid var(--border);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .export-choice-item:hover { border-color: var(--primary); background: #fff; transform: translateX(4px); }
      .export-choice-item:disabled { opacity: 0.7; cursor: not-allowed; }
      .animate-spin { animation: spin 1s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `}</style>
  </button>
);

export default DownloadModal;
