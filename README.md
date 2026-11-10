# PDF HTML5 Page Flip Pro (`pdf-html5-page-flip`)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-flipbook.apps.gracer.ai-emerald?logo=googlechrome)](https://flipbook.apps.gracer.ai)

A modern, high-performance, client-side 3D Web Application and React Component that converts standard PDF files into realistic, hardware-accelerated HTML5 flipbooks with physics-based page turning, memory virtualization, full-text search, and on-demand AI document summarization.

🔗 **Live Production Website:** [https://flipbook.apps.gracer.ai](https://flipbook.apps.gracer.ai) *(or [https://pdf-flip.apps.gracer.ai](https://pdf-flip.apps.gracer.ai))*

---

## 🌟 Key Highlights & Architecture

* **100% Client-Side Privacy:** All rendering and parsing execute directly in the browser runtime via `pdfjs-dist` Web Workers. Confidential documents never leave the client's machine.
* **Remote PDF & Query Parameter Support:** Load any public PDF URL directly using the UI or deep links (`?pdf=https://example.com/doc.pdf`) with automated fallback for CORS-protected endpoints.
* **Lazy Virtualization & Memory Management:** Pre-renders only visible pages and immediate neighbors ($\pm 3$ pages) and unloads distant canvases to ensure zero browser memory leaks on multi-hundred-page documents.
* **60 FPS Hardware-Accelerated Physics:** Powered by StPageFlip with CSS3 3D transforms, dual-page realistic spine lighting, and natural corner curl ergonomics.
* **Synthesized Page-Turn Audio:** Generates paper friction acoustics on-the-fly using the Web Audio API with zero external `.mp3` bandwidth or asset dependencies.
* **HiDPI / Retina Crispness:** Canvas viewports scale dynamically with `window.devicePixelRatio` for razor-sharp typography at any zoom level.
* **AI Document Assistant:** Extracts active page text to deliver instant executive bullet-point takeaways. Configurable with Gemini API, OpenAI, or local extractive heuristics.
* **Full-Text Search & Dynamic Outline:** Automatically parses PDF bookmarks into a Table of Contents (TOC) and provides fast keyword search with highlighted context snippets.
* **Multi-Theme Experience:** Switch seamlessly between Dark Slate, Minimal Light, and Warm Classic Wood book styles.

---

## 🚀 Quick Start (React Component)

### 1. Installation

```bash
npm install pdf-html5-page-flip
# or
pnpm add pdf-html5-page-flip
```

### 2. Basic Usage

```tsx
import React from 'react';
import { PdfFlipbook } from 'pdf-html5-page-flip/react';

export default function DocumentViewer() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PdfFlipbook
        src="/assets/sample.pdf"
        theme="dark"
        mode="auto"
        onPageChange={(page, total) => console.log(`Active: ${page}/${total}`)}
      />
    </div>
  );
}
```

---

## ⚙️ Props API Reference (`<PdfFlipbook />`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string \| File \| ArrayBuffer` | *Required* | PDF source path, uploaded File object, or ArrayBuffer |
| `theme` | `'dark' \| 'light' \| 'wood'` | `'dark'` | Overall reading background theme |
| `mode` | `'auto' \| 'single' \| 'double'` | `'auto'` | Page presentation mode (auto-detects mobile vs desktop) |
| `showToolbar` | `boolean` | `true` | Show top glassmorphism toolbar |
| `showSidebar` | `boolean` | `true` | Show collapsible left sidebar drawer |
| `showNavigation` | `boolean` | `true` | Show first/prev/jump/next/last controls |
| `showSearch` | `boolean` | `true` | Enable full-text keyword search tab |
| `showOutline` | `boolean` | `true` | Enable document Table of Contents (TOC) tab |
| `showBookmarks` | `boolean` | `true` | Enable page bookmarking and saved marks tab |
| `showThumbnails` | `boolean` | `true` | Enable visual page thumbnails grid tab |
| `showAiSummary` | `boolean` | `true` | Enable AI assistant modal and summarizer |
| `showZoom` | `boolean` | `true` | Enable zoom in, zoom out, and fit controls |
| `showPrint` | `boolean` | `true` | Enable single-page image export and print |
| `showSound` | `boolean` | `true` | Enable synthesized paper friction audio |
| `showFullscreen`| `boolean` | `true` | Enable fullscreen toggle button |
| `showThemeToggle`| `boolean`| `true` | Enable theme cycler in toolbar |
| `showViewToggle` | `boolean` | `true` | Enable single/double page switcher button |
| `showFileUpload` | `boolean` | `true` | Enable local PDF picker button |
| `flippingTime` | `number` | `600` | Duration of flip animation in milliseconds |
| `onPageChange` | `(page, total) => void` | `undefined` | Callback fired when current page changes |
| `onDocumentLoad`| `(pdfDoc) => void` | `undefined` | Callback fired when PDFDocumentProxy is resolved |

---

## 🌐 Web Component Usage (Vanilla HTML / Non-React)

You can also embed the flipbook into any static website or web framework (Vue, Svelte, Angular, PHP, WordPress) via custom element:

```html
<script type="module" src="https://flipbook.apps.gracer.ai/assets/index.js"></script>
<link rel="stylesheet" href="https://flipbook.apps.gracer.ai/assets/index.css" />

<!-- Embed in one line -->
<pdf-flipbook src="/technical-guide.pdf" theme="dark" mode="auto"></pdf-flipbook>
```

---

## 🛠️ Local Development & Deployment

### Run Locally

```bash
# Clone the repository
git clone git@github.com:iamapinan/pdf-html5-page-flip.git
cd pdf-html5-page-flip
git checkout v2-modern

# Install dependencies
npm install

# Start Vite development server (HMR enabled)
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Docker Deployment

A lightweight `compose.yml` and `nginx.conf` are included for Docker-based deployment:

```bash
# Build and run with Docker Compose
docker compose up -d
```

---

## 📂 Repository Structure

```text
pdf-html5-page-flip/
├── index.html              # Modern Web Application shell
├── compose.yml             # Docker Compose deployment spec
├── nginx.conf              # Production Nginx reverse-proxy & MIME caching
├── package.json            # Dependencies & scripts
├── tsconfig.json           # Strict TypeScript configuration
├── vite.config.ts          # Vite bundler configuration
├── public/
│   └── sample.pdf          # Included technical sample PDF
└── src/
    ├── App.tsx             # Taste-Skill Landing Page & Live Studio
    ├── main.tsx            # React root entrypoint
    ├── style.css           # Tailwind v4 styles, 3D book spine lighting
    ├── sound.ts            # Web Audio API paper friction synthesizer
    ├── component.ts        # Standalone Web Component (<pdf-flipbook>)
    └── react/
        ├── PdfFlipbook.tsx # Fully configurable React Component
        ├── types.ts        # Complete TypeScript Props interface
        └── index.ts        # Library exports
```

---

## 📄 License

Open-source licensed under the [MIT License](LICENSE).
Created and maintained by [iamapinan](https://github.com/iamapinan).
