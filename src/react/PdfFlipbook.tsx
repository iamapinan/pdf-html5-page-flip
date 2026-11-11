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
  Link as LinkIcon,
  Eye,
  EyeOff,
  Sliders
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

// Visual Page Thumbnail Component
const ThumbnailItem: React.FC<{
  pageNumber: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  isActive: boolean;
  accentColor: string;
  onClick: () => void;
}> = ({ pageNumber, pdfDoc, isActive, accentColor, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let active = true;
    if (!pdfDoc || !canvasRef.current) return;

    pdfDoc.getPage(pageNumber).then(page => {
      if (!active || !canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: 0.22 * dpr });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        if (active) setIsRendered(true);
      }).catch(() => {});
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, [pageNumber, pdfDoc]);

  return (
    <div
      onClick={onClick}
      className={`p-2 rounded-xl cursor-pointer border transition-all text-center flex flex-col items-center group ${
        isActive
          ? 'bg-white/10 shadow-lg ring-1'
          : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/15'
      }`}
      style={{
        borderColor: isActive ? accentColor : undefined,
        ['--tw-ring-color' as any]: isActive ? `${accentColor}80` : undefined
      }}
    >
      <div className="w-full aspect-[3/4] bg-white rounded-lg overflow-hidden flex items-center justify-center relative shadow-sm">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
        {!isRendered && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-400 font-semibold text-xs">
            {pageNumber}
          </div>
        )}
      </div>
      <span
        className={`text-[10px] mt-1.5 font-medium ${
          isActive ? 'font-bold' : 'text-slate-400 group-hover:text-slate-200'
        }`}
        style={{ color: isActive ? accentColor : undefined }}
      >
        Page {pageNumber}
      </span>
    </div>
  );
};

export const PdfFlipbook: React.FC<PdfFlipbookProps> = ({
  src,
  theme = 'dark',
  mode = 'auto',
  accentColor = '#6366f1',
  showLogo = true,
  showToolbar = true,
  toolbarPosition = 'top',
  toolbarStyle = 'glass-overlay',
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
  flippingTime = 800,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputVal, setPageInputVal] = useState('1');
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [isDoublePage, setIsDoublePage] = useState(
    mode === 'double' || (mode === 'auto' && typeof window !== 'undefined' && window.innerWidth >= 768)
  );
  const [loadingText, setLoadingText] = useState('Loading PDF...');
  const [loadingProgress, setLoadingProgress] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // AI Assistant State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);
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
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [aiSavedNotice, setAiSavedNotice] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState<string>('');
  const [aiRawText, setAiRawText] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<string>('Ready');
  const [aiIsLoading, setAiIsLoading] = useState(false);

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ page: number; snippet: string }>>([]);
  const [outlineItems, setOutlineItems] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // DOM Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const mountWrapperRef = useRef<HTMLDivElement>(null);
  const bookContainerRef = useRef<HTMLDivElement | null>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  // Stable Refs
  const currentPageRef = useRef(1);
  currentPageRef.current = currentPage;

  const renderedPagesRef = useRef<Set<number>>(new Set());
  const renderingPagesRef = useRef<Set<number>>(new Set());
  const activeRenderTasksRef = useRef<Map<number, any>>(new Map());
  const baseDimRef = useRef<{ width: number; height: number }>({ width: 595, height: 842 });
  const searchIndexRef = useRef<Array<{ page: number; text: string }>>([]);
  const docIdRef = useRef<string>('doc_default');

  // Sync mode prop
  useEffect(() => {
    if (mode === 'single') setIsDoublePage(false);
    else if (mode === 'double') setIsDoublePage(true);
    else if (mode === 'auto' && typeof window !== 'undefined') {
      setIsDoublePage(window.innerWidth >= 768);
    }
  }, [mode]);

  // Sync theme prop
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // Save AI Settings
  const handleSaveAiSettings = () => {
    localStorage.setItem('flipbook_ai_provider', aiProvider);
    localStorage.setItem('flipbook_ai_gemini_key', aiGeminiKey);
    localStorage.setItem('flipbook_ai_gemini_model', aiGeminiModel);
    localStorage.setItem('flipbook_ai_openai_key', aiOpenAiKey);
    localStorage.setItem('flipbook_ai_openai_model', aiOpenAiModel);
    setAiSavedNotice(true);
    setTimeout(() => setAiSavedNotice(false), 2000);
  };

  // Helper to validate PDF files reliably
  const isPdfFile = (file: File) => {
    if (!file) return false;
    return (
      file.type === 'application/pdf' ||
      file.type.includes('pdf') ||
      file.name.toLowerCase().endsWith('.pdf') ||
      !file.type
    );
  };

  // Cleanup render tasks on unmount
  useEffect(() => {
    return () => {
      activeRenderTasksRef.current.forEach(task => {
        try {
          task.cancel();
        } catch (_) {}
      });
      activeRenderTasksRef.current.clear();
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy();
        } catch (_) {}
      }
    };
  }, []);

  // Trigger lazy rendering
  const triggerLazyRender = useCallback(async (current: number, total: number) => {
    if (!pdfDocRef.current || !bookContainerRef.current) return;
    const doc = pdfDocRef.current;
    const windowSize = 2;
    const minPage = Math.max(1, current - windowSize);
    const maxPage = Math.min(total, current + windowSize + 1);

    for (let p = minPage; p <= maxPage; p++) {
      if (!renderedPagesRef.current.has(p) && !renderingPagesRef.current.has(p)) {
        const pageEl = bookContainerRef.current?.querySelector(`.page[data-page-number="${p}"]`);
        const canvas = pageEl?.querySelector('canvas') as HTMLCanvasElement;
        if (canvas && pageEl) {
          renderingPagesRef.current.add(p);
          try {
            const page = await doc.getPage(p);
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const vp = page.getViewport({ scale: 1.5 * dpr });
            canvas.width = vp.width;
            canvas.height = vp.height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              if (activeRenderTasksRef.current.has(p)) {
                try {
                  activeRenderTasksRef.current.get(p).cancel();
                } catch (_) {}
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

    // Only free memory for very large documents (total > 40)
    if (total > 40) {
      const pages = bookContainerRef.current.querySelectorAll<HTMLElement>('.page');
      pages.forEach(el => {
        const p = Number(el.dataset.pageNumber);
        if (Math.abs(p - current) > 8) {
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
    }
  }, []);

  // Dynamically update book state classes and CSS variables for seamless shadows
  const updateBookStateClass = useCallback((page: number, total: number, doublePage: boolean) => {
    if (!bookContainerRef.current) return;
    const container = bookContainerRef.current;
    container.classList.remove('book-state-first-page', 'book-state-last-page', 'book-state-open', 'book-state-single');

    const stageW = mountWrapperRef.current?.clientWidth || 800;
    const effectiveDouble = doublePage && stageW >= 560;

    // Sync book rect geometry for pixel-perfect vertical and horizontal alignment
    const pf = pageFlipRef.current;
    if (pf) {
      try {
        const rect = (pf as any).getRender()?.getRect();
        if (rect) {
          container.style.setProperty('--book-top', `${rect.top}px`);
          container.style.setProperty('--book-height', `${rect.height}px`);
          container.style.setProperty('--book-page-width', `${rect.pageWidth}px`);
          container.style.setProperty('--book-full-width', `${rect.width}px`);
        }
      } catch (_) {}
    }

    if (!effectiveDouble || total <= 1) {
      container.classList.add('book-state-single');
      return;
    }

    // Inspect spread configuration from PageFlip if available
    if (pf && typeof (pf as any).getPageCollection === 'function') {
      try {
        const pageCol = (pf as any).getPageCollection();
        const spread = pageCol.getSpread();
        const spreadIdx = pageCol.getCurrentSpreadIndex();
        if (spread && spread[spreadIdx]) {
          const curSpread = spread[spreadIdx];
          if (curSpread.length === 1) {
            if (curSpread[0] === 0) {
              container.classList.add('book-state-first-page');
              return;
            } else {
              container.classList.add('book-state-last-page');
              return;
            }
          } else if (curSpread.length > 1) {
            container.classList.add('book-state-open');
            return;
          }
        }
      } catch (_) {}
    }

    // Fallback if PageFlip instance is still initialising
    if (page <= 1) {
      container.classList.add('book-state-first-page');
    } else if (page >= total) {
      if (total % 2 === 0) {
        container.classList.add('book-state-last-page');
      } else {
        container.classList.add('book-state-open');
      }
    } else {
      container.classList.add('book-state-open');
    }
  }, []);

  // Initialize PageFlip instance
  const initFlipInstance = useCallback(async () => {
    if (!mountWrapperRef.current || !pdfDocRef.current || totalPages === 0) return;

    if (pageFlipRef.current) {
      try {
        pageFlipRef.current.destroy();
      } catch (e) {
        console.warn('PageFlip destroy notice', e);
      }
      pageFlipRef.current = null;
    }

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
    const isFs = typeof document !== 'undefined' && Boolean(document.fullscreenElement);
    const availH = Math.max(260, (stage.clientHeight || (isFs ? window.innerHeight - 60 : 640)) - (isFs ? 40 : 20));
    const availW = Math.max(260, (stage.clientWidth || (isFs ? window.innerWidth : 800)) - (isFs ? 40 : 16));
    const pageAspect = baseDimRef.current.width / baseDimRef.current.height;

    // Automatically adapt to single page portrait on narrow mobile screens (< 560px)
    const effectiveDoublePage = isDoublePage && availW >= 560;

    let bW: number;
    let bH: number;

    if (effectiveDoublePage) {
      // Fit 2 pages side-by-side
      const maxW = Math.floor((availW - (isFs ? 50 : 36)) / 2);
      const maxH = availH - (isFs ? 30 : 20);
      if (maxW / pageAspect <= maxH) {
        bW = maxW;
        bH = Math.floor(bW / pageAspect);
      } else {
        bH = maxH;
        bW = Math.floor(bH * pageAspect);
      }
    } else {
      // Fit single page
      const maxW = availW - (isFs ? 40 : 16);
      const maxH = availH - (isFs ? 30 : 16);
      if (maxW / pageAspect <= maxH) {
        bW = maxW;
        bH = Math.floor(bW / pageAspect);
      } else {
        bH = maxH;
        bW = Math.floor(bH * pageAspect);
      }
    }

    bW = Math.max(160, Math.floor(bW * zoomLevel));
    bH = Math.max(240, Math.floor(bH * zoomLevel));

    try {
      const pf = new PageFlip(container, {
        width: bW,
        height: bH,
        size: 'fixed',
        minWidth: 150,
        maxWidth: 2400,
        minHeight: 200,
        maxHeight: 2800,
        maxShadowOpacity: 0.35,
        swipeDistance: 30,
        drawShadow: true,
        showCover: true,
        usePortrait: !effectiveDoublePage,
        flippingTime: flippingTime || 750
      });

      const pageElements = container.querySelectorAll<HTMLElement>('.page');
      pf.loadFromHTML(pageElements);

      // Enforce smooth soft paper peel animation for all pages including first page cover
      try {
        const pages = (pf as any).getPageCollection()?.getPages() || [];
        pages.forEach((p: any) => {
          if (typeof p.setDensity === 'function') p.setDensity('soft');
          if (typeof p.setDrawingDensity === 'function') p.setDrawingDensity('soft');
        });
      } catch (_) {}

      pf.on('flip', (e: any) => {
        const p = (e.data as number) + 1;
        currentPageRef.current = p;
        setCurrentPage(p);
        setPageInputVal(String(p));
        if (showSound) soundManager.playPageFlip();
        triggerLazyRender(p, totalPages);
        updateBookStateClass(p, totalPages, effectiveDoublePage);
        onPageChange?.(p, totalPages);
      });

      pageFlipRef.current = pf;

      // Restore target page cleanly without jumping
      const target = Math.min(currentPageRef.current, totalPages);
      if (target > 1) {
        try {
          pf.turnToPage(target - 1);
        } catch (_) {}
      }

      updateBookStateClass(target, totalPages, effectiveDoublePage);
      await triggerLazyRender(target, totalPages);
    } catch (err) {
      console.error('Failed to init PageFlip instance:', err);
    }
  }, [totalPages, isDoublePage, zoomLevel, flippingTime, showSound, triggerLazyRender, updateBookStateClass, onPageChange]);

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
        getDocParam = { data: buf };
        docIdRef.current = `file_${(source as File).name}_${(source as File).size}`;
      } else if (source instanceof ArrayBuffer) {
        getDocParam = { data: source };
        docIdRef.current = `buf_${source.byteLength}`;
      } else if (typeof source === 'string') {
        const cleanUrl = source.trim();
        docIdRef.current = `url_${cleanUrl.split('/').pop()?.split('?')[0] || 'doc'}`;
        if (isRetry && /^https?:\/\//i.test(cleanUrl)) {
          setLoadingText('Connecting via CORS proxy fallback...');
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`;
          getDocParam = { url: proxyUrl };
        } else {
          getDocParam = { url: cleanUrl };
        }
      } else {
        throw new Error('Unsupported PDF source type');
      }

      setLoadingProgress(45);
      setLoadingText('Parsing PDF structure...');

      const loadingTask = pdfjsLib.getDocument({
        ...getDocParam,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/cmaps/',
        cMapPacked: true
      });

      loadingTask.onProgress = (p: { loaded: number; total: number }) => {
        if (p.total > 0) {
          const pct = Math.min(85, Math.round((p.loaded / p.total) * 60) + 20);
          setLoadingProgress(pct);
        }
      };

      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      setLoadingProgress(90);
      setLoadingText('Rasterizing layout...');

      // Get page 1 natural aspect ratio
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1.0 });
      baseDimRef.current = { width: viewport.width, height: viewport.height };

      // Load bookmarks from local storage
      const savedBm = localStorage.getItem(`pdf_bm_${docIdRef.current}`);
      if (savedBm) {
        try {
          setBookmarks(JSON.parse(savedBm));
        } catch (_) {}
      }

      // Extract outline (TOC)
      pdf.getOutline().then(outline => {
        if (outline) setOutlineItems(outline);
      }).catch(() => {});

      // Index text for full-text search in background
      searchIndexRef.current = [];
      (async () => {
        for (let i = 1; i <= Math.min(pdf.numPages, 100); i++) {
          try {
            const p = await pdf.getPage(i);
            const tc = await p.getTextContent();
            const text = tc.items.map((it: any) => it.str || '').join(' ');
            searchIndexRef.current.push({ page: i, text });
          } catch (_) {}
        }
      })();

      onDocumentLoad?.(pdf);
      setLoadingProgress(100);
      setIsLoading(false);
    } catch (err: any) {
      console.error('PDF load error:', err);
      if (!isRetry && typeof source === 'string' && /^https?:\/\//i.test(source)) {
        loadPdfDocument(source, true);
      } else {
        setLoadingText('Failed to load PDF. Check the URL or file permissions.');
        setIsLoading(false);
      }
    }
  }, [onDocumentLoad]);

  // Initial source load
  useEffect(() => {
    if (src) {
      loadPdfDocument(src);
    }
  }, [src, loadPdfDocument]);

  // Keep book state class and shadow geometry synchronized
  useEffect(() => {
    updateBookStateClass(currentPage, totalPages, isDoublePage);
  }, [currentPage, totalPages, isDoublePage, updateBookStateClass]);

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
      }, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoading, totalPages, initFlipInstance]);

  // Fullscreen change listener to dynamically rescale flipbook canvas
  useEffect(() => {
    const handleFullscreenChange = () => {
      setTimeout(() => {
        if (!isLoading && totalPages > 0) {
          initFlipInstance();
        }
      }, 100);
      setTimeout(() => {
        if (!isLoading && totalPages > 0) {
          initFlipInstance();
        }
      }, 350);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isLoading, totalPages, initFlipInstance]);

  // Navigation handlers
  // Horizontal scroll handler for toolbar with mouse wheel
  const handleToolbarWheel = (e: React.WheelEvent<HTMLElement>) => {
    if (e.deltaY !== 0 && e.currentTarget) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const handleTurnToPage = (p: number) => {
    if (p >= 1 && p <= totalPages && pageFlipRef.current) {
      pageFlipRef.current.turnToPage(p - 1);
      currentPageRef.current = p;
      setCurrentPage(p);
      setPageInputVal(String(p));
      triggerLazyRender(p, totalPages);
      updateBookStateClass(p, totalPages, isDoublePage);
      onPageChange?.(p, totalPages);
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

  // Local smart extractive summarizer
  const generateLocalSummary = (raw: string) => {
    const sentences = raw.split(/[.?!]\s+/).map(s => s.trim()).filter(s => s.length > 25);
    const numbers = raw.match(/\b\d+(?:[\.,]\d+)?%?|\$\d+(?:[\.,]\d+)?\b/g) || [];
    const uniqueNumbers = Array.from(new Set(numbers)).slice(0, 5);

    let output = '';
    output += `### Executive Summary (Page ${currentPage})\n\n`;

    if (sentences.length > 0) {
      output += `${sentences[0]}.\n\n`;
    } else {
      output += `Overview of document content on page ${currentPage}.\n\n`;
    }

    output += `### Key Highlights & Observations\n`;
    const bullets = sentences.slice(1, 5);
    if (bullets.length > 0) {
      bullets.forEach(b => {
        output += `• ${b}.\n`;
      });
    } else {
      output += `• Document content indexed and rendered on page ${currentPage}.\n`;
      output += `• Text elements and annotations extracted successfully.\n`;
    }

    if (uniqueNumbers.length > 0) {
      output += `\n### Key Metrics Detected\n• ${uniqueNumbers.join(', ')}\n`;
    }

    return output;
  };

  // AI Summary Trigger
  const handleAiSummary = async () => {
    if (!pdfDocRef.current) return;
    setIsAiModalOpen(true);
    setAiIsLoading(true);
    setAiStatus('Extracting active page text...');

    try {
      const p = await pdfDocRef.current.getPage(currentPage);
      const tc = await p.getTextContent();
      const raw = tc.items.map((i: any) => i.str || '').join(' ').trim();
      setAiRawText(raw || 'No selectable text on this page.');

      if (!raw) {
        setAiSummaryText('No readable text detected on this page.');
        setAiStatus('Done (Empty Page)');
        setAiIsLoading(false);
        return;
      }

      if (aiProvider === 'gemini' && aiGeminiKey.trim()) {
        setAiStatus(`Calling Google Gemini (${aiGeminiModel})...`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${aiGeminiModel}:generateContent?key=${aiGeminiKey.trim()}`;
        const prompt = `You are an expert executive document assistant. Analyze and summarize the following text from page ${currentPage} of a document. Provide a concise executive overview followed by 3-5 bulleted key points.\n\nDocument text:\n${raw}`;

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Gemini API error (HTTP ${res.status})`);
        }

        const data = await res.json();
        const genText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (genText) {
          setAiSummaryText(genText);
          setAiStatus(`Generated with Gemini (${aiGeminiModel})`);
        } else {
          throw new Error('No summary generated from Gemini response');
        }
      } else if (aiProvider === 'openai' && aiOpenAiKey.trim()) {
        setAiStatus(`Calling OpenAI (${aiOpenAiModel})...`);
        const endpoint = 'https://api.openai.com/v1/chat/completions';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiOpenAiKey.trim()}`
          },
          body: JSON.stringify({
            model: aiOpenAiModel,
            messages: [
              { role: 'system', content: 'You are an executive document assistant. Summarize document pages clearly.' },
              { role: 'user', content: `Summarize the following text from page ${currentPage} with an overview and 3-5 bullet points:\n\n${raw}` }
            ]
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `OpenAI API error (HTTP ${res.status})`);
        }

        const data = await res.json();
        const genText = data.choices?.[0]?.message?.content;
        if (genText) {
          setAiSummaryText(genText);
          setAiStatus(`Generated with OpenAI (${aiOpenAiModel})`);
        } else {
          throw new Error('No summary returned from OpenAI');
        }
      } else {
        // Fallback to built-in local smart summarizer
        setAiStatus('Generated with Local Smart Extractive Summarizer');
        const localSummary = generateLocalSummary(raw);
        setAiSummaryText(localSummary);
      }
    } catch (err: any) {
      console.warn('AI summary error:', err);
      setAiStatus(`Notice: ${err.message || 'API request failed'}. Fallback to local summarizer.`);
      const localSummary = generateLocalSummary(aiRawText || 'Summary of page');
      setAiSummaryText(`${localSummary}\n\n*(Note: ${err.message || 'Remote AI API unavailable. Generated using built-in local summarizer.'})*`);
    } finally {
      setAiIsLoading(false);
    }
  };

  // Print entire document at crisp 2x resolution
  const handlePrint = async () => {
    if (!pdfDocRef.current) {
      window.print();
      return;
    }
    const doc = pdfDocRef.current;
    const total = doc.numPages;

    const printWin = window.open('', '_blank');
    if (!printWin) {
      window.print();
      return;
    }

    const docName = (typeof src === 'string' ? src.split('/').pop()?.split('?')[0] : 'Document') || 'Document';

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docName} - Print Document</title>
          <style>
            @page {
              size: auto;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #fff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            .page-sheet {
              page-break-after: always;
              break-after: page;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100vw;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .page-sheet img {
              width: 100%;
              height: auto;
              max-height: 100vh;
              object-fit: contain;
              display: block;
            }
            #print-status {
              padding: 40px;
              text-align: center;
              color: #334155;
            }
            @media print {
              #print-status {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div id="print-status">
            <h2>Rendering ${total} pages for print...</h2>
            <p>Please wait a moment while document pages are generated.</p>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();

    try {
      const pageImages: string[] = [];
      for (let i = 1; i <= total; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          pageImages.push(canvas.toDataURL('image/jpeg', 0.95));
        }
      }

      if (printWin.document.body) {
        const sheetsHtml = pageImages
          .map((src, idx) => `<div class="page-sheet"><img src="${src}" alt="Page ${idx + 1}" /></div>`)
          .join('');
        printWin.document.body.innerHTML = sheetsHtml;
        printWin.focus();
        setTimeout(() => {
          printWin.print();
        }, 500);
      }
    } catch (err) {
      console.error('Error during full document print:', err);
      printWin.close();
      window.print();
    }
  };

  // Recursive outline navigation renderer
  const renderOutlineEntries = (items: any[], depth = 0) => {
    return items.map((item, idx) => (
      <div key={`${depth}-${idx}`} className="space-y-0.5">
        <div
          className={`py-1.5 px-2 rounded cursor-pointer transition-colors flex items-center justify-between text-xs ${
            isLight
              ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950 font-medium'
              : 'hover:bg-white/10 text-slate-300 hover:text-white'
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
          onClick={() => {
            if (item.dest) {
              if (typeof item.dest === 'string') {
                pdfDocRef.current?.getDestination(item.dest).then((destArr: any) => {
                  if (destArr && destArr[0]) {
                    pdfDocRef.current?.getPageIndex(destArr[0]).then(pIdx => handleTurnToPage(pIdx + 1));
                  }
                });
              } else if (Array.isArray(item.dest) && item.dest[0]) {
                pdfDocRef.current?.getPageIndex(item.dest[0]).then(pIdx => handleTurnToPage(pIdx + 1));
              }
            }
          }}
        >
          <span className="truncate">{item.title}</span>
        </div>
        {item.items && item.items.length > 0 && renderOutlineEntries(item.items, depth + 1)}
      </div>
    ));
  };

    const isBookmarked = bookmarks.includes(currentPage);

  // Themes
  const isLight = currentTheme === 'light';
  const isWood = currentTheme === 'wood';

  // Themes
  const themeClasses: Record<string, string> = {
    dark: 'bg-slate-950 text-slate-100 theme-dark',
    light: 'bg-slate-100 text-slate-900 theme-light',
    wood: 'bg-[#1c120c] text-amber-100 theme-wood'
  };
  const themeClass = themeClasses[currentTheme] || themeClasses.dark;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col font-sans select-none overflow-hidden transition-colors duration-300 h-full w-full ${themeClass} ${className}`}
      style={{ height, width, ['--flip-accent' as any]: accentColor }}
    >
      {/* Apple Liquid Glass Toolbar with configurable top/bottom floating overlay */}
      {showToolbar && (
        <header
          onWheel={handleToolbarWheel}
          className={`${
            toolbarStyle === 'glass-overlay'
              ? (toolbarPosition === 'bottom'
                  ? 'absolute bottom-3 sm:bottom-4 inset-x-0 mx-auto z-40 max-w-[96%] w-fit h-13 rounded-2xl px-2.5 sm:px-4 py-1.5'
                  : 'absolute top-3 sm:top-4 inset-x-0 mx-auto z-40 max-w-[96%] w-fit h-13 rounded-2xl px-2.5 sm:px-4 py-1.5') +
                ' ' +
                (isLight ? 'liquid-glass-light text-slate-800' : isWood ? 'liquid-glass-wood text-amber-100' : 'liquid-glass-dark text-slate-100')
              : 'h-14 border-b flex items-center px-2 sm:px-3 md:px-5 z-40 shrink-0 ' +
                (isLight ? 'bg-white/95 border-slate-200 text-slate-800' : isWood ? 'bg-[#281a12]/95 border-amber-900/40 text-amber-100' : 'bg-slate-900/95 border-slate-800 text-slate-200')
          } transition-all duration-300 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-none whitespace-nowrap`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-center justify-between gap-2.5 sm:gap-3.5 h-full w-full min-w-max">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0 whitespace-nowrap">
            {showSidebar && (
              <button
                onClick={() => {
                  setIsSidebarOpen(v => !v);
                  setTimeout(() => initFlipInstance(), 310);
                }}
                title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <PanelLeft className="w-5 h-5" style={{ color: isSidebarOpen ? (accentColor || (isLight ? '#0f172a' : '#6366f1')) : undefined }} />
              </button>
            )}

            {showLogo && (
              <div className={`flex items-center gap-2 border-r pr-3 mr-1 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <BookOpen className="w-5 h-5" style={{ color: accentColor }} />
                <span className={`font-semibold text-sm md:text-base tracking-tight hidden md:inline ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Page Flip <span className="font-bold" style={{ color: accentColor }}>Pro</span>
                </span>
              </div>
            )}

            {showFileUpload && (
              <>
                <label
                  htmlFor="react-pdf-file-input"
                  title="Open PDF File"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border-slate-200'
                      : 'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/10'
                  }`}
                >
                  <Upload className="w-4 h-4 text-indigo-500" />
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
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border-slate-200'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/10'
                }`}
              >
                <Globe className="w-4 h-4 text-emerald-500" />
                <span className="hidden md:inline">Open URL</span>
              </button>
            )}
          </div>

          {/* Navigation Controls */}
          {showNavigation && (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 whitespace-nowrap">
              <button
                disabled={currentPage <= 1}
                onClick={() => handleTurnToPage(1)}
                title="First page"
                className={`hidden sm:inline-flex p-1.5 rounded-md transition-colors disabled:opacity-30 cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage <= 1}
                onClick={() => pageFlipRef.current?.flipPrev()}
                title="Previous page"
                className={`p-1.5 rounded-md transition-colors disabled:opacity-30 cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-black/30 border-white/10 text-slate-200'
              }`}>
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
                  className={`w-10 text-center bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-slate-400 rounded font-semibold ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                />
                <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>/</span>
                <span className={`min-w-[20px] text-center font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{totalPages || '-'}</span>
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => pageFlipRef.current?.flipNext()}
                title="Next page"
                className={`p-1.5 rounded-md transition-colors disabled:opacity-30 cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => handleTurnToPage(totalPages)}
                title="Last page"
                className={`hidden sm:inline-flex p-1.5 rounded-md transition-colors disabled:opacity-30 cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap">
            {showBookmarks && (
              <button
                onClick={handleToggleBookmark}
                title="Bookmark page"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-amber-500' : 'hover:bg-white/10 text-slate-300 hover:text-amber-400'
                }`}
              >
                <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? 'text-amber-500 fill-amber-500' : ''}`} />
              </button>
            )}

            {showZoom && (
              <div className={`hidden md:flex items-center gap-0.5 rounded-md p-0.5 border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/20 border-white/10 text-slate-300'
              }`}>
                <button
                  onClick={() => setZoomLevel(z => Math.max(0.6, +(z - 0.15).toFixed(2)))}
                  title="Zoom out"
                  className={`p-1.5 rounded cursor-pointer ${isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-slate-300'}`}
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className={`text-[11px] font-mono px-1.5 min-w-[42px] text-center font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(z => Math.min(2.0, +(z + 0.15).toFixed(2)))}
                  title="Zoom in"
                  className={`p-1.5 rounded cursor-pointer ${isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-slate-300'}`}
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1.0)}
                  title="Reset zoom"
                  className={`p-1.5 rounded cursor-pointer ${isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-white/10 text-slate-300'}`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {showViewToggle && (
              <button
                onClick={() => setIsDoublePage(v => !v)}
                title={isDoublePage ? 'Switch to 1-Page Mode' : 'Switch to 2-Page Mode'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Columns2 className="w-4 h-4" style={{ color: isDoublePage ? accentColor : undefined }} />
              </button>
            )}

            {/* Aura Gradient AI Summary Button */}
            {showAiSummary && (
              <button
                onClick={handleAiSummary}
                title="AI Document Summary"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-300 text-white bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-400 shadow-sm hover:shadow-md hover:shadow-fuchsia-500/25 active:scale-95 border border-white/25 select-none shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200/40 animate-pulse" />
                <span className="inline tracking-wide font-medium">AI Summary</span>
              </button>
            )}

            {showPrint && (
              <button
                onClick={handlePrint}
                title="Print full document (all pages)"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Printer className="w-4 h-4" />
              </button>
            )}

            {showSound && (
              <button
                onClick={() => setIsMuted(soundManager.toggleMute())}
                title={isMuted ? 'Unmute paper audio' : 'Mute paper audio'}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-slate-300'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-indigo-500" />}
              </button>
            )}

            {showThemeToggle && (
              <button
                onClick={() => {
                  const seq: Array<'light' | 'dark' | 'wood'> = ['light', 'dark', 'wood'];
                  const next = seq[(seq.indexOf(currentTheme) + 1) % seq.length];
                  setCurrentTheme(next);
                }}
                title="Cycle theme (Light / Dark / Wood)"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
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
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700 hover:text-slate-950' : 'hover:bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <Expand className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>
      )}

      {/* Main Section */}
      <div className="flex-1 flex overflow-hidden relative h-full min-h-0">
        {/* Mobile Backdrop for Sidebar */}
        {showSidebar && isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 md:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* Collapsible Sidebar */}
        {showSidebar && (
          <aside
            className={`w-80 border-r flex flex-col z-30 transition-all duration-300 ease-in-out shrink-0 absolute inset-y-0 left-0 md:relative ${
              isLight
                ? 'bg-white/98 border-slate-200 text-slate-800 shadow-md'
                : 'bg-slate-900/98 border-slate-800 text-slate-200 shadow-2xl'
            } ${
              isSidebarOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:-ml-80'
            }`}
          >
            {/* Tabs */}
            <div className={`flex border-b text-xs font-medium ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-black/30 border-slate-800 text-slate-400'
            }`}>
              {showOutline && (
                <button
                  onClick={() => setActiveTab('outline')}
                  className={`flex-1 py-3 px-2 text-center border-b-2 flex justify-center items-center gap-1.5 cursor-pointer ${
                    activeTab === 'outline'
                      ? isLight ? 'border-slate-900 text-slate-950 font-semibold bg-white' : 'border-indigo-500 text-white font-semibold'
                      : isLight ? 'border-transparent hover:text-slate-900' : 'border-transparent hover:text-slate-200'
                  }`}
                  style={{ borderColor: activeTab === 'outline' ? (accentColor || (isLight ? '#0f172a' : '#6366f1')) : undefined }}
                >
                  <ListTree className="w-3.5 h-3.5" />
                  <span>Outline</span>
                </button>
              )}
              {showSearch && (
                <button
                  onClick={() => setActiveTab('search')}
                  className={`flex-1 py-3 px-2 text-center border-b-2 flex justify-center items-center gap-1.5 cursor-pointer ${
                    activeTab === 'search'
                      ? isLight ? 'border-slate-900 text-slate-950 font-semibold bg-white' : 'border-indigo-500 text-white font-semibold'
                      : isLight ? 'border-transparent hover:text-slate-900' : 'border-transparent hover:text-slate-200'
                  }`}
                  style={{ borderColor: activeTab === 'search' ? (accentColor || (isLight ? '#0f172a' : '#6366f1')) : undefined }}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </button>
              )}
              {showBookmarks && (
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex-1 py-3 px-2 text-center border-b-2 flex justify-center items-center gap-1.5 cursor-pointer ${
                    activeTab === 'bookmarks'
                      ? isLight ? 'border-slate-900 text-slate-950 font-semibold bg-white' : 'border-indigo-500 text-white font-semibold'
                      : isLight ? 'border-transparent hover:text-slate-900' : 'border-transparent hover:text-slate-200'
                  }`}
                  style={{ borderColor: activeTab === 'bookmarks' ? (accentColor || (isLight ? '#0f172a' : '#6366f1')) : undefined }}
                >
                  <BookmarkIcon className="w-3.5 h-3.5" />
                  <span>Marks</span>
                </button>
              )}
              {showThumbnails && (
                <button
                  onClick={() => setActiveTab('thumbs')}
                  className={`flex-1 py-3 px-2 text-center border-b-2 flex justify-center items-center gap-1.5 cursor-pointer ${
                    activeTab === 'thumbs'
                      ? isLight ? 'border-slate-900 text-slate-950 font-semibold bg-white' : 'border-indigo-500 text-white font-semibold'
                      : isLight ? 'border-transparent hover:text-slate-900' : 'border-transparent hover:text-slate-200'
                  }`}
                  style={{ borderColor: activeTab === 'thumbs' ? (accentColor || (isLight ? '#0f172a' : '#6366f1')) : undefined }}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Thumbs</span>
                </button>
              )}
              {/* Mobile Close Sidebar Button */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden px-2.5 py-3 text-slate-400 hover:text-slate-800 transition-colors"
                title="Close Sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pane Contents */}
            <div className={`flex-1 overflow-y-auto p-3 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              {activeTab === 'outline' && (
                <div className="space-y-1">
                  {outlineItems.length > 0 ? (
                    renderOutlineEntries(outlineItems)
                  ) : (
                    <div className={`text-center py-10 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                      No outline bookmarks found in this document.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'search' && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search text in PDF..."
                      value={searchQuery}
                      onChange={e => handleSearch(e.target.value)}
                      className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 pr-8 border ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-400'
                          : 'bg-black/40 border-white/10 text-white placeholder-slate-500 focus:ring-indigo-400'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => handleSearch('')}
                        className={`absolute right-2 top-2 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {searchQuery && searchResults.length === 0 && (
                      <div className={`text-center py-6 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No matches found.</div>
                    )}
                    {searchResults.map((res, i) => (
                      <div
                        key={i}
                        onClick={() => handleTurnToPage(res.page)}
                        className={`p-2 rounded-lg cursor-pointer transition-colors border ${
                          isLight
                            ? 'hover:bg-slate-100 border-slate-200/60 text-slate-800'
                            : 'hover:bg-white/10 border-white/5 text-slate-200'
                        }`}
                      >
                        <div className={`font-semibold text-[11px] mb-0.5 ${isLight ? 'text-slate-900' : 'text-indigo-400'}`}>Page {res.page}</div>
                        <div className={`leading-snug ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{res.snippet}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'bookmarks' && (
                <div className="space-y-1">
                  {bookmarks.length === 0 ? (
                    <div className={`text-center py-10 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>No bookmarks saved yet.</div>
                  ) : (
                    bookmarks.map(p => (
                      <div
                        key={p}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border group ${
                          isLight ? 'hover:bg-slate-100 border-slate-200/60' : 'hover:bg-white/10 border-white/5'
                        }`}
                      >
                        <span onClick={() => handleTurnToPage(p)} className="flex-1 font-medium">
                          Page {p}
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setBookmarks(b => {
                              const n = b.filter(x => x !== p);
                              localStorage.setItem(`pdf_bm_${docIdRef.current}`, JSON.stringify(n));
                              return n;
                            });
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Real Visual Thumbnails */}
              {showThumbnails && activeTab === 'thumbs' && (
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <ThumbnailItem
                      key={p}
                      pageNumber={p}
                      pdfDoc={pdfDocRef.current}
                      isActive={currentPage === p}
                      accentColor={accentColor}
                      onClick={() => handleTurnToPage(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Stage Wrapper */}
        <main
          id="stage"
          ref={mountWrapperRef}
          className="flex-1 flex justify-center items-center overflow-hidden relative w-full h-full min-h-0"
        >
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-slate-300 text-xs font-medium">{loadingText}</div>
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Open URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Open Remote PDF via URL</span>
              </h3>
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Enter any public direct link to a PDF. Automated CORS proxy fallback is enabled.
            </p>
            <input
              type="url"
              placeholder="https://example.com/document.pdf"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={!urlInput.trim()}
                onClick={() => {
                  if (urlInput.trim()) {
                    loadPdfDocument(urlInput.trim());
                    setIsUrlModalOpen(false);
                    setUrlInput('');
                  }
                }}
                className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg font-medium cursor-pointer shadow-sm"
              >
                Open Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal with Provider Config */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-sm text-white">AI Document Assistant</h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full capitalize">
                  {aiProvider === 'local' ? 'Local Extractive' : aiProvider}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAiSettingsOpen(v => !v)}
                  title="Configure AI Provider"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    aiSettingsOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsAiModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Provider Configuration Panel (Collapsible) */}
            {aiSettingsOpen && (
              <div className="bg-slate-950/80 border-b border-white/10 p-4 space-y-3 text-xs animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Configure AI Provider
                  </span>
                  {aiSavedNotice && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3 h-3" /> Settings Saved!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'local', label: 'Local (Free & Private)', desc: 'Built-in extractive' },
                    { id: 'gemini', label: 'Google Gemini', desc: 'Gemini 2.5 / 2.0 Flash' },
                    { id: 'openai', label: 'OpenAI', desc: 'GPT-4o / GPT-4o-mini' },
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setAiProvider(p.id as any)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        aiProvider === p.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-black/20 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="font-semibold text-[11px]">{p.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Gemini Config */}
                {aiProvider === 'gemini' && (
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-300">Gemini API Key</label>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:underline"
                      >
                        Get Free Gemini Key ↗
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showKeyPassword ? 'text' : 'password'}
                        placeholder="AIzaSy..."
                        value={aiGeminiKey}
                        onChange={e => setAiGeminiKey(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeyPassword(v => !v)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-white"
                      >
                        {showKeyPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Model:</span>
                      <select
                        value={aiGeminiModel}
                        onChange={e => setAiGeminiModel(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Powerful)</option>
                        <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                        <option value="gemini-1.5-pro">gemini-1.5-pro (Complex reasoning)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* OpenAI Config */}
                {aiProvider === 'openai' && (
                  <div className="space-y-2 pt-1 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-300">OpenAI API Key</label>
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:underline"
                      >
                        Get OpenAI Key ↗
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showKeyPassword ? 'text' : 'password'}
                        placeholder="sk-..."
                        value={aiOpenAiKey}
                        onChange={e => setAiOpenAiKey(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-400 pr-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKeyPassword(v => !v)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-white"
                      >
                        {showKeyPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Model:</span>
                      <select
                        value={aiOpenAiModel}
                        onChange={e => setAiOpenAiModel(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="gpt-4o-mini">gpt-4o-mini (Fast & Cost-efficient)</option>
                        <option value="gpt-4o">gpt-4o (High capability)</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveAiSettings}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium cursor-pointer shadow-sm"
                  >
                    Save Provider Settings
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-200">
                    Executive Summary (Page {currentPage})
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiSummaryText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-slate-200 leading-relaxed whitespace-pre-wrap select-text">
                  {aiSummaryText || (aiIsLoading ? 'Generating summary...' : 'Click Summarize below.')}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[11px]">Extracted Raw Page Text</span>
                </div>
                <pre className="bg-black/30 border border-white/5 rounded-xl p-3 text-[10px] text-slate-400 font-mono max-h-28 overflow-y-auto whitespace-pre-wrap select-text">
                  {aiRawText || 'No text extracted.'}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between bg-black/20 text-xs">
              <span className="text-slate-400 text-[11px] truncate max-w-xs">{aiStatus}</span>
              <button
                disabled={aiIsLoading}
                onClick={handleAiSummary}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiIsLoading ? 'animate-spin' : ''}`} />
                <span>{aiIsLoading ? 'Summarizing...' : 'Summarize Page'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
