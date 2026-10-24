/**
 * Accessibility calculation utilities: WCAG contrast formulas, HTML heading parsing, and readability algorithms.
 */

// ─── WCAG CONTRAST FORMULAS ────────────────────────────────────────
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export interface WcagCompliance {
  ratio: number;
  aaNormal: boolean; // >= 4.5
  aaLarge: boolean; // >= 3.0
  aaaNormal: boolean; // >= 7.0
  aaaLarge: boolean; // >= 4.5
  uiComponent: boolean; // >= 3.0
}

export function calculateContrastRatio(fgHex: string, bgHex: string): WcagCompliance {
  const fg = hexToRgb(fgHex) || { r: 0, g: 0, b: 0 };
  const bg = hexToRgb(bgHex) || { r: 255, g: 255, b: 255 };

  const l1 = getRelativeLuminance(fg.r, fg.g, fg.b);
  const l2 = getRelativeLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));

  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3.0,
    aaaNormal: ratio >= 7.0,
    aaaLarge: ratio >= 4.5,
    uiComponent: ratio >= 3.0,
  };
}

// ─── HEADING STRUCTURE PARSER ──────────────────────────────────────
export interface HeadingItem {
  id: string;
  level: number;
  tag: string;
  text: string;
  index: number;
  issues: string[];
}

export interface HeadingAnalysisResult {
  headings: HeadingItem[];
  totalCount: number;
  h1Count: number;
  issues: string[];
  passed: boolean;
}

export function analyzeHeadingStructure(htmlText: string): HeadingAnalysisResult {
  if (!htmlText.trim()) {
    return {
      headings: [],
      totalCount: 0,
      h1Count: 0,
      issues: ["No HTML content provided to analyze."],
      passed: false,
    };
  }

  const headingRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const headings: HeadingItem[] = [];
  const globalIssues: string[] = [];

  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = headingRegex.exec(htmlText)) !== null) {
    const tag = match[1].toLowerCase();
    const level = parseInt(tag.charAt(1), 10);
    // Strip nested tags from heading text
    const text = match[2].replace(/<[^>]*>/g, "").trim();

    headings.push({
      id: `h-${index}`,
      level,
      tag,
      text,
      index,
      issues: [],
    });
    index++;
  }

  if (headings.length === 0) {
    return {
      headings: [],
      totalCount: 0,
      h1Count: 0,
      issues: ["No heading tags (<h1> through <h6>) were found in the provided HTML."],
      passed: false,
    };
  }

  // Count H1s
  const h1Count = headings.filter((h) => h.level === 1).length;

  if (h1Count === 0) {
    globalIssues.push("Missing <h1> tag. Every accessible page or major section should have a clear top-level <h1>.");
  } else if (h1Count > 1) {
    globalIssues.push(`Found ${h1Count} <h1> tags. While valid in HTML5 sectional root contexts, best WCAG practice recommends a single <h1> per page for screen reader navigation.`);
  }

  // Check skipped levels and empty headings
  let prevLevel = 0;
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];

    // Empty check
    if (!h.text) {
      const msg = `Empty heading tag <${h.tag}> with no accessible text content.`;
      h.issues.push(msg);
      globalIssues.push(msg);
    }

    // Long heading check
    if (h.text.length > 120) {
      h.issues.push(`Overly long heading text (${h.text.length} chars). Consider concise headings.`);
    }

    // Hierarchy skipping check: level shouldn't increase by more than 1
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      const msg = `Skipped heading level: <h${prevLevel}> is immediately followed by <h${h.level}> without an intervening <h${prevLevel + 1}>.`;
      h.issues.push(msg);
      globalIssues.push(msg);
    }

    prevLevel = h.level;
  }

  return {
    headings,
    totalCount: headings.length,
    h1Count,
    issues: Array.from(new Set(globalIssues)),
    passed: globalIssues.length === 0,
  };
}

// ─── READABILITY FORMULAS ──────────────────────────────────────────
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  // Remove common non-pronounced endings
  const processed = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, "")
    .replace(/^y/, "");

  const syllables = processed.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

export interface ReadabilityMetrics {
  wordsCount: number;
  sentencesCount: number;
  charactersCount: number;
  syllablesCount: number;
  complexWordsCount: number; // Words with >= 3 syllables
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  gunningFog: number;
  readingEaseDescription: string;
}

export function calculateReadability(text: string): ReadabilityMetrics {
  const clean = text.trim();
  if (!clean) {
    return {
      wordsCount: 0,
      sentencesCount: 0,
      charactersCount: 0,
      syllablesCount: 0,
      complexWordsCount: 0,
      fleschReadingEase: 0,
      fleschKincaidGrade: 0,
      gunningFog: 0,
      readingEaseDescription: "No text provided",
    };
  }

  // Sentences split by . ! ?
  const sentences = clean
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const sentencesCount = Math.max(1, sentences.length);

  // Words split by whitespace
  const words = clean
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z]/g, ""))
    .filter((w) => w.length > 0);
  const wordsCount = Math.max(1, words.length);

  let syllablesCount = 0;
  let complexWordsCount = 0;

  for (const w of words) {
    const syl = countSyllables(w);
    syllablesCount += syl;
    if (syl >= 3) {
      complexWordsCount++;
    }
  }

  const wordsPerSentence = wordsCount / sentencesCount;
  const syllablesPerWord = syllablesCount / wordsCount;

  // Flesch Reading Ease = 206.835 - 1.015 * (words/sentence) - 84.6 * (syllables/word)
  const fleschReadingEase = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord)
  );

  // Flesch-Kincaid Grade Level = 0.39 * (words/sentence) + 11.8 * (syllables/word) - 15.59
  const fleschKincaidGrade = Math.max(
    0,
    0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59
  );

  // Gunning Fog Index = 0.4 * ((words/sentence) + 100 * (complexWords / words))
  const gunningFog = Math.max(
    0,
    0.4 * (wordsPerSentence + 100 * (complexWordsCount / wordsCount))
  );

  let readingEaseDescription = "Standard (8th - 9th Grade)";
  if (fleschReadingEase >= 90) readingEaseDescription = "Very Easy (5th Grade level)";
  else if (fleschReadingEase >= 80) readingEaseDescription = "Easy (Conversational)";
  else if (fleschReadingEase >= 70) readingEaseDescription = "Fairly Easy (7th Grade level)";
  else if (fleschReadingEase >= 60) readingEaseDescription = "Standard Plain English (8th - 9th Grade)";
  else if (fleschReadingEase >= 50) readingEaseDescription = "Fairly Difficult (High School)";
  else if (fleschReadingEase >= 30) readingEaseDescription = "Difficult (College Level)";
  else readingEaseDescription = "Very Confusing / Academic (Graduate Level)";

  return {
    wordsCount,
    sentencesCount,
    charactersCount: clean.length,
    syllablesCount,
    complexWordsCount,
    fleschReadingEase: Number(fleschReadingEase.toFixed(1)),
    fleschKincaidGrade: Number(fleschKincaidGrade.toFixed(1)),
    gunningFog: Number(gunningFog.toFixed(1)),
    readingEaseDescription,
  };
}
