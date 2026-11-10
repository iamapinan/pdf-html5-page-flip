import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PageFlip } from 'page-flip';
import {
  PanelLeft,
  BookOpen,
  Upload,
  Globe,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Bookmark as BookmarkIcon,
  ZoomOut,
  ZoomIn,
  Maximize2,
  Columns2,
  Sparkles,
  Printer,
  Volume2,
  VolumeX,
  Palette,
  Expand,
  ListTree,
  Search,
  Grid,
  FileUp,
  Settings,
  X,
  CheckCircle2,
  FileText,
  Copy,
  RefreshCw,
  Check,
  Link as LinkIcon
} from 'lucide-react';
import { soundManager } from '../sound';
import { PdfFlipbookProps } from './types';

// Ensure PDF.js worker
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';
  }
}

export const PdfFlipbook: React.FC<PdfFlipbookProps> = ({
  src,
  theme = 'dark',
  mode = 'auto',
  accentColor = '#6366f1',
  showLogo = true,
  showToolbar = true,
  showSidebar = true,
  showNavigation = true,
  showSearch = true,
  showOutline = true,
  showBookmarks = true,
  showThumbnails = true,
  showAiSummary = true,
  showZoom = true,
  showPrint = true,
  showSound = true,
  showFullscreen = true,
  showThemeToggle = true,
  showViewToggle = true,
  showFileUpload = true,
  showUrlInput = true,
  flippingTime = 600,
  className = '',
  height = '100%',
  width = '100%',
  onPageChange,
  onDocumentLoad,
  onFileSelect
}) => {
  // State
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light' | 'wood'>(theme);
  const [activeTab, setActiveTab] = useState<'outline' | 'search' | 'bookmarks' | 'thumbs'>('outline');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputVal, setPageInputVal] = useState('1');
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [isDoublePage, setIsDoublePage] = useState(mode === 'double' || (mode === 'auto' && typeof window !== 'undefined' && window.innerWidth >= 768));
  const [loadingText, setLoadingText] = useState('Loading PDF...');
  const [loadingProgress, setLoadingProgress] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState<string>('');
  const [aiRawText, setAiRawText] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<string>('Ready');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ page: number; snippet: string }>>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [outlineItems, setOutlineItems] = useState<any[]>([]);

  // Remote URL Modal State
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [remoteUrlInput, setRemoteUrlInput] = useState('');

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mountWrapperRef = useRef<HTMLElement>(null);
  const bookContainerRef = useRef<HTMLDivElement | null>(null);
  const renderingPagesRef = useRef<Set<number>>(new Set());
  const activeRenderTasksRef = useRef<Map<number, any>>(new Map());
  const pageFlipRef = useRef<PageFlip | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const searchIndexRef = useRef<Array<{ page: number; text: string }>>([]);
  const renderedPagesRef = useRef<Set<number>>(new Set());
  const baseDimRef = useRef<{ width: number; height: number }>({ width: 595, height: 842 });
  const docIdRef = useRef<string>('doc');
  const objectUrlRef = useRef<string | null>(null);

  const isPdfFile = (file: File) => {
    if (!file) return false;
    return file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf') || !file.type;
  };

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (pageFlipRef.current) {
        try { pageFlipRef.current.destroy(); } catch {}
        pageFlipRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  // Trigger lazy rendering
  const triggerLazyRender = useCallback(async (current: number, total: number) => {
    if (!pdfDocRef.current || !bookContainerRef.current) return;
    const doc = pdfDocRef.current;
    const windowSize = 3;
    const minPage = Math.max(1, current - windowSize);
    const maxPage = Math.min(total, current + windowSize + (isDoublePage ? 1 : 0));

    for (let p = minPage; p <= maxPage; p++) {
      if (!renderedPagesRef.current.has(p) && !renderingPagesRef.current.has(p)) {
        const pageEl = bookContainerRef.current?.querySelector(`.page[data-page-number="${p}"]`);
        const canvas = pageEl?.querySelector('canvas') as HTMLCanvasElement;
        if (canvas && pageEl) {
          renderingPagesRef.current.add(p);
          try {
            const page = await doc.getPage(p);
            const dpr = window.devicePixelRatio || 1;
            const rect = pageEl.getBoundingClientRect();
            const targetWidth = rect.width || baseDimRef.current.width;
            const baseVp = page.getViewport({ scale: 1.0 });
            const scale = (targetWidth / baseVp.width) * dpr;

            const vp = page.getViewport({ scale });
            canvas.width = vp.width;
            canvas.height = vp.height;
            canvas.style.width = `${vp.width / dpr}px`;
            canvas.style.height = `${vp.height / dpr}px`;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              if (activeRenderTasksRef.current.has(p)) {
                try { activeRenderTasksRef.current.get(p)?.cancel(); } catch {}
                activeRenderTasksRef.current.delete(p);
              }
              const renderTask = page.render({ canvasContext: ctx, viewport: vp });
              activeRenderTasksRef.current.set(p, renderTask);
              await renderTask.promise;
              renderedPagesRef.current.add(p);
            }
          } catch (e: any) {
            if (e?.name !== 'RenderingCancelledException') {
              console.warn(`Render error page ${p}:`, e);
            }
          } finally {
            renderingPagesRef.current.delete(p);
            activeRenderTasksRef.current.delete(p);
          }
        }
      }
    }

    // Free memory for distant pages
    const pages = bookContainerRef.current.querySelectorAll<HTMLElement>('.page');
    pages.forEach(el => {
      const p = Number(el.dataset.pageNumber);
      if (p < current - 4 || p > current + 4) {
        if (renderedPagesRef.current.has(p)) {
          const canvas = el.querySelector('canvas');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
          renderedPagesRef.current.delete(p);
        }
      }
    });
  }, [isDoublePage]);

  // Initialize PageFlip instance
  const initFlipInstance = useCallback(async () => {
    if (!mountWrapperRef.current || !pdfDocRef.current || totalPages === 0) return;

    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch (e) {
        console.warn('Destroy error', e);
      }
      pageFlipRef.current = null;
    }

    // Ensure a fresh flipbook container exists inside stage
    let container = mountWrapperRef.current.querySelector<HTMLDivElement>('.flipbook-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'flipbook-container';
      mountWrapperRef.current.appendChild(container);
    }
    bookContainerRef.current = container;
    container.innerHTML = '';
    renderedPagesRef.current.clear();

    for (let i = 1; i <= totalPages; i++) {
      const pageEl = document.createElement('div');
      pageEl.className = 'page';
      pageEl.dataset.pageNumber = String(i);

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page-canvas';
      canvas.dataset.pageNumber = String(i);
      pageEl.appendChild(canvas);

      container.appendChild(pageEl);
    }

    const stage = mountWrapperRef.current;
    const availH = Math.max(360, (stage.clientHeight || 640) - 40);
    const availW = Math.max(300, (stage.clientWidth || 800) - 40);

    let bH = availH;
    let bW = Math.round((bH * baseDimRef.current.width) / baseDimRef.current.height);

    if (isDoublePage && bW * 2 > availW) {
      bW = Math.round(availW / 2);
      bH = Math.round((bW * baseDimRef.current.height) / baseDimRef.current.width);
    } else if (!isDoublePage && bW > availW) {
      bW = availW;
      bH = Math.round((bW * baseDimRef.current.height) / baseDimRef.current.width);
    }

    bW = Math.max(200, Math.round(bW * zoomLevel));
    bH = Math.max(280, Math.round(bH * zoomLevel));

    try {
      const pf = new PageFlip(container, {
        width: bW,
        height: bH,
        size: 'fixed',
        minWidth: 200,
        maxWidth: 2400,
        minHeight: 300,
        maxHeight: 2800,
        maxShadowOpacity: 0.5,
        showCover: true,
        usePortrait: !isDoublePage,
        flippingTime: flippingTime
      });

      const pageElements = container.querySelectorAll<HTMLElement>('.page');
      pf.loadFromHTML(pageElements);

      pf.on('flip', (e: any) => {
        const p = (e.data as number) + 1;
        setCurrentPage(p);
        setPageInputVal(String(p));
        if (showSound) soundManager.playPageFlip();
        triggerLazyRender(p, totalPages);
        onPageChange?.(p, totalPages);
      });

      pageFlipRef.current = pf;
      await triggerLazyRender(currentPage, totalPages);
    } catch (err) {
      console.error('Failed to init PageFlip instance:', err);
    }
  }, [totalPages, isDoublePage, zoomLevel, flippingTime, showSound, currentPage, triggerLazyRender, onPageChange]);

  // Load PDF Document with Remote CORS Fallback
  const loadPdfDocument = useCallback(async (source: string | File | ArrayBuffer, isRetry = false) => {
    setIsLoading(true);
    setLoadingProgress(20);
    setLoadingText('Connecting to PDF source...');

    try {
      let getDocParam: any;
      if (source instanceof File || source instanceof Blob) {
        setLoadingText(`Reading ${(source as File).name || 'local document'}...`);
        const buf = await source.arrayBuffer();
        getDocParam = { data: new Uint8Array(buf) };
        docIdRef.current = `${(source as File).name || 'uploaded'}-${source.size}`;
      } else if (source instanceof ArrayBuffer) {
        getDocParam = { data: new Uint8Array(source) };
        docIdRef.current = `buf-${Date.now()}`;
      } else if (typeof source === 'string') {
        getDocParam = { url: source };
        docIdRef.current = source.split('/').pop()?.split('?')[0] || 'doc';
        if (/^https?:\/\//i.test(source)) {
          setLoadingText(`Fetching remote PDF: ${source.substring(0, 45)}...`);
        }
      } else {
        getDocParam = source;
      }

      // Load saved bookmarks for document
      const savedBm = localStorage.getItem(`pdf_bm_${docIdRef.current}`);
      if (savedBm) {
        try { setBookmarks(JSON.parse(savedBm)); } catch { setBookmarks([]); }
      } else {
        setBookmarks([]);
      }

      let doc: pdfjsLib.PDFDocumentProxy;
      try {
        const task = pdfjsLib.getDocument(getDocParam);
        task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (total > 0) {
            setLoadingProgress(Math.round((loaded / total) * 50) + 25);
          }
        };
        doc = await task.promise;
      } catch (err: any) {
        // If direct fetch of remote URL failed and not already retrying, attempt with CORS proxy fallback
        if (typeof source === 'string' && /^https?:\/\//i.test(source) && !isRetry) {
          console.warn('Direct remote PDF load failed, trying CORS proxy fallback...', err);
          setLoadingText('Bypassing CORS restrictions via fallback proxy...');
          const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(source)}`;
          return await loadPdfDocument(proxyUrl, true);
        }
        throw err;
      }

      pdfDocRef.current = doc;
      setTotalPages(doc.numPages);
      setCurrentPage(1);

      const p1 = await doc.getPage(1);
      const vp = p1.getViewport({ scale: 1.0 });
      baseDimRef.current = { width: Math.round(vp.width), height: Math.round(vp.height) };

      onDocumentLoad?.(doc);
      setLoadingProgress(95);

      // Async index text for search
      if (showSearch) {
        searchIndexRef.current = [];
        (async () => {
          for (let p = 1; p <= doc.numPages; p++) {
            try {
              const page = await doc.getPage(p);
              const content = await page.getTextContent();
              const text = content.items.map((i: any) => i.str || '').join(' ');
              searchIndexRef.current.push({ page: p, text });
            } catch {}
          }
        })();
      }

      // Async outline
      if (showOutline) {
        doc.getOutline().then(outline => {
          if (outline) setOutlineItems(outline);
        }).catch(() => setOutlineItems([]));
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading PDF in React component:', err);
      setLoadingText('Failed to load PDF. Check the URL or file permissions.');
    }
  }, [onDocumentLoad, showSearch, showOutline]);

  // Initial & Source Changes
  useEffect(() => {
    if (src) {
      loadPdfDocument(src);
    }
  }, [src, loadPdfDocument]);

  // Flipbook re-init on dimensions/layout change
  useEffect(() => {
    if (!isLoading && totalPages > 0) {
      initFlipInstance();
    }
  }, [isLoading, totalPages, isDoublePage, zoomLevel, initFlipInstance]);

  // Debounced window resize handler
  useEffect(() => {
    let timeout: any;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!isLoading && totalPages > 0) {
          initFlipInstance();
        }
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoading, totalPages, initFlipInstance]);

  // Navigation handlers
  const handleTurnToPage = (p: number) => {
    if (p >= 1 && p <= totalPages && pageFlipRef.current) {
      pageFlipRef.current.turnToPage(p - 1);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = () => {
    setBookmarks(prev => {
      const exists = prev.includes(currentPage);
      const next = exists ? prev.filter(p => p !== currentPage) : [...prev, currentPage].sort((a,b)=>a-b);
      localStorage.setItem(`pdf_bm_${docIdRef.current}`, JSON.stringify(next));
      return next;
    });
  };

  // Search execution
  const handleSearch = (q: string) => {
    setSearchQuery(q);
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    const matches: Array<{ page: number; snippet: string }> = [];
    for (const item of searchIndexRef.current) {
      const idx = item.text.toLowerCase().indexOf(trimmed);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(item.text.length, idx + trimmed.length + 40);
        let snip = item.text.substring(start, end);
        if (start > 0) snip = '...' + snip;
        if (end < item.text.length) snip = snip + '...';
        matches.push({ page: item.page, snippet: snip });
      }
    }
    setSearchResults(matches);
  };

  // AI Summary Trigger
  const handleAiSummary = async () => {
    if (!pdfDocRef.current) return;
    setIsAiModalOpen(true);
    setAiStatus('Extracting active page text...');
    try {
      const p = await pdfDocRef.current.getPage(currentPage);
      const tc = await p.getTextContent();
      const raw = tc.items.map((i: any) => i.str || '').join(' ');
      setAiRawText(raw || 'No selectable text on this page.');

      if (!raw.trim()) {
        setAiSummaryText('No readable text detected on this page.');
        setAiStatus('Done (empty)');
        return;
      }

      setAiStatus('Generating insights...');
      const sentences = raw.split(/[.?!]\s+/).map(s => s.trim()).filter(s => s.length > 20);
      const bullets = sentences.slice(0, 4);

      setAiSummaryText(bullets.length > 0 ? bullets.map(b => `• ${b}`).join('\n\n') : raw.substring(0, 250) + '...');
      setAiStatus('Extraction Complete');
    } catch {
      setAiStatus('Error during extraction.');
    }
  };

  // Print current page
  const handlePrint = () => {
    if (!bookContainerRef.current) return;
    const pageEl = bookContainerRef.current.querySelector(`.page[data-page-number="${currentPage}"]`);
    const canvas = pageEl?.querySelector('canvas');
    if (!canvas) {
      window.print();
      return;
    }
    const url = canvas.toDataURL('image/png');
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<img src="${url}" onload="window.print(); window.close();" style="max-width:100%; height:auto;" />`);
      w.document.close();
    }
  };

  const handleLoadRemoteUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = remoteUrlInput.trim();
    if (cleanUrl) {
      loadPdfDocument(cleanUrl);
      setIsUrlModalOpen(false);
      setRemoteUrlInput('');
    }
  };

  const themeClass = currentTheme === 'light' ? 'theme-light' : currentTheme === 'wood' ? 'theme-wood' : 'theme-dark';
  const isBookmarked = bookmarks.includes(currentPage);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 h-full w-full ${themeClass} ${className}`}
      style={{ height, width, ['--flip-accent' as any]: accentColor }}
    >
      {/* Top Glassmorphism Toolbar */}
      {showToolbar && (
        <header className="h-14 border-b border-white/10 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-3 md:px-5 z-40 text-slate-200 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            {showSidebar && (
              <button
                onClick={() => setIsSidebarOpen(v => !v)}
                title="Toggle Sidebar"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            {showLogo && (
              <div className="flex items-center gap-2 border-r border-white/10 pr-3 mr-1">
                <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
                <span className="font-semibold text-sm md:text-base tracking-tight hidden sm:inline text-white">
                  Page Flip <span className="font-bold" style={{ color: accentColor }}>Pro</span>
                </span>
              </div>
            )}

            {showFileUpload && (
              <>
                <label
                  htmlFor="react-pdf-file-input"
                  title="Open PDF File"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-xs font-medium rounded-md transition-colors cursor-pointer text-slate-200 hover:text-white border border-white/10"
                >
                  <Upload className="w-4 h-4 text-indigo-300" />
                  <span className="hidden md:inline">Open PDF</span>
                </label>
                <input
                  type="file"
                  id="react-pdf-file-input"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f && isPdfFile(f)) {
                      loadPdfDocument(f);
                      onFileSelect?.(f);
                    }
                    e.target.value = '';
                  }}
                />
              </>
            )}

            {showUrlInput && (
              <button
                onClick={() => setIsUrlModalOpen(true)}
                title="Open Remote PDF from URL"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-xs font-medium rounded-md transition-colors cursor-pointer text-slate-200 hover:text-white border border-white/10"
              >
                <Globe className="w-4 h-4 text-emerald-300" />
                <span className="hidden md:inline">Open URL</span>
              </button>
            )}
          </div>

          {/* Navigation */}
          {showNavigation && (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => handleTurnToPage(1)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage <= 1}
                onClick={() => pageFlipRef.current?.flipPrev()}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-2 py-1 bg-black/30 rounded-md border border-white/10 text-xs font-medium">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInputVal}
                  onChange={e => setPageInputVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const p = parseInt(pageInputVal, 10);
                      if (!isNaN(p) && p >= 1 && p <= totalPages) handleTurnToPage(p);
                    }
                  }}
                  onBlur={() => {
                    const p = parseInt(pageInputVal, 10);
                    if (!isNaN(p) && p >= 1 && p <= totalPages) handleTurnToPage(p);
                    else setPageInputVal(String(currentPage));
                  }}
                  aria-label="Current page number"
                  className="w-10 text-center bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded text-white font-medium"
                />
                <span className="text-slate-400">/</span>
                <span className="text-slate-300 min-w-[20px] text-center">{totalPages || '-'}</span>
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => pageFlipRef.current?.flipNext()}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => handleTurnToPage(totalPages)}
                className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {showBookmarks && (
              <button
                onClick={handleToggleBookmark}
                title="Bookmark page"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-amber-400"
              >
                <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'text-amber-400 fill-amber-400' : ''}`} />
              </button>
            )}

            {showZoom && (
              <div className="hidden md:flex items-center gap-0.5 bg-black/20 rounded-md p-0.5 border border-white/10">
                <button
                  onClick={() => setZoomLevel(z => Math.max(0.6, +(z - 0.15).toFixed(2)))}
                  className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1.5 text-slate-300 min-w-[42px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(z => Math.min(2.0, +(z + 0.15).toFixed(2)))}
                  className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1.0)}
                  className="p-1.5 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {showViewToggle && (
              <button
                onClick={() => setIsDoublePage(v => !v)}
                title="Toggle 1-Page / 2-Page Mode"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
              >
                <Columns2 className="w-4 h-4" />
              </button>
            )}

            {showAiSummary && (
              <button
                onClick={handleAiSummary}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 hover:from-indigo-500/50 hover:to-purple-500/50 border border-indigo-400/40 rounded-lg text-indigo-200 hover:text-white text-xs font-medium cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                <span className="hidden lg:inline">AI Summary</span>
              </button>
            )}

            {showPrint && (
              <button
                onClick={handlePrint}
                title="Print current page"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {showSound && (
              <button
                onClick={() => setIsMuted(soundManager.toggleMute())}
                title="Toggle audio"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
              </button>
            )}

            {showThemeToggle && (
              <button
                onClick={() => {
                  const seq: Array<'dark' | 'light' | 'wood'> = ['dark', 'light', 'wood'];
                  const next = seq[(seq.indexOf(currentTheme) + 1) % seq.length];
                  setCurrentTheme(next);
                }}
                title="Cycle background theme"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
              >
                <Palette className="w-4 h-4" />
              </button>
            )}

            {showFullscreen && (
              <button
                onClick={() => {
                  if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
                  else document.exitFullscreen();
                }}
                title="Toggle Fullscreen"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-300 hover:text-white"
              >
                <Expand className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Section */}
      <div className="flex-1 flex overflow-hidden relative h-full min-h-0">
        {/* Collapsible Sidebar */}
        {showSidebar && (
          <aside
            className={`w-80 border-r border-white/10 bg-slate-900/95 backdrop-blur-xl flex flex-col z-30 transition-transform duration-300 ease-in-out absolute inset-y-0 left-0 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:relative md:translate-x-0'
            } shadow-2xl md:shadow-none`}
          >
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-black/20 text-xs font-medium text-slate-400">
              {showOutline && (
                <button
                  onClick={() => setActiveTab('outline')}
                  className={`flex-1 py-3 px-2 text-center border-b-2 flex justify-center items-center gap-1.5 cursor-pointer ${
                    activeTab === 'outline' ? 'border-indigo-500 text-white font-semibold' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  <ListTree className="w-3.5 h-3.5" />
                  <span>Outline</span>
                </button>
              )}
              {showSearch && (
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 py-3 px-2 text-center border-b-2 flex justify-center items-center gap-1.5 cursor-pointer ${
                    activeTab === 'search' ? 'border-indigo-500 text-white font-semibold' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              )}
              {showBookmarks && (
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex-1 py-3 px-2 text-center border-b-2 flex justify-center items-center gap-1.5 cursor-pointer ${
                    activeTab === 'bookmarks' ? 'border-indigo-500 text-white font-semibold' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  <BookmarkIcon className="w-3.5 h-3.5" />
                  <span>Marks</span>
                </button>
              )}
              {showThumbnails && (
                <button
                  onClick={() => setActiveTab('thumbs')}
                  className={`flex-1 py-3 px-2 text-center border-b-2 flex justify-center items-center gap-1.5 cursor-pointer ${
                    activeTab === 'thumbs' ? 'border-indigo-500 text-white font-semibold' : 'border-transparent hover:text-slate-200'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Thumbs</span>
                </button>
              )}
            </div>

            {/* Pane Contents */}
            <div className="flex-1 overflow-y-auto p-3 text-xs text-slate-300">
              {activeTab === 'outline' && (
                <div className="space-y-1">
                  {outlineItems.length > 0 ? (
                    outlineItems.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={async () => {
                          if (item.dest && pdfDocRef.current) {
                            let pIdx = -1;
                            if (typeof item.dest === 'string') {
                              const d = await pdfDocRef.current.getDestination(item.dest);
                              if (d) pIdx = await pdfDocRef.current.getPageIndex(d[0]);
                            } else if (Array.isArray(item.dest)) {
                              pIdx = await pdfDocRef.current.getPageIndex(item.dest[0]);
                            }
                            if (pIdx >= 0) handleTurnToPage(pIdx + 1);
                          }
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg cursor-pointer transition-colors flex justify-between items-center"
                      >
                        <span>{item.title}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      No bookmarks in this document.
                      <div className="mt-3 grid grid-cols-2 gap-1.5">
                        <button onClick={() => handleTurnToPage(1)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-[11px]">Start</button>
                        <button onClick={() => handleTurnToPage(totalPages)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-[11px]">End</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'search' && (
                <div className="flex flex-col h-full">
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      placeholder="Search text in document..."
                      className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2">
                    {searchQuery ? `Found ${searchResults.length} matches` : 'Type keyword to search'}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {searchResults.map((m, i) => (
                      <div
                        key={i}
                        onClick={() => handleTurnToPage(m.page)}
                        className="p-2.5 bg-black/20 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/5"
                      >
                        <span className="text-indigo-400 font-semibold block mb-0.5">Page {m.page}</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{m.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-slate-400 font-medium">Saved Pages</span>
                    <button
                      onClick={() => {
                        setBookmarks([]);
                        localStorage.removeItem(`pdf_bm_${docIdRef.current}`);
                      }}
                      className="text-rose-400 hover:underline text-[11px]"
                    >
                      Clear
                    </button>
                  </div>
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">No bookmarks saved.</div>
                  ) : (
                    bookmarks.map(p => (
                      <div
                        key={p}
                        onClick={() => handleTurnToPage(p)}
                        className="flex items-center justify-between p-2 bg-black/20 hover:bg-white/10 rounded-lg cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <BookmarkIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-slate-200">Page {p}</span>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setBookmarks(b => {
                              const n = b.filter(x => x !== p);
                              localStorage.setItem(`pdf_bm_${docIdRef.current}`, JSON.stringify(n));
                              return n;
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'thumbs' && (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <div
                      key={p}
                      onClick={() => handleTurnToPage(p)}
                      className={`p-2 bg-black/20 hover:bg-white/10 rounded-lg cursor-pointer border text-center ${
                        currentPage === p ? 'border-indigo-500' : 'border-white/5'
                      }`}
                    >
                      <div className="w-full aspect-[3/4] bg-white rounded shadow flex items-center justify-center text-slate-800 font-bold">
                        {p}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Page {p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Central Flipbook Stage */}
        <main
          id="stage"
          ref={mountWrapperRef}
          className="flex-1 relative flex items-center justify-center p-2 sm:p-6 overflow-hidden h-full min-h-0 w-full"
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f && isPdfFile(f)) {
              loadPdfDocument(f);
              onFileSelect?.(f);
            }
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 border-4 border-white/20 rounded-full animate-spin mb-4" />
              <h4 className="text-sm font-medium text-slate-200 tracking-wide max-w-sm truncate">{loadingText}</h4>
              <div className="w-48 h-1.5 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${loadingProgress}%` }} />
              </div>
            </div>
          )}

          <div ref={bookContainerRef} className="flipbook-container" />
        </main>
      </div>

      {/* Open Remote PDF by URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Open Remote PDF via URL</h3>
              </div>
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLoadRemoteUrl} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">Public PDF Web Address (URL)</label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/document.pdf"
                    value={remoteUrlInput}
                    onChange={e => setRemoteUrlInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Direct links or CORS-protected PDFs are supported via automated fallback.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white shadow"
                >
                  Load Remote PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Document Assistant</h3>
                  <span className="text-[11px] text-indigo-300 font-mono">Page {currentPage} of {totalPages}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAiSettingsOpen(v => !v)}
                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
              {aiSettingsOpen && (
                <div className="bg-black/30 border border-white/10 rounded-xl p-3.5 space-y-2">
                  <span className="font-medium text-slate-200">LLM Provider</span>
                  <input
                    type="password"
                    placeholder="Enter Gemini / OpenAI API key..."
                    className="w-full bg-slate-800 border border-white/15 rounded-md px-2.5 py-1.5 text-white"
                    onChange={e => localStorage.setItem('pdf_llm_key', e.target.value)}
                  />
                </div>
              )}

              <div>
                <h4 className="text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Key Takeaways
                </h4>
                <div className="bg-black/30 border border-white/10 rounded-xl p-4 leading-relaxed whitespace-pre-line text-slate-200">
                  {aiSummaryText || 'Click summarize to extract insights.'}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    Extracted Text
                  </h4>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiRawText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] text-slate-300 font-mono max-h-36 overflow-y-auto whitespace-pre-wrap select-text">
                  {aiRawText}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between bg-black/20 text-xs">
              <span className="text-slate-400 text-[11px]">{aiStatus}</span>
              <button
                onClick={handleAiSummary}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-summarize</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
