export interface FontOption {
  id: string;
  name: string;
  category: "sans-serif" | "serif" | "monospace" | "display";
  fontFamily: string;
  isExternal: boolean;
  googleFontFamily?: string;
  weights: number[];
}

export const TYPOGRAPHY_FONTS: FontOption[] = [
  // Local / System Fonts (Zero external network requests)
  {
    id: "system-sans",
    name: "System Sans-Serif",
    category: "sans-serif",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    isExternal: false,
    weights: [300, 400, 500, 600, 700, 800],
  },
  {
    id: "georgia",
    name: "Georgia",
    category: "serif",
    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
    isExternal: false,
    weights: [400, 700],
  },
  {
    id: "garamond",
    name: "Garamond",
    category: "serif",
    fontFamily: 'Garamond, "Baskerville", "Baskerville Old Face", "Hoefler Text", serif',
    isExternal: false,
    weights: [400, 700],
  },
  {
    id: "trebuchet",
    name: "Trebuchet MS",
    category: "sans-serif",
    fontFamily: '"Trebuchet MS", "Lucida Grande", "Lucida Sans Unicode", sans-serif',
    isExternal: false,
    weights: [400, 700],
  },
  {
    id: "system-mono",
    name: "System Monospace",
    category: "monospace",
    fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "Courier New", monospace',
    isExternal: false,
    weights: [400, 600, 700],
  },
  {
    id: "arial",
    name: "Arial",
    category: "sans-serif",
    fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    isExternal: false,
    weights: [400, 700],
  },

  // Popular Web / Google Fonts (Loaded on-demand via Google Fonts CDN)
  {
    id: "inter",
    name: "Inter",
    category: "sans-serif",
    fontFamily: '"Inter", sans-serif',
    isExternal: true,
    googleFontFamily: "Inter:wght@300;400;500;600;700;800;900",
    weights: [300, 400, 500, 600, 700, 800, 900],
  },
  {
    id: "playfair",
    name: "Playfair Display",
    category: "serif",
    fontFamily: '"Playfair Display", serif',
    isExternal: true,
    googleFontFamily: "Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400",
    weights: [400, 600, 700, 900],
  },
  {
    id: "poppins",
    name: "Poppins",
    category: "sans-serif",
    fontFamily: '"Poppins", sans-serif',
    isExternal: true,
    googleFontFamily: "Poppins:wght@300;400;500;600;700;800",
    weights: [300, 400, 500, 600, 700, 800],
  },
  {
    id: "merriweather",
    name: "Merriweather",
    category: "serif",
    fontFamily: '"Merriweather", serif',
    isExternal: true,
    googleFontFamily: "Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300",
    weights: [300, 400, 700, 900],
  },
  {
    id: "space-grotesk",
    name: "Space Grotesk",
    category: "display",
    fontFamily: '"Space Grotesk", sans-serif',
    isExternal: true,
    googleFontFamily: "Space+Grotesk:wght@400;500;600;700",
    weights: [400, 500, 600, 700],
  },
  {
    id: "fira-code",
    name: "Fira Code",
    category: "monospace",
    fontFamily: '"Fira Code", monospace',
    isExternal: true,
    googleFontFamily: "Fira+Code:wght@400;500;600;700",
    weights: [400, 500, 600, 700],
  },
];

/**
 * Dynamically loads an external Google Font if not already attached to document head.
 */
export function loadExternalFont(font: FontOption): void {
  if (!font.isExternal || !font.googleFontFamily || typeof document === "undefined") return;

  const linkId = `gfont-${font.id}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleFontFamily}&display=swap`;
  document.head.appendChild(link);
}
