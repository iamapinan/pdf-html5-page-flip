# PDF HTML5 Page Flip Pro (`pdf-html5-page-flip`)

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-flipbook.apps.gracer.ai-emerald?logo=googlechrome)](https://flipbook.apps.gracer.ai)

<p align="center">
  <a href="https://flipbook.apps.gracer.ai" target="_blank" rel="noopener noreferrer">
    <img src="./docs/cover.png" alt="PDF HTML5 Page Flip Pro Preview" width="100%" style="max-width: 920px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.08);" />
  </a>
</p>

A modern, high-performance, client-side 3D Web Application and React Component that converts standard PDF files into realistic, hardware-accelerated HTML5 flipbooks with physics-based page turning, memory virtualization, full-text search, customizable branding, and on-demand AI document summarization.

Live Production Website: [https://flipbook.apps.gracer.ai](https://flipbook.apps.gracer.ai) (or [https://pdf-flip.apps.gracer.ai](https://pdf-flip.apps.gracer.ai))

---

## Key Highlights and Architecture

* 100% Client-Side Privacy: All parsing and rendering execute directly in the browser runtime using PDF.js and Web Workers. Confidential documents never leave the client device.
* High Performance Display: Dynamic viewport calculation with hardware acceleration, responsive page scaling, and automatic memory cleanup for distant pages.
* Remote PDF and Deep Link Support: Open public remote PDFs directly through the user interface or URL parameters (`?pdf=https://example.com/doc.pdf`) with automated CORS proxy fallback.
* Customizable Appearance and Branding: Toggle brand logo, adjust theme (Dark, Light, Wood), configure accent colors, and customize toolbar items.
* Synthesized Page-Turn Audio: Dynamically creates realistic paper friction sounds on-the-fly via the Web Audio API without external audio files or network requests.
* HiDPI and Retina Sharpness: Canvases scale dynamically based on `window.devicePixelRatio` for sharp rendering across all displays and zoom levels.
* Full-Text Search and Dynamic Outline: Scans and indexes document text with context snippets and extracts native PDF bookmarks for a Table of Contents.
* AI Document Assistant: Extracts active page text to deliver concise executive summaries on demand.

---

## Quick Start (React Component)

### 1. Installation

Configure your project `.npmrc` to route the `@iamapinan` scope to GitHub Packages:

```shell
@iamapinan:registry=https://npm.pkg.github.com
```

Install the package:

```bash
npm install pdf-html5-page-flip
```

### 2. Basic Usage

```tsx
import React from 'react';
import { PdfFlipbook } from 'pdf-html5-page-flip/react';
import 'pdf-html5-page-flip/style.css';

export default function DocumentViewer() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <PdfFlipbook
        src="/assets/sample.pdf"
        theme="dark"
        mode="auto"
        accentColor="#6366f1"
        showLogo={true}
        onPageChange={(page, total) => console.log(`Active: ${page}/${total}`)}
      />
    </div>
  );
}
```

---

## Props API Reference (`<PdfFlipbook />`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `src` | `string \| File \| ArrayBuffer` | Required | PDF source URL string, File object, or raw ArrayBuffer |
| `theme` | `'dark' \| 'light' \| 'wood'` | `'dark'` | Overall reading background theme |
| `mode` | `'auto' \| 'single' \| 'double'` | `'auto'` | Page presentation mode (auto-detects viewport width) |
| `accentColor` | `string` | `'#6366f1'` | Accent color used for highlights, icons, and buttons |
| `showLogo` | `boolean` | `true` | Show or hide brand logo and title in the top toolbar |
| `showToolbar` | `boolean` | `true` | Show top glassmorphism toolbar |
| `showSidebar` | `boolean` | `true` | Show collapsible left sidebar drawer |
| `showNavigation` | `boolean` | `true` | Show page turn buttons and direct page jump input |
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
| `showUrlInput` | `boolean` | `true` | Enable remote URL input modal button |
| `flippingTime` | `number` | `800` | Duration of flip animation in milliseconds |
| `onPageChange` | `(page, total) => void` | `undefined` | Callback fired when current page changes |
| `onDocumentLoad`| `(pdfDoc) => void` | `undefined` | Callback fired when PDFDocumentProxy is resolved |
| `onFileSelect` | `(file: File) => void` | `undefined` | Callback fired when a local file is opened inside viewer |

---

## Web Component Usage (Vanilla HTML or Non-React)

Embed the flipbook into static websites or non-React web applications:

```html
<script type="module" src="https://flipbook.apps.gracer.ai/assets/index.js"></script>
<link rel="stylesheet" href="https://flipbook.apps.gracer.ai/assets/index.css" />

<!-- Embed in one line -->
<pdf-flipbook src="/technical-guide.pdf" theme="dark" mode="auto"></pdf-flipbook>
```

---

## Local Development and Deployment

### Run Locally

```bash
# Clone the repository
git clone git@github.com:iamapinan/pdf-html5-page-flip.git
cd pdf-html5-page-flip

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build web application and library package
npm run build

# Preview build locally
npm run preview
```

### Docker Deployment

A lightweight Docker Compose configuration with custom Nginx MIME routing is included:

```bash
docker compose up -d
```

---

## Repository Structure

```text
pdf-html5-page-flip/
├── index.html              # Modern Web Application shell
├── compose.yml             # Docker Compose deployment specification
├── nginx.conf              # Nginx reverse-proxy and MIME configuration
├── package.json            # Package metadata, exports, and dependencies
├── tsconfig.json           # TypeScript configuration for application
├── tsconfig.lib.json       # TypeScript configuration for library declarations
├── vite.config.ts          # Vite bundler configuration for application
├── vite.config.lib.ts      # Vite bundler configuration for library package
└── src/
    ├── App.tsx             # Studio application and Props Configurator
    ├── main.tsx            # React application entrypoint
    ├── index.ts            # NPM package entrypoint
    ├── style.css           # Tailwind v4 styles, 3D book spine lighting
    ├── sound.ts            # Web Audio API paper friction synthesizer
    ├── component.ts        # Standalone Web Component (<pdf-flipbook>)
    └── react/
        ├── PdfFlipbook.tsx # Configurable React Component
        ├── types.ts        # TypeScript Props interface
        └── index.ts        # React export entrypoint
```

---

## Contributors

<p align="left">
  <a href="https://github.com/iamapinan">
    <img src="https://github.com/iamapinan.png?size=80" width="80" height="80" alt="iamapinan" style="border-radius: 50%;" />
  </a>
</p>

[![Contributors](https://contrib.rocks/image?repo=iamapinan/pdf-html5-page-flip)](https://github.com/iamapinan/pdf-html5-page-flip/graphs/contributors)

---

## License

Open-source licensed under the [Apache-2.0 License](LICENSE).  
Created and maintained by [iamapinan](https://github.com/iamapinan).
