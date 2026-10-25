# QuickTools — Simple Tools. Fast Results.

> An all-in-one suite of 90+ fast, client-side, privacy-first online utilities for developers, designers, writers, and digital workers. Zero sign-up, zero server uploads, 100% in-browser processing.

---

## ⚡ Features

- **🔒 100% Private & Client-Side**: All file compression, format conversions, cryptographic hashing, and code transformations run directly in the browser. Your data never leaves your device.
- **⚡ Instant Performance**: No waiting for server queues or uploads.
- **🛠️ 90+ Utilities Across Multiple Categories**:
  - **Images**: Image Compressor, Resizer, Cropper, SVG Optimizer, WebP Converter, Favicon Generator, and more.
  - **PDFs**: PDF Merger, Splitter, Page Extractor, and Document Viewer.
  - **Color & Design**: Color Picker, Palette Generator, Contrast Checker (WCAG), CSS Gradient/Shadow/Border Generators.
  - **Code & Data**: JSON / CSV / XML / YAML Converters, Formatters, Minifiers, and Diff Viewers.
  - **Security**: Password Generator, UUID v4/v7 Generator, Checksum Calculator (MD5/SHA-256), Base64 & JWT Inspector.
  - **Web & SEO**: Meta Tag Builder, Sitemap Generator, Robots.txt Generator, URL Parser, and SERP Preview.
  - **Audio & Video**: Format Converters, Audio Trimmer, Video-to-GIF, and Video Trimmer.
- **🎨 Neo-Brutalist Aesthetic**: Clean, responsive layout with high contrast, dark mode support, and micro-interactions.
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile browsers.

---

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev) & TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Editor**: [CodeMirror 6](https://codemirror.net)
- **Client Processing**: WebAssembly, Canvas API, `browser-image-compression`, `pdf-lib`, `jszip`, `hash-wasm`

---

## 💻 Local Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/7-Sani/quicktools.git
cd quicktools
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

---

## 📄 License

MIT © [QuickTools](https://quicktools.app)
