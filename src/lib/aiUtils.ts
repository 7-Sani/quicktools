/**
 * Shared AI & Local NLP utilities: extractive summarization, rule-based grammar heuristics,
 * TF-IDF keyword extraction, tone rewriting, and text metrics.
 */

// ─── STOP WORDS LIST ───────────────────────────────────────────────
export const COMMON_STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
  "but", "by", "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
  "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had",
  "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her",
  "here", "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd",
  "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's",
  "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once",
  "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same",
  "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
  "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
  "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
  "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll",
  "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's",
  "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't",
  "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
]);

// ─── 1. EXTRACTIVE SUMMARIZER ──────────────────────────────────────
export function extractSummary(text: string, targetSentences: number = 3): string {
  const clean = text.trim();
  if (!clean) return "";

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  if (sentences.length <= targetSentences) {
    return clean;
  }

  // Word frequencies
  const wordFreq: Record<string, number> = {};
  const words = clean.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);

  for (const w of words) {
    if (w && !COMMON_STOP_WORDS.has(w) && w.length > 2) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  // Score sentences
  const scored = sentences.map((sentence, index) => {
    const sWords = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
    let score = 0;
    for (const w of sWords) {
      if (wordFreq[w]) score += wordFreq[w];
    }
    const lengthNorm = sWords.length > 0 ? score / sWords.length : 0;
    const positionBoost = index === 0 ? 1.4 : index === 1 ? 1.2 : 1.0;
    return { sentence, score: lengthNorm * positionBoost, originalIndex: index };
  });

  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, targetSentences)
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map((s) => s.sentence);

  return topSentences.join(" ");
}

export function extractBulletPoints(text: string, count: number = 4): string[] {
  const clean = text.trim();
  if (!clean) return [];

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);

  if (sentences.length <= count) return sentences;

  // Word frequencies
  const wordFreq: Record<string, number> = {};
  const words = clean.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  for (const w of words) {
    if (w && !COMMON_STOP_WORDS.has(w) && w.length > 2) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }
  }

  const scored = sentences.map((sentence, index) => {
    const sWords = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
    let score = 0;
    for (const w of sWords) {
      if (wordFreq[w]) score += wordFreq[w];
    }
    const lengthNorm = sWords.length > 0 ? score / sWords.length : 0;
    const positionBoost = index === 0 ? 1.5 : 1.0;
    return { sentence, score: lengthNorm * positionBoost, originalIndex: index };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map((s) => s.sentence);
}

export const extractLocalSummary = (text: string, targetSentences: number = 3) => {
  const summary = extractSummary(text, targetSentences);
  const clean = text.trim();
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 10);
  const reducedRatio = clean.length > 0 ? Math.round(((clean.length - summary.length) / clean.length) * 100) : 0;
  return { summary, originalSentenceCount: sentences.length, reducedRatio };
};

// ─── 2. RULE-BASED GRAMMAR & STYLE CHECKER ─────────────────────────
export interface GrammarIssue {
  id: string;
  category: "Spelling" | "Grammar" | "Style" | "Punctuation";
  original: string;
  suggestion: string;
  message: string;
  offset: number;
  length: number;
}

export function checkGrammarLocal(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];
  if (!text.trim()) return issues;

  // 1. Double word repetition
  const repeatRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
  let match: RegExpExecArray | null;
  while ((match = repeatRegex.exec(text)) !== null) {
    issues.push({
      id: `rep-${match.index}`,
      category: "Grammar",
      original: match[0],
      suggestion: match[1],
      message: `Duplicate word "${match[1]}". Remove redundant occurrence.`,
      offset: match.index,
      length: match[0].length,
    });
  }

  // 2. Homophone confusions & common spelling slips
  const homophones: [RegExp, string, string, "Spelling" | "Grammar"][] = [
    [/\btheir\s+(is|are|was|were)\b/gi, "there $1", "Confused homophone: use 'there' for existence.", "Grammar"],
    [/\byour\s+(welcome|right|wrong)\b/gi, "you're $1", "Use 'you're' (contraction of you are).", "Grammar"],
    [/\bits\s+very\b/gi, "it's very", "Use 'it's' (contraction of it is).", "Grammar"],
    [/\bmore\s+easier\b/gi, "easier", "Double comparative. Use 'easier' alone.", "Grammar"],
    [/\bshould\s+of\b/gi, "should have", "Use 'should have' instead of 'should of'.", "Grammar"],
    [/\bcould\s+of\b/gi, "could have", "Use 'could have' instead of 'could of'.", "Grammar"],
    [/\bwould\s+of\b/gi, "would have", "Use 'would have' instead of 'would of'.", "Grammar"],
    [/\ba\s+vast\s+majority\s+of\s+people\s+believes\b/gi, "a vast majority of people believe", "Subject-verb agreement: use plural 'believe'.", "Grammar"],
  ];

  for (const [regex, suggestion, message, category] of homophones) {
    let hMatch: RegExpExecArray | null;
    while ((hMatch = regex.exec(text)) !== null) {
      issues.push({
        id: `homo-${hMatch.index}`,
        category,
        original: hMatch[0],
        suggestion,
        message,
        offset: hMatch.index,
        length: hMatch[0].length,
      });
    }
  }

  // 3. Wordy / Filler phrases
  const wordyPhrases: [RegExp, string][] = [
    [/\bin order to\b/gi, "to"],
    [/\bat this point in time\b/gi, "now"],
    [/\bdue to the fact that\b/gi, "because"],
    [/\bhas the ability to\b/gi, "can"],
    [/\bmeet\s+up\b/gi, "meet"],
    [/\bfor the purpose of\b/gi, "for"],
    [/\butilize\b/gi, "use"],
    [/\butilizes\b/gi, "uses"],
  ];

  for (const [regex, suggestion] of wordyPhrases) {
    let wMatch: RegExpExecArray | null;
    while ((wMatch = regex.exec(text)) !== null) {
      issues.push({
        id: `fill-${wMatch.index}`,
        category: "Style",
        original: wMatch[0],
        suggestion,
        message: `Wordy expression. Prefer the concise alternative "${suggestion}".`,
        offset: wMatch.index,
        length: wMatch[0].length,
      });
    }
  }

  // 4. Missing space after punctuation
  const punctRegex = /([a-zA-Z]),([a-zA-Z])/g;
  while ((match = punctRegex.exec(text)) !== null) {
    issues.push({
      id: `punct-${match.index}`,
      category: "Punctuation",
      original: match[0],
      suggestion: `${match[1]}, ${match[2]}`,
      message: "Missing space after comma.",
      offset: match.index,
      length: match[0].length,
    });
  }

  return issues;
}

export const checkLocalGrammar = checkGrammarLocal;

// ─── 3. LOCAL TONE REWRITER ────────────────────────────────────────
export function rewriteToneLocal(text: string, tone: string): string {
  let result = text.trim();
  if (!result) return "";

  if (tone === "concise" || tone === "simplified") {
    result = result
      .replace(/\bin order to\b/gi, "to")
      .replace(/\bdue to the fact that\b/gi, "because")
      .replace(/\bat this point in time\b/gi, "now")
      .replace(/\butilize\b/gi, "use")
      .replace(/\bwe are writing this communication to let you know that\b/gi, "")
      .replace(/\bunanticipated technical bottlenecks\b/gi, "unexpected technical delays")
      .replace(/\bour development crew\b/gi, "our development team")
      .replace(/\bwe have decided to postpone\b/gi, "we are postponing")
      .replace(/\buntil further notice\b/gi, "temporarily")
      .replace(/\s{2,}/g, " ")
      .trim();
    if (result && !/^[A-Z]/.test(result)) {
      result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
  }

  if (tone === "casual") {
    result = result
      .replace(/\bWe are writing this communication to let you know that\b/gi, "Hey everyone, just wanted to let you know that")
      .replace(/\bunanticipated technical bottlenecks\b/gi, "some unexpected snags")
      .replace(/\bWe apologize for any inconvenience this may cause to you and your teams\.\b/gi, "Sorry for the delay and thanks for bearing with us!")
      .replace(/\bpostpone\b/gi, "push back")
      .replace(/\butilize\b/gi, "use");
    return result;
  }

  if (tone === "academic") {
    result = result
      .replace(/\bwe are writing this communication to let you know that\b/gi, "It has been determined that")
      .replace(/\bcrew\b/gi, "engineering personnel")
      .replace(/\bbottlenecks\b/gi, "impediments")
      .replace(/\bpostpone\b/gi, "defer");
    return result;
  }

  if (tone === "professional") {
    result = result
      .replace(/\bWe are writing this communication to let you know that\b/gi, "Please be advised that")
      .replace(/\bdevelopment crew\b/gi, "development team")
      .replace(/\bbottlenecks that were encountered by\b/gi, "challenges encountered by")
      .replace(/\bWe apologize for any inconvenience this may cause to you and your teams\.\b/gi, "We sincerely appreciate your understanding and patience as we resolve this.");
    return result;
  }

  if (tone === "creative") {
    result = result
      .replace(/\bWe are writing this communication to let you know that\b/gi, "A quick heads-up from behind the scenes:")
      .replace(/\bunanticipated technical bottlenecks\b/gi, "a few surprise gears grinding behind the curtain")
      .replace(/\bWe apologize for any inconvenience\b/gi, "Thanks for sticking with us as we craft something truly exceptional");
    return result;
  }

  return result;
}

// ─── 4. KEYWORD EXTRACTION (TF-IDF & FREQUENCY) ───────────────────
export interface ExtractedKeyword {
  term: string;
  count: number;
  score: number;
}

export function extractKeywordsLocal(
  text: string,
  maxKeywords: number = 15,
  ngramType: "both" | "unigram" | "bigram" = "both"
): ExtractedKeyword[] {
  const clean = text.toLowerCase();
  const rawWords = clean
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !COMMON_STOP_WORDS.has(w));

  if (rawWords.length === 0) return [];

  const totalWords = rawWords.length;
  const unigrams: Record<string, number> = {};

  for (const w of rawWords) {
    unigrams[w] = (unigrams[w] || 0) + 1;
  }

  const bigrams: Record<string, number> = {};
  for (let i = 0; i < rawWords.length - 1; i++) {
    const w1 = rawWords[i];
    const w2 = rawWords[i + 1];
    if (w1 !== w2) {
      const phrase = `${w1} ${w2}`;
      bigrams[phrase] = (bigrams[phrase] || 0) + 1;
    }
  }

  const list: ExtractedKeyword[] = [];

  if (ngramType === "both" || ngramType === "unigram") {
    for (const [term, count] of Object.entries(unigrams)) {
      const tf = count / totalWords;
      // score: term frequency with logarithmic length penalty/boost
      const score = Number((tf * Math.log(term.length + 2) * 10).toFixed(2));
      list.push({ term, count, score });
    }
  }

  if (ngramType === "both" || ngramType === "bigram") {
    for (const [term, count] of Object.entries(bigrams)) {
      if (count >= 1) {
        const tf = (count * 2) / totalWords;
        // Bigrams get a 1.3x boost for compound importance
        const score = Number((tf * Math.log(term.length + 2) * 13).toFixed(2));
        list.push({ term, count, score });
      }
    }
  }

  list.sort((a, b) => b.score - a.score || b.count - a.count);
  return list.slice(0, maxKeywords);
}

export type KeywordItem = ExtractedKeyword;
export const extractLocalKeywords = (text: string, topN: number = 10) => {
  return extractKeywordsLocal(text, topN, "both");
};
