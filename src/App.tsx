import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Upload,
  Globe,
  Sliders,
  Code2,
  Check,
  Copy,
  Layers,
  Zap,
  Volume2,
  ShieldCheck,
  ExternalLink,
  FileText,
  Share2,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { PdfFlipbook } from './react/PdfFlipbook';

export function App() {
  // Source State: URL or File
  const [pdfSource, setPdfSource] = useState<string | File>('/sample.pdf');
  const [fileName, setFileName] = useState<string>('sample.pdf');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Configurator Drawer Overlay (Hidden by default)
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Hero Tab: 'upload' | 'url'
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [remoteUrlInput, setRemoteUrlInput] = useState<string>('');

  // Configurable Props State
  const [config, setConfig] = useState({
    theme: 'dark' as 'dark' | 'light' | 'wood',
    mode: 'auto' as 'auto' | 'single' | 'double',
    stageHeight: 'medium' as 'compact' | 'medium' | 'large' | 'viewport',
    accentColor: '#6366f1',
    showLogo: true,
    showToolbar: true,
    showSidebar: true,
    showNavigation: true,
    showSearch: true,
    showOutline: true,
    showBookmarks: true,
    showThumbnails: true,
    showAiSummary: true,
    showZoom: true,
    showPrint: true,
    showSound: true,
    showFullscreen: true,
    showThemeToggle: true,
    showViewToggle: true,
    showFileUpload: true,
    showUrlInput: true
  });

  // Global hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to validate PDF files reliably across OS / browsers
  const isPdfFile = (file: File) => {
    if (!file) return false;
    return (
      file.type === 'application/pdf' ||
      file.type.includes('pdf') ||
      file.name.toLowerCase().endsWith('.pdf') ||
      !file.type
    );
  };

  // Auto-detect ?pdf= or ?url= or ?src= from query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('pdf') || params.get('url') || params.get('src');
      if (urlParam) {
        setPdfSource(urlParam);
        const name = urlParam.split('/').pop()?.split('?')[0] || 'remote-document.pdf';
        setFileName(decodeURIComponent(name));
        setTimeout(() => {
          document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
        }, 400);
      }
    }
  }, []);

  const handleFileUpload = (file: File) => {
    if (isPdfFile(file)) {
      setPdfSource(file);
      setFileName(file.name);
      document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRemoteUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = remoteUrlInput.trim();
    if (clean) {
      setPdfSource(clean);
      const name = clean.split('/').pop()?.split('?')[0] || 'remote-document.pdf';
      setFileName(decodeURIComponent(name));
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('pdf', clean);
      window.history.pushState({}, '', newUrl.toString());
      document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyShareLink = () => {
    let shareUrl = window.location.origin + window.location.pathname;
    if (typeof pdfSource === 'string' && /^https?:\/\//i.test(pdfSource)) {
      shareUrl += `?pdf=${encodeURIComponent(pdfSource)}`;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  const stageHeightClasses = {
    compact: 'min-h-[580px] h-[580px]',
    medium: 'min-h-[720px] h-[720px]',
    large: 'min-h-[860px] h-[860px]',
    viewport: 'min-h-[calc(100vh-100px)] h-[calc(100vh-100px)]'
  };

  const accentPresets = [
    { name: 'Indigo', hex: '#6366f1' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Monochrome', hex: '#f8fafc' },
  ];

  const generateReactCode = () => {
    const propLines = [
      `  src="${typeof pdfSource === 'string' ? pdfSource : fileName}"`,
      config.theme !== 'dark' ? `  theme="${config.theme}"` : null,
      config.mode !== 'auto' ? `  mode="${config.mode}"` : null,
      config.accentColor !== '#6366f1' ? `  accentColor="${config.accentColor}"` : null,
      !config.showLogo ? `  showLogo={false}` : null,
      !config.showToolbar ? `  showToolbar={false}` : null,
      !config.showSidebar ? `  showSidebar={false}` : null,
      !config.showSearch ? `  showSearch={false}` : null,
      !config.showAiSummary ? `  showAiSummary={false}` : null,
      !config.showBookmarks ? `  showBookmarks={false}` : null,
      !config.showThumbnails ? `  showThumbnails={false}` : null,
      !config.showSound ? `  showSound={false}` : null,
      !config.showZoom ? `  showZoom={false}` : null,
      !config.showPrint ? `  showPrint={false}` : null,
      !config.showThemeToggle ? `  showThemeToggle={false}` : null,
      !config.showViewToggle ? `  showViewToggle={false}` : null,
      !config.showUrlInput ? `  showUrlInput={false}` : null,
    ].filter(Boolean).join('\n');

    return `import { PdfFlipbook } from 'pdf-html5-page-flip/react';
import 'pdf-html5-page-flip/style.css';

export default function MyViewer() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PdfFlipbook
${propLines}
        onPageChange={(page, total) => console.log(\`Page \${page}/\${total}\`)}
      />
    </div>
  );
}`;
  };

  // Derive unique key for clean React remounting upon document source change
  const flipbookKey = typeof pdfSource === 'string'
    ? pdfSource
    : `${pdfSource.name}-${pdfSource.lastModified}-${pdfSource.size}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Global Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f);
          e.target.value = '';
        }}
      />

      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md transition-colors"
            style={{ backgroundColor: config.accentColor }}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-white">
            Page Flip <span style={{ color: config.accentColor }}>Pro</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#studio" className="hover:text-white transition-colors">Studio</a>
          <button
            onClick={() => setShowConfigDrawer(true)}
            className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
          >
            <Sliders className="w-3.5 h-3.5" style={{ color: config.accentColor }} />
            <span>Configurator</span>
          </button>
          <a href="#code" className="hover:text-white transition-colors">React API</a>
          <a href="#features" className="hover:text-white transition-colors">Architecture</a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/iamapinan/pdf-html5-page-flip"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-1.5 text-white rounded-lg text-xs font-semibold transition-all shadow-md cursor-pointer"
            style={{ backgroundColor: config.accentColor }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 lg:pt-20 lg:pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: config.accentColor }} />
          <span>Local Files & Remote URLs • Zero Server Storage</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
          Turn Any PDF into a Realistic <br />
          <span style={{ color: config.accentColor }}>3D HTML5 Flipbook</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Open local files instantly or paste public URLs. 60 FPS hardware page-turn physics, memory virtualization, audio synthesis, and AI insights in 100% client-side code.
        </p>

        {/* Dual Mode Upload Card */}
        <div className="max-w-xl mx-auto bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl p-5 text-left">
          {/* Tabs */}
          <div className="flex border-b border-white/10 pb-3 mb-4 gap-4 text-xs font-medium">
            <button
              onClick={() => setInputMode('upload')}
              className={`flex items-center gap-2 pb-2 -mb-3.5 border-b-2 transition-all cursor-pointer ${
                inputMode === 'upload' ? 'text-white font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
              style={{ borderColor: inputMode === 'upload' ? config.accentColor : 'transparent' }}
            >
              <Upload className="w-4 h-4" style={{ color: config.accentColor }} />
              <span>Upload Local PDF</span>
            </button>
            <button
              onClick={() => setInputMode('url')}
              className={`flex items-center gap-2 pb-2 -mb-3.5 border-b-2 transition-all cursor-pointer ${
                inputMode === 'url' ? 'border-emerald-500 text-white font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Open Remote URL</span>
            </button>
          </div>

          {inputMode === 'upload' ? (
            /* Upload Dropzone */
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileUpload(f);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-white/20 bg-white/5 hover:bg-white/10 p-6 rounded-lg transition-all text-center cursor-pointer group"
            >
              <div
                className="w-10 h-10 border border-white/15 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform"
                style={{ color: config.accentColor }}
              >
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-semibold text-white mb-1">
                Drop your PDF file here, or <span className="underline decoration-white/40" style={{ color: config.accentColor }}>browse files</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                100% Client-Side • Your document never leaves your machine
              </p>
            </div>
          ) : (
            /* Remote URL Form */
            <form onSubmit={handleRemoteUrlSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-400 text-xs mb-1 font-medium">Public Remote PDF URL</label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/document.pdf"
                    value={remoteUrlInput}
                    onChange={e => setRemoteUrlInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 pr-9"
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>Try sample remote link:</span>
                <button
                  type="button"
                  onClick={() => {
                    const url = 'https://raw.githubusercontent.com/iamapinan/pdf-html5-page-flip/master/public/sample.pdf';
                    setRemoteUrlInput(url);
                  }}
                  className="px-2 py-0.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 border border-white/5 cursor-pointer"
                >
                  Technical Architecture Guide
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Load Remote PDF</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Live Studio (Configurable Display Area Height) */}
      <section id="studio" className="px-4 sm:px-8 lg:px-12 pb-20 max-w-[1440px] mx-auto">
        <div className={`bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${stageHeightClasses[config.stageHeight]} w-full transition-all duration-300`}>
          {/* Viewer Top Action Bar */}
          <div className="h-11 px-4 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 shrink-0" style={{ color: config.accentColor }} />
              <span className="text-slate-200 font-medium truncate max-w-xs">{fileName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyShareLink}
                title="Share Direct Flipbook Link"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-slate-200 cursor-pointer transition-colors"
              >
                {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" style={{ color: config.accentColor }} />}
                <span className="hidden sm:inline">{copiedShareLink ? 'Link Copied!' : 'Share Link'}</span>
              </button>

              {/* Props Configurator Overlay Trigger */}
              <button
                onClick={() => setShowConfigDrawer(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1 text-white rounded font-medium cursor-pointer transition-colors shadow-sm"
                style={{ backgroundColor: config.accentColor }}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Configure Props</span>
              </button>
            </div>
          </div>

          {/* Embedded React Component with 100% Height & Min-H-0 */}
          <div className="flex-1 min-h-0 h-full relative">
            <PdfFlipbook
              key={flipbookKey}
              src={pdfSource}
              theme={config.theme}
              mode={config.mode}
              accentColor={config.accentColor}
              showLogo={config.showLogo}
              showToolbar={config.showToolbar}
              showSidebar={config.showSidebar}
              showNavigation={config.showNavigation}
              showSearch={config.showSearch}
              showOutline={config.showOutline}
              showBookmarks={config.showBookmarks}
              showThumbnails={config.showThumbnails}
              showAiSummary={config.showAiSummary}
              showZoom={config.showZoom}
              showPrint={config.showPrint}
              showSound={config.showSound}
              showFullscreen={config.showFullscreen}
              showThemeToggle={config.showThemeToggle}
              showViewToggle={config.showViewToggle}
              showFileUpload={config.showFileUpload}
              showUrlInput={config.showUrlInput}
              onFileSelect={(file) => {
                setPdfSource(file);
                setFileName(file.name);
              }}
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Props Configurator Overlay Drawer */}
      {showConfigDrawer && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowConfigDrawer(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <aside
            id="configurator"
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-white/10 shadow-2xl p-6 flex flex-col text-xs overflow-y-auto animate-in slide-in-from-right duration-250"
            role="dialog"
            aria-label="Props Configurator"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4" style={{ color: config.accentColor }} />
                <h2 className="font-semibold text-white text-sm">Props Configurator</h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono border"
                  style={{ color: config.accentColor, borderColor: `${config.accentColor}40`, backgroundColor: `${config.accentColor}15` }}
                >
                  Live Sync
                </span>
                <button
                  onClick={() => setShowConfigDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close configurator"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Display Area Height */}
            <div className="mb-5 border-b border-white/10 pb-5">
              <label className="block text-slate-400 text-[11px] font-medium mb-1.5">Display Area Height</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'compact', label: 'Compact (580px)' },
                  { key: 'medium', label: 'Medium (720px)' },
                  { key: 'large', label: 'Large (860px)' },
                  { key: 'viewport', label: 'Full Viewport' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setConfig(c => ({ ...c, stageHeight: key as any }))}
                    className={`py-1.5 px-2 rounded font-medium cursor-pointer transition-colors text-center ${
                      config.stageHeight === key ? 'text-white' : 'bg-black/30 text-slate-400 hover:text-white'
                    }`}
                    style={{ backgroundColor: config.stageHeight === key ? config.accentColor : undefined }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coloring & Accent Swatches */}
            <div className="mb-5 border-b border-white/10 pb-5">
              <label className="block text-slate-400 text-[11px] font-medium mb-2">Accent Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {accentPresets.map(({ name, hex }) => (
                  <button
                    key={hex}
                    onClick={() => setConfig(c => ({ ...c, accentColor: hex }))}
                    title={name}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 flex items-center justify-center ${
                      config.accentColor === hex ? 'border-white scale-110 shadow-md' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {config.accentColor === hex && (
                      <Check className={`w-3.5 h-3.5 ${hex === '#f8fafc' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme & Mode Selectors */}
            <div className="space-y-4 mb-5 border-b border-white/10 pb-5">
              <div>
                <label className="block text-slate-400 text-[11px] font-medium mb-1.5">Theme</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['dark', 'light', 'wood'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setConfig(c => ({ ...c, theme: t }))}
                      className={`py-1.5 rounded capitalize font-medium cursor-pointer transition-colors ${
                        config.theme === t ? 'text-white' : 'bg-black/30 text-slate-400 hover:text-white'
                      }`}
                      style={{ backgroundColor: config.theme === t ? config.accentColor : undefined }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-medium mb-1.5">Page Mode</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['auto', 'single', 'double'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setConfig(c => ({ ...c, mode: m }))}
                      className={`py-1.5 rounded capitalize font-medium cursor-pointer transition-colors ${
                        config.mode === m ? 'text-white' : 'bg-black/30 text-slate-400 hover:text-white'
                      }`}
                      style={{ backgroundColor: config.mode === m ? config.accentColor : undefined }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature & Toolbar Toggles (100% Functional) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-5">
              <span className="block text-[11px] font-semibold text-slate-400 mb-1">Toolbar & Feature Toggles</span>
              {[
                { key: 'showToolbar', label: 'Top Toolbar' },
                { key: 'showLogo', label: 'Brand Logo in Toolbar' },
                { key: 'showSidebar', label: 'Collapsible Sidebar' },
                { key: 'showNavigation', label: 'Page Turn Controls' },
                { key: 'showSearch', label: 'Full-Text Search' },
                { key: 'showOutline', label: 'Table of Contents' },
                { key: 'showBookmarks', label: 'Bookmark Manager' },
                { key: 'showThumbnails', label: 'Miniature Thumbnails' },
                { key: 'showAiSummary', label: 'AI Document Assistant' },
                { key: 'showSound', label: 'Paper Audio Synthesis' },
                { key: 'showZoom', label: 'Zoom & Fit Controls' },
                { key: 'showViewToggle', label: '1-Page / 2-Page Mode' },
                { key: 'showPrint', label: 'Export / Print Button' },
                { key: 'showThemeToggle', label: 'Theme Switcher' },
                { key: 'showFullscreen', label: 'Fullscreen Toggle' },
                { key: 'showFileUpload', label: 'Local File Upload' },
                { key: 'showUrlInput', label: 'Remote URL Input' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-2 bg-black/20 hover:bg-black/30 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="text-slate-300">{label}</span>
                  <input
                    type="checkbox"
                    checked={(config as any)[key]}
                    onChange={e => setConfig(c => ({ ...c, [key]: e.target.checked }))}
                    className="rounded border-white/20 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    style={{ accentColor: config.accentColor }}
                  />
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setPdfSource('/sample.pdf');
                  setFileName('sample.pdf');
                  window.history.pushState({}, '', window.location.pathname);
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors font-medium text-center cursor-pointer"
              >
                Reset to Sample Document
              </button>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="w-full py-2 text-white rounded-lg transition-colors font-semibold text-center cursor-pointer"
                style={{ backgroundColor: config.accentColor }}
              >
                Close Drawer
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Floating Props Configurator Trigger Button */}
      <button
        onClick={() => setShowConfigDrawer(true)}
        title="Open Props Configurator"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 text-white rounded-full shadow-lg text-xs font-semibold transition-all hover:scale-105 cursor-pointer border border-white/15"
        style={{ backgroundColor: config.accentColor }}
      >
        <Sliders className="w-4 h-4" />
        <span>Configure Props</span>
      </button>

      {/* Code Snippet Output */}
      <section id="code" className="px-6 lg:px-12 py-12 max-w-5xl mx-auto">
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" style={{ color: config.accentColor }} />
              <span className="text-xs font-semibold text-white">Generated React Component Code</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateReactCode());
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/15 rounded text-xs text-slate-200 cursor-pointer transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied to Clipboard' : 'Copy JSX'}</span>
            </button>
          </div>
          <pre className="p-5 text-xs text-slate-300 font-mono bg-black/50 overflow-x-auto leading-relaxed select-text">
            {generateReactCode()}
          </pre>
        </div>
      </section>

      {/* Bento Grid: Architecture & Highlights */}
      <section id="features" className="px-6 lg:px-12 py-16 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Engineered for Extreme Performance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Overhauled from heavy legacy Turn.js into an ultra-lean, modern client-side architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div
                className="w-10 h-10 border border-white/15 rounded-xl flex items-center justify-center mb-4"
                style={{ color: config.accentColor }}
              >
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Remote PDF & Deep Links</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open any remote PDF directly via URL input or query parameter (<code className="text-slate-300 font-mono">?pdf=...</code>) with intelligent CORS fallback.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div
                className="w-10 h-10 border border-white/15 rounded-xl flex items-center justify-center mb-4"
                style={{ color: config.accentColor }}
              >
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">60 FPS Hardware Physics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by StPageFlip with GPU canvas acceleration and CSS3 transformations for lifelike sheet bending and natural touch drag.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div
                className="w-10 h-10 border border-white/15 rounded-xl flex items-center justify-center mb-4"
                style={{ color: config.accentColor }}
              >
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Memory Virtualization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-fetches active pages ±3 and actively garbage-collects distant canvases. Read large technical manuals without leaking memory.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div
                className="w-10 h-10 border border-white/15 rounded-xl flex items-center justify-center mb-4"
                style={{ color: config.accentColor }}
              >
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Web Audio Synthesizer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates realistic paper friction rustle dynamically with white-noise filtering. Zero MP3 downloads or asset bandwidth required.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div
                className="w-10 h-10 border border-white/15 rounded-xl flex items-center justify-center mb-4"
                style={{ color: config.accentColor }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Documents are parsed entirely inside the user's browser runtime. Sensitive financial or legal PDFs never leave the local device.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div
                className="w-10 h-10 border border-white/15 rounded-xl flex items-center justify-center mb-4"
                style={{ color: config.accentColor }}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Embeddable React Component</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Import <code className="text-slate-300 font-mono">PdfFlipbook</code> into any React 18/19 project with full TypeScript declarations and props configurability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6 text-center text-xs text-slate-500">
        <p className="mb-2">
          PDF HTML5 Page Flip Pro • Modernized with Vite, TypeScript, React & Tailwind CSS
        </p>
        <p>
          Open-source Apache-2.0 License • Crafted for high-performance client-side document reading
        </p>
      </footer>
    </div>
  );
}
