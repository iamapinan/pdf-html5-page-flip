import { PageFlip } from 'page-flip';
import * as pdfjsLib from 'pdfjs-dist';
import { soundManager } from './sound';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export class PdfFlipbookElement extends HTMLElement {
  private pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
  private pageFlip: PageFlip | null = null;
  private container: HTMLDivElement;

  static get observedAttributes() {
    return ['src', 'theme', 'mode', 'sound'];
  }

  constructor() {
    super();
    this.container = document.createElement('div');
    this.container.className = 'flipbook-container w-full h-full relative';
  }

  connectedCallback() {
    if (!this.contains(this.container)) {
      this.appendChild(this.container);
    }
    const src = this.getAttribute('src');
    if (src) {
      this.loadPdf(src);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue !== newValue && name === 'src' && newValue) {
      this.loadPdf(newValue);
    }
  }

  public async loadPdf(src: string | ArrayBuffer) {
    try {
      this.container.innerHTML = '<div class="flex items-center justify-center p-8 text-sm text-slate-400">Loading Flipbook...</div>';
      const doc = await pdfjsLib.getDocument(src).promise;
      this.pdfDoc = doc;
      this.container.innerHTML = '';

      const total = doc.numPages;
      const isPortrait = this.getAttribute('mode') === 'single' || window.innerWidth < 768;

      const firstPage = await doc.getPage(1);
      const vp = firstPage.getViewport({ scale: 1.0 });

      for (let i = 1; i <= total; i++) {
        const pageEl = document.createElement('div');
        pageEl.className = 'page';
        pageEl.dataset.pageNumber = String(i);

        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        pageEl.appendChild(canvas);
        this.container.appendChild(pageEl);

        // Async render
        doc.getPage(i).then(page => {
          const dpr = window.devicePixelRatio || 1;
          const viewport = page.getViewport({ scale: dpr });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = '100%';
          canvas.style.height = '100%';
          const ctx = canvas.getContext('2d');
          if (ctx) {
            page.render({ canvasContext: ctx, viewport }).promise;
          }
        });
      }

      this.pageFlip = new PageFlip(this.container, {
        width: Math.round(vp.width),
        height: Math.round(vp.height),
        size: 'stretch',
        minWidth: 240,
        maxWidth: 1600,
        minHeight: 340,
        maxHeight: 2000,
        usePortrait: isPortrait,
        showCover: true,
        flippingTime: 500
      });

      const pages = this.container.querySelectorAll<HTMLElement>('.page');
      this.pageFlip.loadFromHTML(pages);

      this.pageFlip.on('flip', () => {
        if (this.getAttribute('sound') !== 'false') {
          soundManager.playPageFlip();
        }
        this.dispatchEvent(new CustomEvent('pagechange', {
          detail: { page: (this.pageFlip?.getCurrentPageIndex() || 0) + 1 }
        }));
      });
    } catch (err) {
      this.container.innerHTML = `<div class="p-4 text-rose-500 text-xs">Error loading PDF: ${err}</div>`;
    }
  }

  disconnectedCallback() {
    this.pageFlip?.destroy();
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('pdf-flipbook')) {
  customElements.define('pdf-flipbook', PdfFlipbookElement);
}
