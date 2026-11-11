import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Upload,
  Globe,
  Sliders,
  Maximize2,
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
  ChevronDown,
  Bookmark,
  Search,
  Grid,
  Terminal,
  Laptop
} from 'lucide-react';
import { PdfFlipbook } from './react/PdfFlipbook';

// High-contrast, crystal-clear syntax-highlighted code editor preview
const CodeViewer: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTokens = (line: string, lineIdx: number) => {
    if (!line.trim()) {
      return (
        <div key={lineIdx} className="table-row leading-relaxed">
          <span className="table-cell pr-4 text-right select-none text-slate-600 font-mono text-[11px] w-8">
            {lineIdx + 1}
          </span>
          <span className="table-cell font-mono text-slate-200">&nbsp;</span>
        </div>
      );
    }

    if (line.trim().startsWith('//')) {
      return (
        <div key={lineIdx} className="table-row leading-relaxed">
          <span className="table-cell pr-4 text-right select-none text-slate-600 font-mono text-[11px] w-8">
            {lineIdx + 1}
          </span>
          <span className="table-cell font-mono text-slate-500 italic">{line}</span>
        </div>
      );
    }

    const tokens: React.ReactNode[] = [];
    const regex = /(\b(?:import|from|export|default|function|return|const|let)\b)|(<[\/]?[A-Za-z0-9_]+)|([A-Za-z0-9_\-]+(?==))|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|([{}()[\]\],;=<>])/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(
          <span key={`txt-${lineIdx}-${lastIndex}`} className="text-slate-200">
            {line.slice(lastIndex, match.index)}
          </span>
        );
      }
      const [full, keyword, tag, prop, str, punct] = match;
      if (keyword) {
        tokens.push(<span key={`kw-${lineIdx}-${match.index}`} className="text-pink-400 font-semibold">{keyword}</span>);
      } else if (tag) {
        tokens.push(<span key={`tag-${lineIdx}-${match.index}`} className="text-sky-300 font-bold">{tag}</span>);
      } else if (prop) {
        tokens.push(<span key={`prop-${lineIdx}-${match.index}`} className="text-amber-300 font-medium">{prop}</span>);
      } else if (str) {
        tokens.push(<span key={`str-${lineIdx}-${match.index}`} className="text-emerald-300">{str}</span>);
      } else if (punct) {
        tokens.push(<span key={`punct-${lineIdx}-${match.index}`} className="text-slate-300">{punct}</span>);
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      tokens.push(
        <span key={`tail-${lineIdx}-${lastIndex}`} className="text-slate-200">
          {line.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div key={lineIdx} className="table-row leading-relaxed hover:bg-white/5 transition-colors">
        <span className="table-cell pr-4 text-right select-none text-slate-600 font-mono text-[11px] w-8">
          {lineIdx + 1}
        </span>
        <span className="table-cell font-mono text-slate-200 whitespace-pre">
          {tokens}
        </span>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-[#080d1a] shadow-2xl overflow-hidden select-text">
      {/* Mac-Style Window Header */}
      <div className="px-4 py-3 bg-[#0d1527] border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-300 ml-2">App.tsx</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
          <span>{copied ? 'Copied' : 'Copy JSX'}</span>
        </button>
      </div>
      <div className="p-4 sm:p-5 overflow-x-auto text-xs font-mono font-normal bg-[#070b16]">
        <div className="table w-full">
          {code.split('\n').map((line, idx) => renderTokens(line, idx))}
        </div>
      </div>
    </div>
  );
};

const GithubIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

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
  
  // AI Provider & Model Configuration State (Synchronized with localStorage)
  const [aiProvider, setAiProvider] = useState<'local' | 'gemini' | 'openai'>(() => {
    return (localStorage.getItem('flipbook_ai_provider') as any) || 'local';
  });
  const [aiGeminiKey, setAiGeminiKey] = useState<string>(() => {
    return localStorage.getItem('flipbook_ai_gemini_key') || '';
  });
  const [aiGeminiModel, setAiGeminiModel] = useState<string>(() => {
    return localStorage.getItem('flipbook_ai_gemini_model') || 'gemini-2.5-flash';
  });
  const [aiOpenAiKey, setAiOpenAiKey] = useState<string>(() => {
    return localStorage.getItem('flipbook_ai_openai_key') || '';
  });
  const [aiOpenAiModel, setAiOpenAiModel] = useState<string>(() => {
    return localStorage.getItem('flipbook_ai_openai_model') || 'gpt-4o-mini';
  });
  const [aiSavedNotice, setAiSavedNotice] = useState(false);

  const saveAiSettings = (key: string, val: string) => {
    localStorage.setItem(key, val);
    setAiSavedNotice(true);
    setTimeout(() => setAiSavedNotice(false), 2000);
  };

  const [config, setConfig] = useState({
    theme: 'light' as 'dark' | 'light' | 'wood',
    mode: 'auto' as 'auto' | 'single' | 'double',
    flippingTime: 800,
    toolbarPosition: 'top' as 'top' | 'bottom',
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
      config.toolbarPosition !== 'top' ? `  toolbarPosition="${config.toolbarPosition}"` : null,
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
      {/* Luminous Aura Background Diffusion (Sunbeam Yellow, Petal Pink, Crisp White) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Sunbeam Yellow Luminous Orb */}
        <div
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full blur-[110px] opacity-75 animate-aura-fluid-1"
          style={{
            background: 'radial-gradient(circle, rgba(254, 240, 138, 0.85) 0%, rgba(253, 224, 71, 0.35) 40%, rgba(255, 255, 255, 0) 70%)'
          }}
        />
        {/* Sunset Blossom Pink Floating Orb */}
        <div
          className="absolute top-12 -right-24 w-[650px] h-[500px] rounded-full blur-[100px] opacity-65 animate-aura-fluid-2"
          style={{
            background: 'radial-gradient(circle, rgba(251, 113, 133, 0.75) 0%, rgba(244, 114, 182, 0.3) 45%, rgba(255, 255, 255, 0) 70%)'
          }}
        />
        {/* Soft Apricot Peach Floating Orb */}
        <div
          className="absolute top-52 -left-24 w-[600px] h-[500px] rounded-full blur-[100px] opacity-55 animate-aura-fluid-1"
          style={{
            background: 'radial-gradient(circle, rgba(254, 215, 170, 0.7) 0%, rgba(253, 186, 116, 0.25) 45%, rgba(255, 255, 255, 0) 70%)'
          }}
        />
      </div>

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

      {/* Floating Apple Liquid Glass Top Navigation Bar */}
      <header className="sticky top-3 z-50 px-3 sm:px-6 max-w-5xl mx-auto">
        <nav className="h-14 sm:h-15 liquid-glass-light rounded-2xl flex items-center justify-between px-3 sm:px-5 gap-2 transition-all duration-300">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform duration-300 hover:scale-105 bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400"
            >
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              Page Flip <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500">Pro</span>
            </span>
          </div>

          {/* View Switcher Tabs (Liquid Glass Capsule) */}
          <div className="flex items-center gap-1 bg-black/5 p-1 rounded-xl text-xs font-semibold backdrop-blur-md border border-white/60">
            <button
              onClick={() => setActiveView('studio')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'studio'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Studio Viewer
            </button>
            <button
              onClick={() => setActiveView('docs')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'docs'
                  ? 'bg-white text-slate-950 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Documentation & Guide
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setShowConfigDrawer(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-950 bg-white/70 hover:bg-white border border-white/80 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Configurator</span>
            </button>
            <a
              href="https://github.com/iamapinan/pdf-html5-page-flip"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-950 bg-white/70 hover:bg-white border border-white/80 transition-all shadow-xs"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer hover:opacity-95 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 active:scale-95 border border-white/25"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>
          </div>
        </nav>
      </header>

      {/* VIEW: STUDIO VIEWER */}
      {activeView === 'studio' && (
        <main className="relative z-10">
          {/* Hero Section (Synex Editorial: ข้อความข้างบน + ภาพหน้าจอข้างล่าง + Animations) */}
          <section className="relative px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16 max-w-[1400px] mx-auto text-center">
{/* Top App Name Badge */}
            <div className="animate-hero-1 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-200/90 bg-white/85 backdrop-blur-md shadow-xs mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse inline-block" />
              <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900">
                PDF HTML5 Page Flip <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 font-extrabold">Pro</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-mono text-slate-500 font-medium">Aura Edition</span>
            </div>

            {/* Headline with Synex Typographic Contrast */}
            <h1 className="animate-hero-2 text-4xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight leading-[1.08] sm:leading-[1.02] text-slate-950 mb-4 max-w-4xl mx-auto">
              <span className="block text-slate-400 font-medium tracking-normal text-3xl sm:text-5xl lg:text-[54px] mb-1">
                A New Standard
              </span>
              <span className="bg-gradient-to-r from-slate-950 via-slate-800 to-rose-900 bg-clip-text text-transparent">
                in Digital Flipbooks.
              </span>
            </h1>

            <p className="animate-hero-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
              Transform standard PDF documents into high-performance 3D interactive flipbooks with 60 FPS cubic-bezier peel physics, dynamic Web Audio acoustic paper friction, full-text search, and on-demand AI document synthesis.
            </p>

            {/* Quick Action Bar with Aura Glow */}
            <div className="animate-hero-3 flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-2xl text-white text-xs font-bold shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 transition-all cursor-pointer flex items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 active:scale-95 border border-white/30"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Local PDF</span>
              </button>

              <button
                onClick={() => {
                  setPdfSource('/demo-document.pdf');
                  setFileName('demo-document.pdf');
                }}
                className="px-5 py-3 rounded-2xl text-slate-800 hover:text-slate-950 text-xs font-semibold bg-white/80 hover:bg-white border border-white/90 shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-rose-500" />
                <span>Reset Demo Book</span>
              </button>

              <div
                onClick={() => {
                  navigator.clipboard.writeText('npm i @iamapinan/pdf-html5-page-flip');
                  setCopiedInstall(true);
                  setTimeout(() => setCopiedInstall(false), 2000);
                }}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-mono bg-white/70 hover:bg-white border border-slate-200/90 text-slate-700 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <span className="text-rose-500 font-bold">&gt;_</span>
                <span>npm i @iamapinan/pdf-html5-page-flip</span>
                {copiedInstall ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </div>
            </div>

            {/* ภาพหน้าจอข้างล่าง: Synex Floating Device / Screen Window with 3D Shadow & Glow */}
            <div id="studio" className="relative mt-4 mb-4 w-full max-w-[1360px] mx-auto animate-hero-screen-in">
              {/* Backlight Luminous Aura Diffusion Glow */}
              <div
                className="absolute -inset-4 sm:-inset-6 rounded-[40px] blur-3xl opacity-60 pointer-events-none -z-10 animate-aura-backlight"
                style={{
                  background: 'radial-gradient(ellipse at 50% 50%, rgba(254, 240, 138, 0.45) 0%, rgba(251, 113, 133, 0.35) 45%, rgba(254, 215, 170, 0.25) 75%, transparent 100%)'
                }}
              />

              {/* Floating Glass Device Mockup Window */}
              <div className="relative rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 bg-white/75 backdrop-blur-2xl border border-white/90 shadow-[0_30px_90px_-15px_rgba(251,113,133,0.22),0_15px_45px_-10px_rgba(15,23,42,0.1)] transition-all duration-500 hover:shadow-[0_40px_100px_-15px_rgba(251,113,133,0.3)] text-left">
                {/* macOS / iPad Window Header Chrome */}
                <div className="h-11 sm:h-13 px-3.5 sm:px-5 rounded-t-xl sm:rounded-t-2xl bg-slate-900/90 text-white backdrop-blur-md flex items-center justify-between text-xs shrink-0 border-b border-white/10">
                  {/* Traffic Light Dots */}
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
                    <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 ml-2">
                      synex.engine / page-flip-pro
                    </span>
                  </div>

                  {/* Window Document Title Pill */}
                  <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-medium text-slate-200">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span className="truncate max-w-[160px] sm:max-w-xs">{fileName}</span>
                    <span className="hidden md:inline px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono">
                      CLIENT SANDBOX
                    </span>
                  </div>

                  {/* Right Header Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('flipbook:toggle-immersive'))}
                      className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded text-[11px] font-semibold cursor-pointer border border-white/15 transition-all shadow-xs active:scale-95"
                      title="Enter Immersive Reading Mode"
                    >
                      <Maximize2 className="w-3 h-3 text-rose-400" />
                      <span className="hidden sm:inline">Immersive</span>
                    </button>
                    <button
                      onClick={handleCopyShareLink}
                      title="Share Direct Link"
                      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded text-[11px] text-slate-200 cursor-pointer transition-colors"
                    >
                      {copiedShareLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3 text-slate-300" />}
                      <span>{copiedShareLink ? 'Copied' : 'Share'}</span>
                    </button>
                    <button
                      onClick={() => setShowConfigDrawer(true)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-95 text-white rounded text-[11px] font-semibold cursor-pointer shadow-xs active:scale-95"
                    >
                      <Sliders className="w-3 h-3" />
                      <span className="hidden sm:inline">Configure Props</span>
                    </button>
                  </div>
                </div>

                {/* Live Flipbook Stage inside the Screen Mockup */}
                <div className={`relative w-full ${stageHeightClasses[config.stageHeight]} rounded-b-xl sm:rounded-b-2xl overflow-hidden bg-slate-900/5`}>
                  <PdfFlipbook
                    key={flipbookKey}
                    src={pdfSource}
                    theme={config.theme}
                    mode={config.mode}
                    toolbarPosition={config.toolbarPosition}
                    toolbarStyle="glass-overlay"
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

              {/* Animated Scroll to Explore Indicator */}
              <div className="flex flex-col items-center justify-center mt-8 gap-1.5 text-slate-400 animate-scroll-indicator">
                <span className="text-[11px] font-mono tracking-widest uppercase">Scroll to explore</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </section>

          {/* Section 2: Bento Architecture Cards & Source Selector (Scroll down section) */}
          <section className="px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="font-mono text-xs text-rose-500 font-semibold tracking-wider">[ 01-03 // SYSTEM ARCHITECTURE ]</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
                  Engineered for Native Experience
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                Every calculation executes locally with zero network hops, giving users instantaneous page flipping and complete privacy.
              </p>
            </div>

            {/* 3 Bento Cards with Frosted Aura Visual Windows */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              {/* Card 01 */}
              <div className="group relative bg-white/75 hover:bg-white/90 backdrop-blur-xl border border-white/90 hover:border-pink-200/80 rounded-3xl p-6 shadow-[0_12px_32px_-8px_rgba(251,113,133,0.08)] hover:shadow-[0_20px_48px_-8px_rgba(251,113,133,0.18)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-rose-400 tracking-wider">[ 01 ]</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
                    100% Client-Side Privacy
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    Decoded directly via Mozilla PDF.js inside Web Workers. Zero telemetry, zero cloud exposure.
                  </p>
                </div>
                {/* Frosted Aura Visual Window */}
                <div
                  className="h-28 rounded-2xl overflow-hidden relative border border-white/80 p-3.5 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: 'radial-gradient(circle at 80% 20%, rgba(254, 240, 138, 0.55) 0%, rgba(251, 113, 133, 0.25) 50%, rgba(255, 255, 255, 0.85) 100%)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 border border-white text-slate-700 font-semibold shadow-xs">
                      LOCAL SANDBOX
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-2.5 border border-white shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-800">
                      <span>Server Payload</span>
                      <span className="font-mono font-bold text-emerald-600">0 KB (Direct DOM)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 02 */}
              <div className="group relative bg-white/75 hover:bg-white/90 backdrop-blur-xl border border-white/90 hover:border-pink-200/80 rounded-3xl p-6 shadow-[0_12px_32px_-8px_rgba(251,113,133,0.08)] hover:shadow-[0_20px_48px_-8px_rgba(251,113,133,0.18)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-amber-500 tracking-wider">[ 02 ]</span>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
                    60 FPS Peel Simulation
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    GPU cubic-bezier curvature, realistic spine shadow depth, and dynamic Web Audio friction.
                  </p>
                </div>
                {/* Frosted Aura Visual Window */}
                <div
                  className="h-28 rounded-2xl overflow-hidden relative border border-white/80 p-3.5 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: 'radial-gradient(circle at 20% 80%, rgba(251, 113, 133, 0.45) 0%, rgba(254, 215, 170, 0.35) 50%, rgba(255, 255, 255, 0.85) 100%)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 border border-white text-slate-700 font-semibold shadow-xs">
                      PHYSICS EASING
                    </span>
                    <Volume2 className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-2.5 border border-white shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-800">
                      <span>Acoustic Friction</span>
                      <span className="font-mono font-bold text-rose-600">60 FPS Web Audio</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 03 */}
              <div className="group relative bg-white/75 hover:bg-white/90 backdrop-blur-xl border border-white/90 hover:border-pink-200/80 rounded-3xl p-6 shadow-[0_12px_32px_-8px_rgba(251,113,133,0.08)] hover:shadow-[0_20px_48px_-8px_rgba(251,113,133,0.18)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-pink-500 tracking-wider">[ 03 ]</span>
                    <span className="w-2 h-2 rounded-full bg-pink-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
                    React & Next.js Drop-in
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    Full TypeScript types, configurable liquid glass toolbars, custom accent color, and Web Component.
                  </p>
                </div>
                {/* Frosted Aura Visual Window */}
                <div
                  className="h-28 rounded-2xl overflow-hidden relative border border-white/80 p-3.5 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(244, 114, 182, 0.4) 0%, rgba(254, 240, 138, 0.3) 60%, rgba(255, 255, 255, 0.85) 100%)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/80 border border-white text-slate-700 font-semibold shadow-xs">
                      TYPESCRIPT
                    </span>
                    <Code2 className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-2.5 border border-white shadow-xs">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-800">
                      <span>Component</span>
                      <span className="font-mono font-bold text-pink-600">&lt;PdfFlipbook /&gt;</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Transition Header */}
            <div className="mt-16 pt-12 border-t border-slate-200/80 text-center max-w-3xl mx-auto">
              <span className="font-mono text-xs text-rose-500 font-semibold tracking-widest uppercase">
                [ DEVELOPER INTEGRATION // ZERO OVERHEAD ]
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-2 mb-3">
                Drop-in Component. Infinite Customization.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                Embed realistic 3D flipbook capabilities into any React, Next.js, or vanilla web application with a single tag and type-safe props.
              </p>
            </div>
          </section>

          {/* Quick React Integration Snippet (High-Contrast Aura Syntax Viewer) */}
          <section id="code" className="px-6 lg:px-12 py-10 max-w-5xl mx-auto">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900">React Component Props Implementation</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">Live Config Synchronized</span>
            </div>
            <CodeViewer code={generateReactCode()} />
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

                        {/* AI Assistant Model & Provider Configuration */}
            <div className="mb-5 border-b border-slate-200 pb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-slate-800 text-[11px] font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  <span>AI Model & Provider</span>
                </label>
                <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {aiSavedNotice ? 'Saved!' : 'Ready'}
                </span>
              </div>

              {/* Provider Selection (Tabs) */}
              <div className="grid grid-cols-3 gap-1 mb-3">
                {[
                  { id: 'local', name: 'Offline', desc: 'Free & Private' },
                  { id: 'gemini', name: 'Gemini', desc: 'Google AI' },
                  { id: 'openai', name: 'OpenAI', desc: 'ChatGPT' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setAiProvider(p.id as any);
                      saveAiSettings('flipbook_ai_provider', p.id);
                    }}
                    className={`py-1.5 px-2 rounded-lg font-semibold cursor-pointer text-center text-[11px] border transition-all ${
                      aiProvider === p.id
                        ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div>{p.name}</div>
                    <div className={`text-[9px] ${aiProvider === p.id ? 'text-rose-100' : 'text-slate-400'}`}>{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Gemini Provider Config */}
              {aiProvider === 'gemini' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700">Model:</span>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-rose-600 font-medium hover:underline"
                    >
                      Get Free Gemini Key ↗
                    </a>
                  </div>
                  <select
                    value={aiGeminiModel}
                    onChange={e => {
                      setAiGeminiModel(e.target.value);
                      saveAiSettings('flipbook_ai_gemini_model', e.target.value);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  >
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Powerful)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Sub-second)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep reasoning)</option>
                  </select>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Google AI API Key</label>
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={aiGeminiKey}
                      onChange={e => {
                        setAiGeminiKey(e.target.value);
                        saveAiSettings('flipbook_ai_gemini_key', e.target.value);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* OpenAI Provider Config */}
              {aiProvider === 'openai' && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-700">Model:</span>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-rose-600 font-medium hover:underline"
                    >
                      Get OpenAI Key ↗
                    </a>
                  </div>
                  <select
                    value={aiOpenAiModel}
                    onChange={e => {
                      setAiOpenAiModel(e.target.value);
                      saveAiSettings('flipbook_ai_openai_model', e.target.value);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Cost-efficient)</option>
                    <option value="gpt-4o">gpt-4o (High intelligence)</option>
                  </select>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">OpenAI API Key</label>
                    <input
                      type="password"
                      placeholder="sk-..."
                      value={aiOpenAiKey}
                      onChange={e => {
                        setAiOpenAiKey(e.target.value);
                        saveAiSettings('flipbook_ai_openai_key', e.target.value);
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* Local Provider Note */}
              {aiProvider === 'local' && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">100% Free & Offline:</span> Uses browser-native extractive NLP summarization with zero network calls and zero API key needed.
                </div>
              )}
            </div>

{/* Toolbar Position Selector */}
            <div className="mb-5 border-b border-slate-200 pb-5">
              <label className="block text-slate-600 text-[11px] font-semibold mb-1.5">Toolbar Floating Placement</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { key: 'top', label: 'Floating Top Overlay' },
                  { key: 'bottom', label: 'Floating Bottom Dock' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setConfig(c => ({ ...c, toolbarPosition: key as any }))}
                    className={`py-1.5 px-2 rounded-lg font-medium cursor-pointer transition-colors text-center border ${
                      config.toolbarPosition === key ? 'text-white border-transparent' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                    style={{ backgroundColor: config.toolbarPosition === key ? config.accentColor : undefined }}
                  >
                    {label}
                  </button>
                ))}
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

      {/* FAQ Section (Optimized for SEO, GEO & Answer Engines) */}
      <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto border-t border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">[ FAQ // DIRECT ANSWERS ]</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-1 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about the architecture, privacy, and integration of PDF HTML5 Page Flip Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">What is PDF HTML5 Page Flip Pro?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              PDF HTML5 Page Flip Pro is an open-source, client-side web application and React component that transforms standard PDF documents into interactive 3D flipbooks with natural page-peel physics, Web Audio paper sound, full-text search, and on-demand AI document summarization.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Does it upload confidential documents to the cloud?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No. All parsing and rendering execute completely inside the client device using Mozilla PDF.js in dedicated Web Workers. Confidential documents, financial statements, and proprietary books never leave your browser.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">How do I integrate this in React or Next.js?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Install via npm i @iamapinan/pdf-html5-page-flip, import the component and stylesheet, and pass the PDF source prop. For Next.js App Router, wrap it with next/dynamic and ssr: false since PDF.js requires browser window and canvas APIs.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Does it support mobile and tablet touch gestures?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes. The library includes native touch event handlers for swiping, dragging page corners, single-page mobile layout responsiveness, and automatic Retina/HiDPI viewport scaling.
            </p>
          </div>
        </div>
      </section>

      {/* Footer with Credit to @iamapinan */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-12 px-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm tracking-tight">PDF HTML5 Page Flip Pro</span>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 rounded-full font-mono">v2.1</span>
          </div>
          <p className="text-slate-600">
            Open-source Apache-2.0 License • High-performance client-side document reading
          </p>
          <div className="flex items-center gap-1.5 text-slate-600 pt-1">
            <span>Created & developed with care by</span>
            <a
              href="https://github.com/iamapinan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-rose-600 transition-colors underline decoration-slate-300 hover:decoration-rose-500 underline-offset-4"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>@iamapinan</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
