import * as pdfjsLib from 'pdfjs-dist';

export interface PdfFlipbookProps {
  /** PDF source: URL string, File object, or ArrayBuffer */
  src: string | File | ArrayBuffer;
  /** Background theme */
  theme?: 'dark' | 'light' | 'wood';
  /** Page presentation mode */
  mode?: 'auto' | 'single' | 'double';
  /** Show top glassmorphism toolbar (default: true) */
  showToolbar?: boolean;
  /** Show collapsible left sidebar (default: true) */
  showSidebar?: boolean;
  /** Show page navigation controls (default: true) */
  showNavigation?: boolean;
  /** Enable full-text search tab (default: true) */
  showSearch?: boolean;
  /** Enable document outline / TOC tab (default: true) */
  showOutline?: boolean;
  /** Enable bookmarking tab & toggle (default: true) */
  showBookmarks?: boolean;
  /** Enable visual page thumbnails tab (default: true) */
  showThumbnails?: boolean;
  /** Enable AI document summary modal (default: true) */
  showAiSummary?: boolean;
  /** Enable zoom controls (default: true) */
  showZoom?: boolean;
  /** Enable print & single page export (default: true) */
  showPrint?: boolean;
  /** Enable paper friction audio (default: true) */
  showSound?: boolean;
  /** Enable fullscreen toggle button (default: true) */
  showFullscreen?: boolean;
  /** Enable theme switcher button (default: true) */
  showThemeToggle?: boolean;
  /** Enable single/double view switcher button (default: true) */
  showViewToggle?: boolean;
  /** Enable local file open button & drag-and-drop (default: true) */
  showFileUpload?: boolean;
  /** Flipping animation time in ms (default: 600) */
  flippingTime?: number;
  /** Custom container CSS class */
  className?: string;
  /** Container height (default: 100%) */
  height?: string | number;
  /** Container width (default: 100%) */
  width?: string | number;
  /** Callback fired when active page changes */
  onPageChange?: (page: number, totalPages: number) => void;
  /** Callback fired when document is loaded */
  onDocumentLoad?: (doc: pdfjsLib.PDFDocumentProxy) => void;
}
