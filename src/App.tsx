import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Upload,
  Globe,
  Sparkles,
  Sliders,
  Code2,
  Check,
  Copy,
  Layers,
  Zap,
  Volume2,
  ShieldCheck,
  Search,
  ExternalLink,
  FileText,
  Share2,
  Link as LinkIcon
} from 'lucide-react';
import { PdfFlipbook } from './react/PdfFlipbook';

export function App() {
  // Source State: URL or File
  const [pdfSource, setPdfSource] = useState<string | File>('/sample.pdf');
  const [fileName, setFileName] = useState<string>('sample.pdf');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState(true);

  // Hero Tab: 'upload' | 'url'
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [remoteUrlInput, setRemoteUrlInput] = useState<string>('');

  // Configurable Props State
  const [config, setConfig] = useState({
    theme: 'dark' as 'dark' | 'light' | 'wood',
    mode: 'auto' as 'auto' | 'single' | 'double',
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect ?pdf= or ?url= or ?src= from query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlParam = params.get('pdf') || params.get('url') || params.get('src');
      if (urlParam) {
        setPdfSource(urlParam);
        const name = urlParam.split('/').pop()?.split('?')[0] || 'remote-document.pdf';
        setFileName(decodeURIComponent(name));
        // Smooth scroll to studio
        setTimeout(() => {
          document.getElementById('studio')?.scrollIntoView({ behavior: 'smooth' });
        }, 400);
      }
    }
  }, []);

  const handleFileUpload = (file: File) => {
    if (file && file.type === 'application/pdf') {
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
      // Update browser URL query without reload
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

  const generateReactCode = () => {
    const propLines = [
      `  src="${typeof pdfSource === 'string' ? pdfSource : fileName}"`,
      config.theme !== 'dark' ? `  theme="${config.theme}"` : null,
      config.mode !== 'auto' ? `  mode="${config.mode}"` : null,
      !config.showToolbar ? `  showToolbar={false}` : null,
      !config.showSidebar ? `  showSidebar={false}` : null,
      !config.showSearch ? `  showSearch={false}` : null,
      !config.showAiSummary ? `  showAiSummary={false}` : null,
      !config.showBookmarks ? `  showBookmarks={false}` : null,
      !config.showThumbnails ? `  showThumbnails={false}` : null,
      !config.showSound ? `  showSound={false}` : null,
      !config.showZoom ? `  showZoom={false}` : null,
      !config.showPrint ? `  showPrint={false}` : null,
      !config.showUrlInput ? `  showUrlInput={false}` : null,
    ].filter(Boolean).join('\n');

    return `import { PdfFlipbook } from 'pdf-html5-page-flip/react';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-white">
            Page Flip <span className="text-indigo-400">Pro</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#studio" className="hover:text-white transition-colors">Live Studio</a>
          <a href="#configurator" className="hover:text-white transition-colors">Configurator</a>
          <a href="#features" className="hover:text-white transition-colors">Architecture</a>
          <a href="#code" className="hover:text-white transition-colors">React API</a>
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
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 lg:pt-24 lg:pb-16 max-w-5xl mx-auto text-center">
        {/* Subtle Accent Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-400/20 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Local Files & Remote URLs Supported</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
          Turn Any PDF into a Realistic <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            3D HTML5 Flipbook
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Open local files or paste public remote URLs. Zero server storage, 60 FPS page-turn physics, memory virtualization, and on-demand AI document insights.
        </p>

        {/* Dual Mode Card: Local Dropzone OR Remote URL input */}
        <div className="max-w-2xl mx-auto bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 text-left">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-white/10 pb-3 mb-5 gap-4 text-xs font-medium">
            <button
              onClick={() => setInputMode('upload')}
              className={`flex items-center gap-2 pb-2 -mb-3.5 border-b-2 transition-all cursor-pointer ${
                inputMode === 'upload' ? 'border-indigo-500 text-white font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Upload Local PDF (Free)</span>
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
              className="border border-dashed border-indigo-500/40 bg-indigo-950/20 hover:bg-indigo-950/30 p-6 rounded-xl transition-all text-center cursor-pointer group"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-2.5 text-indigo-400 group-hover:scale-110 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-semibold text-white mb-1">
                Drop your PDF file here, or <span className="text-indigo-400 underline decoration-indigo-400/40">browse files</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                100% Client-Side • File never leaves your browser
              </p>
            </div>
          ) : (
            /* Remote URL Form */
            <form onSubmit={handleRemoteUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5 font-medium">Public Remote PDF URL</label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/document.pdf"
                    value={remoteUrlInput}
                    onChange={e => setRemoteUrlInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 pr-10"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                </div>
              </div>

              {/* Preset Sample URLs */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>Try sample remote links:</span>
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
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Load Remote PDF</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Live Studio & Configurator */}
      <section id="studio" className="px-4 sm:px-8 lg:px-12 pb-20 max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row items-stretch gap-6">

          {/* Interactive Flipbook Stage */}
          <div className="flex-1 bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[640px] lg:min-h-[720px]">
            {/* Viewer Header Info */}
            <div className="h-11 px-4 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-200 font-medium truncate max-w-xs">{fileName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyShareLink}
                  title="Share Direct Flipbook Link"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-slate-200 cursor-pointer"
                >
                  {copiedShareLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-indigo-400" />}
                  <span className="hidden sm:inline">{copiedShareLink ? 'Link Copied!' : 'Share Link'}</span>
                </button>
                <button
                  onClick={() => setShowConfigDrawer(v => !v)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-slate-200 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{showConfigDrawer ? 'Hide Controls' : 'Configure Props'}</span>
                </button>
              </div>
            </div>

            {/* Embedded React Component */}
            <div className="flex-1 relative">
              <PdfFlipbook
                src={pdfSource}
                theme={config.theme}
                mode={config.mode}
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
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Real-time Feature Configurator Drawer */}
          {showConfigDrawer && (
            <div id="configurator" className="w-full lg:w-80 bg-slate-900 border border-white/10 rounded-2xl p-5 flex flex-col text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2 font-semibold text-white text-sm">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  <span>Props Configurator</span>
                </div>
                <span className="text-[10px] text-indigo-400 font-mono">Live Sync</span>
              </div>

              {/* Theme & Mode Selectors */}
              <div className="space-y-3 mb-4 border-b border-white/10 pb-4">
                <div>
                  <label className="block text-slate-400 text-[11px] font-medium mb-1.5">Theme</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['dark', 'light', 'wood'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setConfig(c => ({ ...c, theme: t }))}
                        className={`py-1.5 rounded capitalize font-medium cursor-pointer transition-colors ${
                          config.theme === t ? 'bg-indigo-600 text-white' : 'bg-black/30 text-slate-400 hover:text-white'
                        }`}
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
                          config.mode === m ? 'bg-indigo-600 text-white' : 'bg-black/30 text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
                <span className="block text-[11px] font-semibold text-slate-400 mb-1">Feature Toggles</span>
                {[
                  { key: 'showToolbar', label: 'Top Toolbar' },
                  { key: 'showSidebar', label: 'Collapsible Sidebar' },
                  { key: 'showSearch', label: 'Full-Text Search' },
                  { key: 'showAiSummary', label: 'AI Document Assistant' },
                  { key: 'showBookmarks', label: 'Bookmark Manager' },
                  { key: 'showThumbnails', label: 'Miniature Thumbnails' },
                  { key: 'showSound', label: 'Paper Audio Synthesis' },
                  { key: 'showZoom', label: 'Zoom & Pan Controls' },
                  { key: 'showPrint', label: 'Export / Print Button' },
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
                      className="rounded border-white/20 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                  </label>
                ))}
              </div>

              {/* Sample Document Reset */}
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
            </div>
          )}
        </div>
      </section>

      {/* Code Snippet Output */}
      <section id="code" className="px-6 lg:px-12 py-12 max-w-5xl mx-auto">
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
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
          <pre className="p-5 text-xs text-indigo-200 font-mono bg-black/50 overflow-x-auto leading-relaxed select-text">
            {generateReactCode()}
          </pre>
        </div>
      </section>

      {/* Bento Grid: Architecture & Technical Highlights */}
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
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
                <Globe className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Remote PDF & Deep Links</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open any remote PDF directly via URL input or query parameter (<code className="text-indigo-300 font-mono">?pdf=...</code>) with intelligent CORS fallback.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
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
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Memory Virtualization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pre-fetches active pages $\pm 3$ and actively garbage-collects distant canvases. Read 200+ page technical manuals without leaking memory.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
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
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">AI Document Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extracts text from active view for instant executive bullet summaries. Connectable to Gemini API, OpenAI, or local heuristics.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">100% Client-Side Privacy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Documents are parsed entirely inside the user's browser runtime. Sensitive financial or legal PDFs never leave the local device.
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
          Open-source MIT License • Available for embedding in any web application
        </p>
      </footer>
    </div>
  );
}
