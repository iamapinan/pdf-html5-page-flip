import * as pdfjsLib from 'pdfjs-dist';

export interface PdfFlipbookProps {
  /** Enable double click or double tap on paper to zoom (default: true) */
  doubleClickZoom?: boolean;
  /** Enable immersive mode (expands full screen with blurred transparent background) */
  immersive?: boolean;
  /** Callback fired when immersive mode changes */
  onImmersiveChange?: (isImmersive: boolean) => void;
  /** PDF source: URL string, File object, or ArrayBuffer */
  src: string | File | ArrayBuffer;
  /** Background theme: 'dark' | 'light' | 'wood' */
  theme?: 'dark' | 'light' | 'wood';
  /** Page presentation mode: 'auto' (responsive) | 'single' | 'double' */
  mode?: 'auto' | 'single' | 'double';
  /** Accent highlight color (hex or CSS color, default: #6366f1) */
  accentColor?: string;
  /** Show brand logo in toolbar (default: true) */
  showLogo?: boolean;
  /** Show glassmorphism toolbar (default: true) */
  showToolbar?: boolean;
  /** Toolbar placement: 'top' | 'bottom' (default: 'top') */
  toolbarPosition?: 'top' | 'bottom';
  /** Toolbar design style: 'glass-overlay' | 'inline' (default: 'glass-overlay') */
  toolbarStyle?: 'glass-overlay' | 'inline';
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
  /** Enable open remote PDF via URL button (default: true) */
  showUrlInput?: boolean;
  /** Enable keyboard & gesture shortcuts button & modal (default: true) */
  showShortcuts?: boolean;
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
  /** Callback fired when a local file is selected/dropped inside viewer */
  onFileSelect?: (file: File) => void;
}
