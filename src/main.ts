import * as pdfjsLib from 'pdfjs-dist';
import { PageFlip } from 'page-flip';
import {
  createIcons,
  PanelLeft,
  BookOpen,
  Upload,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Bookmark,
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
  Shrink,
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
  Check
} from 'lucide';
import { soundManager } from './sound';

// Configure PDF.js Web Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

// Initialize Lucide Icons
function refreshIcons() {
  createIcons({
    icons: {
      PanelLeft,
      BookOpen,
      Upload,
      ChevronsLeft,
      ChevronLeft,
      ChevronRight,
      ChevronsRight,
      Bookmark,
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
      Shrink,
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
      Check
    }
  });
}

interface SearchMatch {
  page: number;
  snippet: string;
}

class FlipBookApp {
  private pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
  private pageFlip: PageFlip | null = null;
  private totalPages: number = 0;
  private currentPage: number = 1;
  private zoomLevel: number = 1.0;
  private docId: string = 'sample-pdf';
  private bookmarks: Set<number> = new Set();
  private pageTextCache: Map<number, string> = new Map();
  private searchIndex: Array<{ page: number; text: string }> = [];
  private renderedPages: Set<number> = new Set();
  private basePageWidth: number = 595;
  private basePageHeight: number = 842;
  private isDoublePage: boolean = true;
  private currentThemeIndex: number = 0;
  private themes = ['theme-dark', 'theme-light', 'theme-wood'];

  // DOM Elements
  private bookContainer = document.getElementById('book-container') as HTMLDivElement;
  private loadingOverlay = document.getElementById('loading-overlay') as HTMLDivElement;
  private loadingProgress = document.getElementById('loading-progress') as HTMLDivElement;
  private loadingText = document.getElementById('loading-text') as HTMLHeadingElement;
  private inputCurrentPage = document.getElementById('input-current-page') as HTMLInputElement;
  private labelTotalPages = document.getElementById('label-total-pages') as HTMLSpanElement;
  private labelZoom = document.getElementById('label-zoom-level') as HTMLSpanElement;
  private sidebarDrawer = document.getElementById('sidebar-drawer') as HTMLElement;
  private iconSound = document.getElementById('icon-sound') as HTMLElement;
  private iconBookmark = document.getElementById('icon-bookmark') as HTMLElement;

  constructor() {
    this.initEventListeners();
    this.detectScreenOrientation();
    this.loadInitialPdf('/sample.pdf');
  }

  private detectScreenOrientation() {
    this.isDoublePage = window.innerWidth >= 768;
  }

  private async loadInitialPdf(source: string | ArrayBuffer) {
    this.showLoading(true, 'Loading PDF Document...', 20);
    try {
      const loadingTask = pdfjsLib.getDocument(source);
      loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
        if (progress.total > 0) {
          const pct = Math.round((progress.loaded / progress.total) * 60) + 20;
          this.updateLoadingProgress(pct);
        }
      };

      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;
      this.labelTotalPages.textContent = String(this.totalPages);
      this.inputCurrentPage.max = String(this.totalPages);

      // Extract document ID for bookmarks persistence
      if (typeof source === 'string') {
        this.docId = source.split('/').pop() || 'doc';
      } else {
        this.docId = `custom-doc-${this.totalPages}`;
      }
      this.loadBookmarks();

      // Read first page dimensions to compute aspect ratio
      const firstPage = await this.pdfDoc.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1.0 });
      this.basePageWidth = Math.round(viewport.width);
      this.basePageHeight = Math.round(viewport.height);

      this.updateLoadingProgress(80);
      await this.initPageFlip();

      // Background tasks: outline, search indexing, thumbnails
      this.parseOutline();
      this.buildSearchIndex();
      this.generateThumbnails();

      this.showLoading(false);
      this.updateUI();
    } catch (err) {
      console.error('Failed to load PDF:', err);
      this.showLoading(true, 'Error loading PDF. Please try another file.', 100);
    }
  }

  private showLoading(show: boolean, text: string = '', pct: number = 0) {
    if (show) {
      this.loadingOverlay.classList.remove('opacity-0', 'pointer-events-none');
      this.loadingText.textContent = text;
      this.loadingProgress.style.width = `${pct}%`;
    } else {
      this.loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
    }
  }

  private updateLoadingProgress(pct: number) {
    this.loadingProgress.style.width = `${pct}%`;
  }

  private async initPageFlip() {
    if (this.pageFlip) {
      this.pageFlip.destroy();
      this.pageFlip = null;
    }

    this.bookContainer.innerHTML = '';
    this.renderedPages.clear();

    // Create page wrapper elements
    for (let i = 1; i <= this.totalPages; i++) {
      const pageEl = document.createElement('div');
      pageEl.className = 'page';
      pageEl.dataset.pageNumber = String(i);

      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-page-canvas';
      canvas.dataset.pageNumber = String(i);
      pageEl.appendChild(canvas);

      this.bookContainer.appendChild(pageEl);
    }

    // Calculate dimensions based on viewport height and aspect ratio
    const stage = document.getElementById('stage')!;
    const availableHeight = Math.max(400, stage.clientHeight - 40);
    const availableWidth = Math.max(300, stage.clientWidth - 40);

    let bookHeight = availableHeight;
    let bookWidth = Math.round((bookHeight * this.basePageWidth) / this.basePageHeight);

    if (this.isDoublePage && bookWidth * 2 > availableWidth) {
      bookWidth = Math.round(availableWidth / 2);
      bookHeight = Math.round((bookWidth * this.basePageHeight) / this.basePageWidth);
    } else if (!this.isDoublePage && bookWidth > availableWidth) {
      bookWidth = availableWidth;
      bookHeight = Math.round((bookWidth * this.basePageHeight) / this.basePageWidth);
    }

    // Apply zoom
    bookWidth = Math.round(bookWidth * this.zoomLevel);
    bookHeight = Math.round(bookHeight * this.zoomLevel);

    this.pageFlip = new PageFlip(this.bookContainer, {
      width: bookWidth,
      height: bookHeight,
      size: 'fixed',
      minWidth: 200,
      maxWidth: 1600,
      minHeight: 300,
      maxHeight: 2000,
      maxShadowOpacity: 0.5,
      showCover: true,
      mobileScrollSupport: false,
      usePortrait: !this.isDoublePage,
      flippingTime: 600
    });

    const pageElements = this.bookContainer.querySelectorAll<HTMLElement>('.page');
    this.pageFlip.loadFromHTML(pageElements);

    // Wire events
    this.pageFlip.on('flip', (e: any) => {
      this.currentPage = (e.data as number) + 1;
      this.updateUI();
      soundManager.playPageFlip();
      this.triggerLazyRender();
    });

    // Initial render for visible pages
    await this.triggerLazyRender();
  }

  /**
   * Lazy Rendering & Virtualization:
   * Only render active page +/- 3 pages to save GPU/DOM memory
   */
  private async triggerLazyRender() {
    if (!this.pdfDoc) return;

    const current = this.currentPage;
    const renderWindow = 3;
    const minPage = Math.max(1, current - renderWindow);
    const maxPage = Math.min(this.totalPages, current + renderWindow + (this.isDoublePage ? 1 : 0));

    // Render pages within window
    for (let p = minPage; p <= maxPage; p++) {
      if (!this.renderedPages.has(p)) {
        await this.renderPageCanvas(p);
      }
    }

    // Clean up canvases far away to release memory
    const pageElements = this.bookContainer.querySelectorAll<HTMLElement>('.page');
    pageElements.forEach((el) => {
      const pNum = Number(el.dataset.pageNumber);
      if (pNum < current - 4 || pNum > current + 4) {
        if (this.renderedPages.has(pNum)) {
          const canvas = el.querySelector('canvas');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
          this.renderedPages.delete(pNum);
        }
      }
    });
  }

  /**
   * HiDPI / Retina Crisp Rendering
   */
  private async renderPageCanvas(pageNum: number) {
    if (!this.pdfDoc) return;
    const pageEl = this.bookContainer.querySelector(`.page[data-page-number="${pageNum}"]`);
    if (!pageEl) return;

    const canvas = pageEl.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const dpr = window.devicePixelRatio || 1;
      const rect = pageEl.getBoundingClientRect();
      const targetWidth = rect.width || this.basePageWidth;
      const baseViewport = page.getViewport({ scale: 1.0 });
      const scale = (targetWidth / baseViewport.width) * dpr;

      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      this.renderedPages.add(pageNum);
    } catch (err) {
      console.warn(`Render error on page ${pageNum}:`, err);
    }
  }

  private updateUI() {
    this.inputCurrentPage.value = String(this.currentPage);
    window.location.hash = `page=${this.currentPage}`;
    this.updateBookmarkButtonState();

    const btnFirst = document.getElementById('btn-first-page') as HTMLButtonElement;
    const btnPrev = document.getElementById('btn-prev-page') as HTMLButtonElement;
    const btnNext = document.getElementById('btn-next-page') as HTMLButtonElement;
    const btnLast = document.getElementById('btn-last-page') as HTMLButtonElement;

    if (btnFirst && btnPrev) {
      btnFirst.disabled = this.currentPage <= 1;
      btnPrev.disabled = this.currentPage <= 1;
    }
    if (btnNext && btnLast) {
      btnNext.disabled = this.currentPage >= this.totalPages;
      btnLast.disabled = this.currentPage >= this.totalPages;
    }
  }

  // Bookmarks Management
  private loadBookmarks() {
    const raw = localStorage.getItem(`pdf_bookmarks_${this.docId}`);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        this.bookmarks = new Set(arr);
      } catch {
        this.bookmarks = new Set();
      }
    } else {
      this.bookmarks = new Set();
    }
    this.renderBookmarksList();
  }

  private saveBookmarks() {
    localStorage.setItem(`pdf_bookmarks_${this.docId}`, JSON.stringify(Array.from(this.bookmarks)));
    this.renderBookmarksList();
    this.updateBookmarkButtonState();
  }

  private toggleBookmark(page: number) {
    if (this.bookmarks.has(page)) {
      this.bookmarks.delete(page);
    } else {
      this.bookmarks.add(page);
    }
    this.saveBookmarks();
  }

  private updateBookmarkButtonState() {
    const isBookmarked = this.bookmarks.has(this.currentPage);
    if (isBookmarked) {
      this.iconBookmark.classList.add('text-amber-400', 'fill-amber-400');
    } else {
      this.iconBookmark.classList.remove('text-amber-400', 'fill-amber-400');
    }
  }

  private renderBookmarksList() {
    const listEl = document.getElementById('bookmarks-list');
    if (!listEl) return;

    if (this.bookmarks.size === 0) {
      listEl.innerHTML = '<div class="text-xs text-slate-500 py-4 text-center">No bookmarks saved yet.</div>';
      return;
    }

    const sorted = Array.from(this.bookmarks).sort((a, b) => a - b);
    listEl.innerHTML = sorted.map(page => `
      <div class="flex items-center justify-between p-2 bg-black/20 hover:bg-white/10 rounded-lg cursor-pointer transition-colors group" data-page="${page}">
        <div class="flex items-center gap-2">
          <i data-lucide="bookmark" class="w-3.5 h-3.5 text-amber-400 fill-amber-400"></i>
          <span class="text-xs text-slate-200 font-medium">Page ${page}</span>
        </div>
        <button class="btn-delete-bookmark text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity" data-page="${page}">
          <i data-lucide="x" class="w-3 h-3"></i>
        </button>
      </div>
    `).join('');

    refreshIcons();

    listEl.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-delete-bookmark')) return;
        const p = Number((el as HTMLElement).dataset.page);
        this.pageFlip?.turnToPage(p - 1);
      });
    });

    listEl.querySelectorAll('.btn-delete-bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const p = Number((btn as HTMLElement).dataset.page);
        this.bookmarks.delete(p);
        this.saveBookmarks();
      });
    });
  }

  // Document Outline / Table of Contents
  private async parseOutline() {
    const container = document.getElementById('outline-container');
    if (!container || !this.pdfDoc) return;

    try {
      const outline = await this.pdfDoc.getOutline();
      if (!outline || outline.length === 0) {
        container.innerHTML = `
          <div class="text-center py-6 px-3 text-xs text-slate-500">
            No native bookmarks in this document.
            <div class="mt-3 grid grid-cols-2 gap-1.5">
              <button class="quick-jump-btn p-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 text-[11px]" data-page="1">Start (Page 1)</button>
              <button class="quick-jump-btn p-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 text-[11px]" data-page="${Math.round(this.totalPages * 0.5)}">Middle</button>
              <button class="quick-jump-btn p-1.5 bg-white/5 hover:bg-white/10 rounded text-slate-300 text-[11px]" data-page="${this.totalPages}">End (Page ${this.totalPages})</button>
            </div>
          </div>
        `;
        container.querySelectorAll('.quick-jump-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const p = Number((btn as HTMLElement).dataset.page);
            this.pageFlip?.turnToPage(p - 1);
          });
        });
        return;
      }

      container.innerHTML = '';
      for (const item of outline) {
        const itemEl = document.createElement('div');
        itemEl.className = 'p-2 hover:bg-white/10 rounded-lg cursor-pointer text-xs text-slate-200 transition-colors flex items-center justify-between';
        itemEl.innerHTML = `<span>${item.title}</span><i data-lucide="chevron-right" class="w-3.5 h-3.5 text-slate-500"></i>`;

        itemEl.addEventListener('click', async () => {
          if (item.dest) {
            let pageIndex = -1;
            if (typeof item.dest === 'string') {
              const destObj = await this.pdfDoc!.getDestination(item.dest);
              if (destObj) {
                pageIndex = await this.pdfDoc!.getPageIndex(destObj[0]);
              }
            } else if (Array.isArray(item.dest)) {
              pageIndex = await this.pdfDoc!.getPageIndex(item.dest[0]);
            }
            if (pageIndex >= 0) {
              this.pageFlip?.turnToPage(pageIndex);
            }
          }
        });
        container.appendChild(itemEl);
      }
      refreshIcons();
    } catch {
      container.innerHTML = '<div class="text-xs text-slate-500 py-4 text-center">Unable to extract outline.</div>';
    }
  }

  // Full-Text Search
  private async buildSearchIndex() {
    if (!this.pdfDoc) return;
    this.searchIndex = [];
    const statusEl = document.getElementById('search-status');

    for (let p = 1; p <= this.totalPages; p++) {
      try {
        const page = await this.pdfDoc.getPage(p);
        const textContent = await page.getTextContent();
        const fullText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        this.pageTextCache.set(p, fullText);
        this.searchIndex.push({ page: p, text: fullText });
      } catch {
        // Silently continue
      }
    }

    if (statusEl) {
      statusEl.textContent = `Indexed ${this.totalPages} pages. Ready to search.`;
    }
  }

  private performSearch(query: string) {
    const resultsContainer = document.getElementById('search-results-list');
    const statusEl = document.getElementById('search-status');
    if (!resultsContainer || !statusEl) return;

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      resultsContainer.innerHTML = '';
      statusEl.textContent = 'Type keyword to search';
      return;
    }

    const matches: SearchMatch[] = [];
    for (const item of this.searchIndex) {
      const lower = item.text.toLowerCase();
      const idx = lower.indexOf(trimmed);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(item.text.length, idx + trimmed.length + 50);
        let snippet = item.text.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < item.text.length) snippet = snippet + '...';

        const regex = new RegExp(`(${trimmed})`, 'gi');
        const highlighted = snippet.replace(regex, '<mark class="search-highlight px-1 text-slate-950 font-medium">$1</mark>');
        matches.push({ page: item.page, snippet: highlighted });
      }
    }

    statusEl.textContent = `Found ${matches.length} matches`;
    if (matches.length === 0) {
      resultsContainer.innerHTML = '<div class="text-xs text-slate-500 py-4 text-center">No results found.</div>';
      return;
    }

    resultsContainer.innerHTML = matches.map(m => `
      <div class="p-2.5 bg-black/20 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/5" data-page="${m.page}">
        <div class="text-[11px] font-semibold text-indigo-400 mb-1">Page ${m.page}</div>
        <div class="text-xs text-slate-300 leading-snug">${m.snippet}</div>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', () => {
        const p = Number((el as HTMLElement).dataset.page);
        this.pageFlip?.turnToPage(p - 1);
      });
    });
  }

  // Thumbnails Generator
  private async generateThumbnails() {
    const grid = document.getElementById('thumbnails-grid');
    if (!grid || !this.pdfDoc) return;
    grid.innerHTML = '';

    for (let p = 1; p <= this.totalPages; p++) {
      const itemEl = document.createElement('div');
      itemEl.className = 'group flex flex-col items-center bg-black/20 hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-all border border-white/5';
      itemEl.dataset.page = String(p);

      const canvas = document.createElement('canvas');
      canvas.className = 'w-full rounded shadow aspect-[3/4] bg-white';
      itemEl.appendChild(canvas);

      const label = document.createElement('span');
      label.className = 'text-[11px] font-medium text-slate-400 mt-1.5 group-hover:text-white';
      label.textContent = `Page ${p}`;
      itemEl.appendChild(label);

      itemEl.addEventListener('click', () => {
        this.pageFlip?.turnToPage(p - 1);
      });

      grid.appendChild(itemEl);

      // Render thumbnail asynchronously
      this.pdfDoc.getPage(p).then((page) => {
        const viewport = page.getViewport({ scale: 0.2 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          page.render({ canvasContext: ctx, viewport }).promise;
        }
      });
    }
  }

  // AI Assistant & Summarizer
  private async triggerAiSummary() {
    const modal = document.getElementById('modal-ai') as HTMLDivElement;
    const badge = document.getElementById('ai-modal-page-badge') as HTMLElement;
    const rawTextEl = document.getElementById('ai-raw-text') as HTMLElement;
    const summaryEl = document.getElementById('ai-summary-content') as HTMLElement;
    const statusEl = document.getElementById('ai-status-text') as HTMLElement;

    modal.classList.remove('hidden');
    badge.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    statusEl.textContent = 'Extracting active page text...';

    let pageText = this.pageTextCache.get(this.currentPage) || '';
    if (!pageText && this.pdfDoc) {
      try {
        const page = await this.pdfDoc.getPage(this.currentPage);
        const textContent = await page.getTextContent();
        pageText = textContent.items.map((it: any) => it.str || '').join(' ');
        this.pageTextCache.set(this.currentPage, pageText);
      } catch (err) {
        console.warn('Could not extract text:', err);
      }
    }

    rawTextEl.textContent = pageText || 'No selectable text found on this page (scanned image or empty).';

    if (!pageText.trim()) {
      summaryEl.innerHTML = '<p class="text-rose-400">No text detected to summarize on this page.</p>';
      statusEl.textContent = 'Done (empty)';
      return;
    }

    statusEl.textContent = 'Generating summary...';
    summaryEl.innerHTML = '<div class="flex items-center gap-2 text-indigo-400"><div class="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div><span>Processing summary...</span></div>';

    // Check LLM settings
    const provider = localStorage.getItem('pdf_llm_provider') || 'heuristic';
    const apiKey = localStorage.getItem('pdf_llm_key') || '';

    if (provider === 'gemini' && apiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert reading assistant. Summarize the following document page clearly in 3-5 high-impact bullet points:\n\n${pageText}`
              }]
            }]
          })
        });
        const data = await res.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          summaryEl.innerHTML = `<div class="prose prose-invert text-xs space-y-1.5 leading-relaxed">${answer.replace(/\n/g, '<br/>')}</div>`;
          statusEl.textContent = 'Generated via Gemini 1.5 Flash';
          return;
        }
      } catch (e) {
        console.warn('Gemini API call failed, falling back to heuristic:', e);
      }
    }

    // Heuristic Extractive Summarizer
    setTimeout(() => {
      const sentences = pageText
        .split(/[.?!]\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);

      const topSentences = sentences.slice(0, 4);
      if (topSentences.length > 0) {
        summaryEl.innerHTML = `
          <ul class="list-disc list-inside space-y-1.5 text-slate-200">
            ${topSentences.map(s => `<li>${s}</li>`).join('')}
          </ul>
        `;
      } else {
        summaryEl.innerHTML = `<p class="text-slate-300">${pageText.substring(0, 240)}...</p>`;
      }
      statusEl.textContent = 'Heuristic Extraction Complete';
    }, 300);
  }

  // Print & Export Current Page
  private printCurrentPage() {
    const pageEl = this.bookContainer.querySelector(`.page[data-page-number="${this.currentPage}"]`);
    const canvas = pageEl?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      window.print();
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Page ${this.currentPage}</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  // Event Listeners Wiring
  private initEventListeners() {
    refreshIcons();

    // Navigation Buttons
    document.getElementById('btn-first-page')?.addEventListener('click', () => this.pageFlip?.turnToPage(0));
    document.getElementById('btn-prev-page')?.addEventListener('click', () => this.pageFlip?.flipPrev());
    document.getElementById('btn-next-page')?.addEventListener('click', () => this.pageFlip?.flipNext());
    document.getElementById('btn-last-page')?.addEventListener('click', () => this.pageFlip?.turnToPage(this.totalPages - 1));

    // Page Input Jump
    this.inputCurrentPage.addEventListener('change', () => {
      const val = parseInt(this.inputCurrentPage.value, 10);
      if (!isNaN(val) && val >= 1 && val <= this.totalPages) {
        this.pageFlip?.turnToPage(val - 1);
      } else {
        this.inputCurrentPage.value = String(this.currentPage);
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        this.pageFlip?.flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        this.pageFlip?.flipPrev();
      } else if (e.key === 'Home') {
        this.pageFlip?.turnToPage(0);
      } else if (e.key === 'End') {
        this.pageFlip?.turnToPage(this.totalPages - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      }
    });

    // Zoom Controls
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
      if (this.zoomLevel < 2.0) {
        this.zoomLevel = +(this.zoomLevel + 0.15).toFixed(2);
        this.labelZoom.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        this.initPageFlip();
      }
    });

    document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
      if (this.zoomLevel > 0.6) {
        this.zoomLevel = +(this.zoomLevel - 0.15).toFixed(2);
        this.labelZoom.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        this.initPageFlip();
      }
    });

    document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
      this.zoomLevel = 1.0;
      this.labelZoom.textContent = '100%';
      this.initPageFlip();
    });

    // Single / Double View Mode Toggle
    document.getElementById('btn-view-mode')?.addEventListener('click', () => {
      this.isDoublePage = !this.isDoublePage;
      this.initPageFlip();
    });

    // Bookmark Toggle
    document.getElementById('btn-toggle-bookmark')?.addEventListener('click', () => {
      this.toggleBookmark(this.currentPage);
    });

    // Clear Bookmarks
    document.getElementById('btn-clear-bookmarks')?.addEventListener('click', () => {
      this.bookmarks.clear();
      this.saveBookmarks();
    });

    // Sound Toggle
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      this.iconSound.setAttribute('data-lucide', isMuted ? 'volume-x' : 'volume-2');
      refreshIcons();
    });

    // Theme Switcher
    document.getElementById('btn-cycle-theme')?.addEventListener('click', () => {
      document.body.classList.remove(this.themes[this.currentThemeIndex]);
      this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
      document.body.classList.add(this.themes[this.currentThemeIndex]);
    });

    // Fullscreen Toggle
    document.getElementById('btn-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());

    // Print Button
    document.getElementById('btn-print-page')?.addEventListener('click', () => this.printCurrentPage());

    // Sidebar Toggle
    document.getElementById('btn-toggle-sidebar')?.addEventListener('click', () => {
      this.sidebarDrawer.classList.toggle('-translate-x-full');
      this.sidebarDrawer.classList.toggle('hidden');
    });

    // Sidebar Tabs
    const tabs = document.querySelectorAll<HTMLButtonElement>('.sidebar-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active', 'border-indigo-500', 'text-white');
          t.classList.add('border-transparent');
        });
        tab.classList.add('active', 'border-indigo-500', 'text-white');
        tab.classList.remove('border-transparent');

        const targetPane = tab.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        document.getElementById(targetPane || '')?.classList.remove('hidden');
      });
    });

    // Search Input
    let searchTimeout: any;
    document.getElementById('input-search')?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const val = (e.target as HTMLInputElement).value;
      searchTimeout = setTimeout(() => this.performSearch(val), 250);
    });

    // File Input (Open PDF)
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          if (fileReader.result instanceof ArrayBuffer) {
            this.loadInitialPdf(fileReader.result);
          }
        };
        fileReader.readAsArrayBuffer(file);
      }
    });

    // Drag & Drop
    const dropOverlay = document.getElementById('drag-drop-overlay') as HTMLDivElement;
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropOverlay.classList.remove('hidden');
    });
    window.addEventListener('dragleave', (e) => {
      if (e.relatedTarget === null) {
        dropOverlay.classList.add('hidden');
      }
    });
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      dropOverlay.classList.add('hidden');
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          if (fileReader.result instanceof ArrayBuffer) {
            this.loadInitialPdf(fileReader.result);
          }
        };
        fileReader.readAsArrayBuffer(file);
      }
    });

    // AI Assistant Modal
    document.getElementById('btn-ai-assistant')?.addEventListener('click', () => this.triggerAiSummary());
    document.getElementById('btn-close-ai-modal')?.addEventListener('click', () => {
      document.getElementById('modal-ai')?.classList.add('hidden');
    });
    document.getElementById('btn-trigger-ai-summary')?.addEventListener('click', () => this.triggerAiSummary());
    document.getElementById('btn-copy-raw-text')?.addEventListener('click', () => {
      const text = document.getElementById('ai-raw-text')?.textContent || '';
      navigator.clipboard.writeText(text);
      const btn = document.getElementById('btn-copy-raw-text');
      if (btn) btn.innerHTML = '<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i><span>Copied!</span>';
      refreshIcons();
    });

    // AI Settings Panel Toggle & Save
    document.getElementById('btn-ai-settings-toggle')?.addEventListener('click', () => {
      document.getElementById('ai-settings-panel')?.classList.toggle('hidden');
    });
    document.getElementById('btn-save-ai-settings')?.addEventListener('click', () => {
      const provider = (document.getElementById('select-llm-provider') as HTMLSelectElement).value;
      const key = (document.getElementById('input-llm-key') as HTMLInputElement).value;
      localStorage.setItem('pdf_llm_provider', provider);
      localStorage.setItem('pdf_llm_key', key);
      document.getElementById('ai-settings-panel')?.classList.add('hidden');
    });

    // Window Resize
    let resizeTimer: any;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const shouldBeDouble = window.innerWidth >= 768;
        if (shouldBeDouble !== this.isDoublePage) {
          this.isDoublePage = shouldBeDouble;
        }
        this.initPageFlip();
      }, 300);
    });
  }

  private toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new FlipBookApp();
});
