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
  X,
  Printer,
  Expand,
  ListTree,
  Sparkles,
  ChevronRight,
  Bookmark,
  Search,
  Grid,
  Terminal,
  Laptop
} from 'lucide-react';
import { PdfFlipbook } from './react/PdfFlipbook';

export function App() {
  // Navigation View: 'studio' | 'docs'
  const [activeView, setActiveView] = useState<'studio' | 'docs'>('studio');

  // Source State: URL or File
  const [pdfSource, setPdfSource] = useState<string | File>('/demo-document.pdf');
  const [fileName, setFileName] = useState<string>('demo-document.pdf');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Configurator Drawer Overlay (Hidden by default)
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);

  // Hero Tab: 'upload' | 'url'
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [remoteUrlInput, setRemoteUrlInput] = useState<string>('');

  // Configurable Props State (Defaulting to clean Light Aura Theme)
  const [config, setConfig] = useState({
    theme: 'light' as 'dark' | 'light' | 'wood',
    mode: 'auto' as 'auto' | 'single' | 'double',
    flippingTime: 800,
    stageHeight: 'medium' as 'compact' | 'medium' | 'large' | 'viewport',
    accentColor: '#0f172a',
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

  // Auto-detect ?pdf= or ?url= or ?src= or ?view= from query params
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
      const viewParam = params.get('view');
      if (viewParam === 'docs') setActiveView('docs');
    }
  }, []);

  const handleFileUpload = (file: File) => {
    if (isPdfFile(file)) {
      setPdfSource(file);
      setFileName(file.name);
      setActiveView('studio');
      setTimeout(() => {
        document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
      setActiveView('studio');
      setTimeout(() => {
        document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
    compact: 'h-[480px] sm:h-[540px] md:h-[580px]',
    medium: 'h-[520px] sm:h-[620px] md:h-[720px]',
    large: 'h-[600px] sm:h-[720px] md:h-[860px]',
    viewport: 'h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]'
  };

  const accentPresets = [
    { name: 'Slate (Default)', hex: '#0f172a' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Blue', hex: '#2563eb' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Rose', hex: '#e11d48' },
  ];

  const generateReactCode = () => {
    const propLines = [
      `  src="${typeof pdfSource === 'string' ? pdfSource : fileName}"`,
      config.theme !== 'light' ? `  theme="${config.theme}"` : null,
      config.mode !== 'auto' ? `  mode="${config.mode}"` : null,
      config.flippingTime !== 800 ? `  flippingTime={${config.flippingTime}}` : null,
      config.accentColor !== '#0f172a' ? `  accentColor="${config.accentColor}"` : null,
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

    return `import { PdfFlipbook } from '@iamapinan/pdf-html5-page-flip/react';
import '@iamapinan/pdf-html5-page-flip/style.css';

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

  // Unique key for clean React remounting upon document source change
  const flipbookKey = typeof pdfSource === 'string'
    ? pdfSource
    : `${pdfSource.name}-${pdfSource.lastModified}-${pdfSource.size}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-slate-900 selection:text-white relative">
      {/* Luminous Aura Background Diffusion */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        style={{
          background: 'radial-gradient(1200px 600px at 50% -20px, rgba(99, 102, 241, 0.08), rgba(248, 250, 252, 0) 70%)'
        }}
      />

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
      <nav className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 lg:px-12 gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs transition-colors"
            style={{ backgroundColor: config.accentColor }}
          >
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-slate-900">
            Page Flip <span style={{ color: config.accentColor === '#0f172a' ? '#334155' : config.accentColor }}>Pro</span>
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
          <button
            onClick={() => setActiveView('studio')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'studio'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Studio Viewer
          </button>
          <button
            onClick={() => setActiveView('docs')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeView === 'docs'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Documentation & Guide
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfigDrawer(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Configurator</span>
          </button>
          <a
            href="https://github.com/iamapinan/pdf-html5-page-flip"
            target="_blank"
            rel="noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-1.5 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer hover:opacity-95"
            style={{ backgroundColor: config.accentColor }}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>
        </div>
      </nav>

      {/* VIEW: STUDIO VIEWER */}
      {activeView === 'studio' && (
        <main className="relative z-10">
          {/* Hero Section (Aura Premium Anti-Slop Redesign) */}
          <section className="relative px-6 pt-12 pb-10 lg:pt-16 lg:pb-14 max-w-5xl mx-auto text-center">
            {/* Architectural Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-xs text-slate-700 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full inline-block bg-emerald-500" />
              <span>Version 2.1.0 • Full PDF Outlines & Vector Print Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4 leading-[1.15]">
              The HTML5 PDF Flipbook Engine <br />
              <span className="text-slate-600 font-medium">Built for True Native Performance</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Transform any PDF into realistic 3D paper pages with 60 FPS hardware acceleration, instant table of contents outline navigation, vector document printing, and dynamic fullscreen scaling.
            </p>

            {/* Quick Action Bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                onClick={() => document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
                style={{ backgroundColor: config.accentColor }}
              >
                <span>Launch Studio Viewer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setActiveView('docs')}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Read Developer Manual
              </button>

              {/* Install Terminal Snippet */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs text-xs font-mono text-slate-700">
                <Terminal className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <span className="select-all">npm i @iamapinan/pdf-html5-page-flip</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('npm i @iamapinan/pdf-html5-page-flip');
                    setCopiedInstall(true);
                    setTimeout(() => setCopiedInstall(false), 2000);
                  }}
                  className="ml-2.5 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Copy install command"
                >
                  {copiedInstall ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* High-End Source Selector Surface */}
            <div className="max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] overflow-hidden p-6 text-left">
              {/* Selector Tabs */}
              <div className="flex border-b border-slate-200 pb-3 mb-5 gap-6 text-xs font-medium">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`flex items-center gap-2 pb-2 -mb-3.5 border-b-2 transition-all cursor-pointer ${
                    inputMode === 'upload' ? 'text-slate-900 font-semibold border-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                  style={{ borderColor: inputMode === 'upload' ? config.accentColor : 'transparent' }}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Local PDF</span>
                </button>
                <button
                  onClick={() => setInputMode('url')}
                  className={`flex items-center gap-2 pb-2 -mb-3.5 border-b-2 transition-all cursor-pointer ${
                    inputMode === 'url' ? 'text-slate-900 font-semibold border-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                  style={{ borderColor: inputMode === 'url' ? config.accentColor : 'transparent' }}
                >
                  <Globe className="w-4 h-4" />
                  <span>Load Public URL</span>
                </button>
              </div>

              {inputMode === 'upload' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFileUpload(f);
                  }}
                  className="border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50 rounded-xl p-8 text-center cursor-pointer transition-all group"
                >
                  <div
                    className="w-10 h-10 border border-slate-200 rounded-lg flex items-center justify-center mx-auto mb-3 bg-white shadow-xs group-hover:scale-105 transition-transform"
                    style={{ color: config.accentColor }}
                  >
                    <Upload className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-semibold text-slate-900 mb-1">
                    Drag and drop your PDF here, or <span className="underline decoration-slate-300">browse local files</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    100% Client-Side Parsing • Zero server telemetry • Local documents remain on your device
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRemoteUrlSubmit} className="space-y-3">
                  <div>
                    <label className="block text-slate-600 text-xs mb-1 font-medium">Public Remote PDF URL</label>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        placeholder="https://example.com/document.pdf"
                        value={remoteUrlInput}
                        onChange={e => setRemoteUrlInput(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 pr-9"
                      />
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>Try sample documents:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfSource('/demo-document.pdf');
                        setFileName('demo-document.pdf');
                        document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 border border-slate-200 cursor-pointer"
                    >
                      Demo Document (Full Outline)
                    </button>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer hover:opacity-95"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Fetch and Open PDF</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Live Studio Viewer Section */}
          <section id="studio" className="px-4 sm:px-8 lg:px-12 pb-16 max-w-[1440px] mx-auto">
            <div className={`bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] flex flex-col ${stageHeightClasses[config.stageHeight]} w-full transition-all duration-300`}>
              {/* Viewer Top Action Bar */}
              <div className="h-11 px-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 shrink-0 text-slate-700" />
                  <span className="text-slate-900 font-semibold truncate max-w-xs">{fileName}</span>
                  <span className="hidden sm:inline text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                    Client Sandbox
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyShareLink}
                    title="Share Direct Flipbook Link"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-slate-700 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                    <span className="hidden sm:inline">{copiedShareLink ? 'Link Copied!' : 'Share Link'}</span>
                  </button>

                  {/* Props Configurator Overlay Trigger */}
                  <button
                    onClick={() => setShowConfigDrawer(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1 text-white rounded font-medium cursor-pointer transition-colors shadow-xs"
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
                  flippingTime={config.flippingTime}
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

          {/* Quick React Integration Snippet */}
          <section id="code" className="px-6 lg:px-12 py-10 max-w-5xl mx-auto">
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-semibold text-slate-900">React Component Props Implementation</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateReactCode());
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded text-xs text-slate-700 cursor-pointer transition-colors shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy JSX'}</span>
                </button>
              </div>
              <pre className="p-5 text-xs text-slate-800 font-mono bg-slate-950 text-slate-200 overflow-x-auto leading-relaxed select-text">
                {generateReactCode()}
              </pre>
            </div>
          </section>

          {/* Performance Highlights Bento */}
          <section className="px-6 lg:px-12 py-14 max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Engineered for High Reliability
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Modern canvas-accelerated document pipeline designed for native web applications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                  <ListTree className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">PDF Table of Contents</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Extracts Catalog Outline dictionaries and nested bookmarks automatically. One click navigates directly to the target section.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                  <Printer className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">Full Document Vector Print</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generates 2x high-resolution canvas sheets for every page in the document with clean page-break formatting ready for print.
                </p>
              </div>

              <div className="p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-3 text-slate-800">
                  <Expand className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">Dynamic Fullscreen Scaling</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Listens to viewport changes to dynamically expand canvas stage bounds to fill the monitor without distortion or blurry zoom.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* VIEW: COMPREHENSIVE DOCUMENTATION & GUIDE */}
      {activeView === 'docs' && (
        <main className="relative z-10 px-6 lg:px-12 py-10 max-w-5xl mx-auto">
          {/* Docs Header */}
          <div className="border-b border-slate-200 pb-8 mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-medium mb-4 shadow-xs">
              <Laptop className="w-3.5 h-3.5 text-slate-500" />
              <span>Developer Reference Manual</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Getting Started & Component Reference
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
              Everything you need to install, configure, and customize the HTML5 PDF Flipbook component in React, Next.js, and modern JavaScript applications.
            </p>
          </div>

          {/* Table of Contents Quick Links */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 mb-10 shadow-xs flex flex-wrap gap-3 text-xs font-medium text-slate-700">
            <span className="text-slate-400 font-semibold mr-1">Jump to:</span>
            <a href="#quickstart" className="hover:text-slate-900 underline decoration-slate-300">1. Quick Start</a>
            <span className="text-slate-300">•</span>
            <a href="#nextjs" className="hover:text-slate-900 underline decoration-slate-300">2. Next.js & SSR</a>
            <span className="text-slate-300">•</span>
            <a href="#props" className="hover:text-slate-900 underline decoration-slate-300">3. Props API Reference</a>
            <span className="text-slate-300">•</span>
            <a href="#features-guide" className="hover:text-slate-900 underline decoration-slate-300">4. Key Features</a>
            <span className="text-slate-300">•</span>
            <a href="#keyboard" className="hover:text-slate-900 underline decoration-slate-300">5. Keyboard & Gestures</a>
          </div>

          {/* Section 1: Quick Start */}
          <section id="quickstart" className="mb-14 scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs">1</span>
              Installation & Quick Start
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs overflow-x-auto relative">
                <span className="text-slate-500"># Install via npm</span><br />
                npm install @iamapinan/pdf-html5-page-flip
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  Basic React Example
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
{`import React from 'react';
import { PdfFlipbook } from '@iamapinan/pdf-html5-page-flip/react';
import '@iamapinan/pdf-html5-page-flip/style.css';

export function DocumentViewer() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PdfFlipbook
        src="/demo-document.pdf"
        theme="light"
        mode="auto"
        onPageChange={(current, total) => console.log(\`Page \${current}/\${total}\`)}
      />
    </div>
  );
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 2: Next.js & SSR */}
          <section id="nextjs" className="mb-14 scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
              Next.js (App Router & Pages Router)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
              Because PDF.js and StPageFlip rely on HTML5 <code className="text-slate-800 font-mono">window</code>, <code className="text-slate-800 font-mono">canvas</code>, and Web Workers, import the component using dynamic imports with SSR disabled.
            </p>
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                components/PdfReaderClient.tsx
              </div>
              <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
{`'use client';

import dynamic from 'next/dynamic';
import '@iamapinan/pdf-html5-page-flip/style.css';

// Disable SSR to load client-side canvas physics
const PdfFlipbook = dynamic(
  () => import('@iamapinan/pdf-html5-page-flip/react').then(mod => mod.PdfFlipbook),
  { ssr: false, loading: () => <div className="p-10 text-center">Loading flipbook...</div> }
);

export default function PdfReaderPage() {
  return (
    <main className="w-full h-screen">
      <PdfFlipbook src="/my-manual.pdf" theme="light" />
    </main>
  );
}`}
              </pre>
            </div>
          </section>

          {/* Section 3: Complete Props API Table */}
          <section id="props" className="mb-14 scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs">3</span>
              Complete Props API Reference
            </h2>
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Prop</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Default</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">src</td>
                      <td className="py-3 px-4 text-indigo-600">string | File | Uint8Array</td>
                      <td className="py-3 px-4 text-slate-400">required</td>
                      <td className="py-3 px-4 font-sans text-slate-600">URL path, uploaded File object, or binary PDF buffer.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">theme</td>
                      <td className="py-3 px-4 text-indigo-600">'light' | 'dark' | 'wood'</td>
                      <td className="py-3 px-4 text-slate-800">'light'</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Visual theme preset with high-contrast accessibility.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">mode</td>
                      <td className="py-3 px-4 text-indigo-600">'auto' | 'single' | 'double'</td>
                      <td className="py-3 px-4 text-slate-800">'auto'</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Page display mode. Auto adapts to desktop/mobile screen aspect.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">flippingTime</td>
                      <td className="py-3 px-4 text-indigo-600">number</td>
                      <td className="py-3 px-4 text-slate-800">800</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Page turn animation duration in milliseconds.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">accentColor</td>
                      <td className="py-3 px-4 text-indigo-600">string</td>
                      <td className="py-3 px-4 text-slate-800">'#0f172a'</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Primary brand color applied to active tabs, outlines, and highlights.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">showOutline</td>
                      <td className="py-3 px-4 text-indigo-600">boolean</td>
                      <td className="py-3 px-4 text-slate-800">true</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Displays PDF bookmarks and hierarchical table of contents.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">showPrint</td>
                      <td className="py-3 px-4 text-indigo-600">boolean</td>
                      <td className="py-3 px-4 text-slate-800">true</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Triggers 2x vector print for all document pages.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">showFullscreen</td>
                      <td className="py-3 px-4 text-indigo-600">boolean</td>
                      <td className="py-3 px-4 text-slate-800">true</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Enables dynamic fullscreen scaling to monitor resolution.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">showAiSummary</td>
                      <td className="py-3 px-4 text-indigo-600">boolean</td>
                      <td className="py-3 px-4 text-slate-800">true</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Document assistant with Local Extractive, Gemini, and OpenAI options.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">showThumbnails</td>
                      <td className="py-3 px-4 text-indigo-600">boolean</td>
                      <td className="py-3 px-4 text-slate-800">true</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Shows live miniature canvas previews for every page.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">showSearch</td>
                      <td className="py-3 px-4 text-indigo-600">boolean</td>
                      <td className="py-3 px-4 text-slate-800">true</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Full-text background search index with snippet preview.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">showSound</td>
                      <td className="py-3 px-4 text-indigo-600">boolean</td>
                      <td className="py-3 px-4 text-slate-800">true</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Synthesizes realistic paper friction audio using Web Audio API.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">onPageChange</td>
                      <td className="py-3 px-4 text-indigo-600">(page, total) =&gt; void</td>
                      <td className="py-3 px-4 text-slate-400">undefined</td>
                      <td className="py-3 px-4 font-sans text-slate-600">Callback fired when a page turn animation completes.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 4: Key Features Guide */}
          <section id="features-guide" className="mb-14 scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs">4</span>
              Key Feature Implementations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-xs mb-2 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-slate-700" />
                  Full Document Vector Print
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlike typical web viewers that print only the active canvas, the print handler iterates across all pages of the document proxy, rendering each at 2.0x scale and generating clean CSS page breaks for native printing.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-xs mb-2 flex items-center gap-2">
                  <Expand className="w-4 h-4 text-slate-700" />
                  Dynamic Fullscreen Scaling
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The viewer registers <code className="text-slate-800 font-mono">fullscreenchange</code> listeners to recalculate container bounding boxes immediately, expanding the book stage to fill up to 95% of the display monitor.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-xs mb-2 flex items-center gap-2">
                  <ListTree className="w-4 h-4 text-slate-700" />
                  PDF Table of Contents (Outlines)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Automatically queries the PDF catalog for outline dictionaries. Nested items are rendered with recursive indentation, allowing rapid jump navigation across chapters.
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-xs mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  Zero Telemetry & Local Privacy
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  PDF files dragged from desktop or loaded via file inputs are parsed directly in the browser's worker memory. No document bytes are uploaded to remote servers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Keyboard Shortcuts & Gestures */}
          <section id="keyboard" className="mb-14 scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs">5</span>
              Keyboard Shortcuts & Interaction
            </h2>
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-slate-100 text-xs text-center">
                <div className="p-4">
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-800">←</kbd> / <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-800">→</kbd>
                  <p className="mt-2 text-slate-600 font-medium">Turn Page</p>
                </div>
                <div className="p-4">
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-800">Home</kbd> / <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-800">End</kbd>
                  <p className="mt-2 text-slate-600 font-medium">First / Last Page</p>
                </div>
                <div className="p-4">
                  <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-800">F</kbd>
                  <p className="mt-2 text-slate-600 font-medium">Toggle Fullscreen</p>
                </div>
                <div className="p-4">
                  <span className="font-semibold text-slate-800">Touch Drag</span>
                  <p className="mt-2 text-slate-600 font-medium">Realistic Page Curl</p>
                </div>
              </div>
            </div>
          </section>

          {/* Back to Viewer CTA */}
          <div className="text-center pt-6 border-t border-slate-200">
            <button
              onClick={() => {
                setActiveView('studio');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-2.5 rounded-xl text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-all cursor-pointer inline-flex items-center gap-2"
              style={{ backgroundColor: config.accentColor }}
            >
              <span>Return to Live Flipbook Studio</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      )}

      {/* Props Configurator Overlay Drawer */}
      {showConfigDrawer && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowConfigDrawer(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Drawer Sidebar */}
          <aside
            id="configurator"
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-slate-200 shadow-2xl p-6 flex flex-col text-xs overflow-y-auto animate-in slide-in-from-right duration-250 text-slate-800"
            role="dialog"
            aria-label="Props Configurator"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4" style={{ color: config.accentColor }} />
                <h2 className="font-semibold text-slate-900 text-sm">Props Configurator</h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono border"
                  style={{ color: config.accentColor, borderColor: `${config.accentColor}40`, backgroundColor: `${config.accentColor}10` }}
                >
                  Live Sync
                </span>
                <button
                  onClick={() => setShowConfigDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close configurator"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Display Area Height */}
            <div className="mb-5 border-b border-slate-200 pb-5">
              <label className="block text-slate-600 text-[11px] font-semibold mb-1.5">Display Area Height</label>
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
                    className={`py-1.5 px-2 rounded-lg font-medium cursor-pointer transition-colors text-center border ${
                      config.stageHeight === key ? 'text-white border-transparent' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                    style={{ backgroundColor: config.stageHeight === key ? config.accentColor : undefined }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coloring & Accent Swatches */}
            <div className="mb-5 border-b border-slate-200 pb-5">
              <label className="block text-slate-600 text-[11px] font-semibold mb-2">Accent Color Palette</label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {accentPresets.map(({ name, hex }) => (
                  <button
                    key={hex}
                    onClick={() => setConfig(c => ({ ...c, accentColor: hex }))}
                    title={name}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 flex items-center justify-center ${
                      config.accentColor === hex ? 'border-slate-900 scale-110 shadow-xs' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {config.accentColor === hex && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme & Mode Selectors */}
            <div className="space-y-4 mb-5 border-b border-slate-200 pb-5">
              <div>
                <label className="block text-slate-600 text-[11px] font-semibold mb-1.5">Theme Preset</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['light', 'dark', 'wood'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setConfig(c => ({ ...c, theme: t }))}
                      className={`py-1.5 rounded-lg capitalize font-medium cursor-pointer transition-colors border ${
                        config.theme === t ? 'text-white border-transparent' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                      style={{ backgroundColor: config.theme === t ? config.accentColor : undefined }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-[11px] font-semibold mb-1.5">Page Mode</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['auto', 'single', 'double'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setConfig(c => ({ ...c, mode: m }))}
                      className={`py-1.5 rounded-lg capitalize font-medium cursor-pointer transition-colors border ${
                        config.mode === m ? 'text-white border-transparent' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                      style={{ backgroundColor: config.mode === m ? config.accentColor : undefined }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Flip Animation & Smoothness */}
            <div className="mb-5 border-b border-slate-200 pb-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-600 text-[11px] font-semibold">Animation Smoothness</label>
                <span className="font-mono text-[10px] text-slate-800 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                  {config.flippingTime}ms
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                {[
                  { time: 1000, label: 'Cinematic (1000ms)' },
                  { time: 800, label: 'Smooth (800ms)' },
                  { time: 600, label: 'Balanced (600ms)' },
                  { time: 400, label: 'Snappy (400ms)' },
                ].map(({ time, label }) => (
                  <button
                    key={time}
                    onClick={() => setConfig(c => ({ ...c, flippingTime: time }))}
                    className={`py-1.5 px-2 rounded-lg font-medium cursor-pointer transition-colors text-center border ${
                      config.flippingTime === time ? 'text-white border-transparent' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                    style={{ backgroundColor: config.flippingTime === time ? config.accentColor : undefined }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="300"
                max="1500"
                step="50"
                value={config.flippingTime}
                onChange={e => setConfig(c => ({ ...c, flippingTime: Number(e.target.value) }))}
                className="w-full cursor-pointer"
                style={{ accentColor: config.accentColor }}
              />
            </div>

            {/* Feature & Toolbar Toggles (100% Functional) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-5">
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">Toolbar & Feature Toggles</span>
              {[
                { key: 'showToolbar', label: 'Top Control Toolbar' },
                { key: 'showLogo', label: 'Brand Logo in Toolbar' },
                { key: 'showSidebar', label: 'Collapsible Sidebar' },
                { key: 'showNavigation', label: 'Page Turn Controls' },
                { key: 'showSearch', label: 'Full-Text Search' },
                { key: 'showOutline', label: 'Table of Contents' },
                { key: 'showBookmarks', label: 'Bookmark Manager' },
                { key: 'showThumbnails', label: 'Visual Miniature Thumbnails' },
                { key: 'showAiSummary', label: 'AI Document Assistant' },
                { key: 'showSound', label: 'Paper Audio Synthesis' },
                { key: 'showZoom', label: 'Zoom & Reset Controls' },
                { key: 'showViewToggle', label: '1-Page / 2-Page Mode' },
                { key: 'showPrint', label: 'Vector Document Print' },
                { key: 'showThemeToggle', label: 'Theme Switcher' },
                { key: 'showFullscreen', label: 'Dynamic Fullscreen' },
                { key: 'showFileUpload', label: 'Local File Upload' },
                { key: 'showUrlInput', label: 'Remote URL Input' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200/60"
                >
                  <span className="text-slate-700 font-medium">{label}</span>
                  <input
                    type="checkbox"
                    checked={(config as any)[key]}
                    onChange={e => setConfig(c => ({ ...c, [key]: e.target.checked }))}
                    className="rounded border-slate-300 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    style={{ accentColor: config.accentColor }}
                  />
                </label>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setPdfSource('/demo-document.pdf');
                  setFileName('demo-document.pdf');
                  window.history.pushState({}, '', window.location.pathname);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors font-semibold text-center cursor-pointer border border-slate-200"
              >
                Reset to Sample Document
              </button>
              <button
                onClick={() => setShowConfigDrawer(false)}
                className="w-full py-2 text-white rounded-lg transition-colors font-semibold text-center cursor-pointer shadow-xs hover:opacity-95"
                style={{ backgroundColor: config.accentColor }}
              >
                Apply & Close
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Floating Props Configurator Trigger Button */}
      <button
        onClick={() => setShowConfigDrawer(true)}
        title="Open Props Configurator"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 text-white rounded-full shadow-lg text-xs font-semibold transition-all hover:scale-105 cursor-pointer border border-slate-900"
        style={{ backgroundColor: config.accentColor }}
      >
        <Sliders className="w-4 h-4" />
        <span>Configure Props</span>
      </button>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-6 text-center text-xs text-slate-500">
        <p className="mb-2 font-medium text-slate-700">
          PDF HTML5 Page Flip Pro • Aura Premium Light Edition
        </p>
        <p>
          Open-source Apache-2.0 License • High-performance client-side document reading
        </p>
      </footer>
    </div>
  );
}
