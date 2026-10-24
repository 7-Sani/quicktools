/**
 * Social media formatting, character limits, unicode font styling, and dimension data.
 */

// ─── UNICODE FONT MAPS ──────────────────────────────────────────────
const NORMAL_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const BOLD_SANS = "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";
const ITALIC_SANS = "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡0123456789";
const BOLD_ITALIC_SANS = "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵";
const MONOSPACE = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿";
const SCRIPT = "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789";
const BUBBLE = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ0①②③④⑤⑥⑦⑧⑨";
const GOTHIC = "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ0123456789";

export type UnicodeStyleKey = "normal" | "bold" | "italic" | "boldItalic" | "monospace" | "script" | "bubble" | "gothic";

export const UNICODE_STYLES: { id: UnicodeStyleKey; label: string; sample: string }[] = [
  { id: "normal", label: "Normal (Standard)", sample: "Normal Text" },
  { id: "bold", label: "Bold Sans", sample: "𝗕𝗼𝗹𝗱 𝗦𝗮𝗻𝘀" },
  { id: "italic", label: "Italic Sans", sample: "𝘐𝘵𝘢𝘭𝘪𝘤 𝘚𝘢𝘯𝘴" },
  { id: "boldItalic", label: "Bold Italic", sample: "𝘽𝙤𝙡𝙙 𝙄𝙩𝙖𝙡𝙞𝙘" },
  { id: "monospace", label: "Monospace", sample: "𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎" },
  { id: "script", label: "Script / Cursive", sample: "𝒮𝒸𝓇𝒾𝓅𝓉" },
  { id: "bubble", label: "Circled / Bubble", sample: "Ⓑⓤⓑⓑⓛⓔ" },
  { id: "gothic", label: "Gothic / Fraktur", sample: "𝔊𝔬𝔱𝔥𝔦𝔠" },
];

function mapCharacters(text: string, source: string, targetArray: string[]): string {
  const map: Record<string, string> = {};
  for (let i = 0; i < source.length; i++) {
    map[source[i]] = targetArray[i] || source[i];
  }
  return text
    .split("")
    .map((char) => map[char] || char)
    .join("");
}

export function convertToUnicodeFont(text: string, style: UnicodeStyleKey): string {
  if (style === "normal") return text;
  
  // Array of target characters (handling surrogate pairs / unicode points)
  const getPoints = (s: string) => Array.from(s);

  switch (style) {
    case "bold":
      return mapCharacters(text, NORMAL_CHARS, getPoints(BOLD_SANS));
    case "italic":
      return mapCharacters(text, NORMAL_CHARS, getPoints(ITALIC_SANS));
    case "boldItalic":
      return mapCharacters(text, NORMAL_CHARS, getPoints(BOLD_ITALIC_SANS));
    case "monospace":
      return mapCharacters(text, NORMAL_CHARS, getPoints(MONOSPACE));
    case "script":
      return mapCharacters(text, NORMAL_CHARS, getPoints(SCRIPT));
    case "bubble":
      return mapCharacters(text, NORMAL_CHARS, getPoints(BUBBLE));
    case "gothic":
      return mapCharacters(text, NORMAL_CHARS, getPoints(GOTHIC));
    default:
      return text;
  }
}

// ─── CAPTION FORMATTER / LINE-BREAK PRESERVER ──────────────────────
export type SpacingMethod = "invisible" | "bullet" | "dot" | "dash" | "tilde";

export function formatCaptionLineBreaks(text: string, method: SpacingMethod): string {
  const lines = text.split(/\r?\n/);
  
  const separator =
    method === "invisible"
      ? "\u2800" // Braille blank pattern - works reliably across Instagram, TikTok, LinkedIn
      : method === "bullet"
      ? "•"
      : method === "dot"
      ? "."
      : method === "dash"
      ? "—"
      : "~";

  const processed = lines.map((line) => {
    // If the line is empty or purely whitespace, insert the spacer character
    if (!line.trim()) {
      return separator;
    }
    return line;
  });

  return processed.join("\n");
}

// ─── HASHTAG UTILITIES ─────────────────────────────────────────────
export type HashtagSortOption = "original" | "alpha" | "length" | "reverse";
export type HashtagCaseOption = "preserve" | "lowercase" | "pascal" | "uppercase";

export function cleanAndFormatHashtags(
  rawInput: string,
  sortOption: HashtagSortOption = "original",
  caseOption: HashtagCaseOption = "preserve"
): { tags: string[]; count: number; duplicatesRemoved: number } {
  if (!rawInput.trim()) return { tags: [], count: 0, duplicatesRemoved: 0 };

  // Split by whitespace, comma, or newlines
  const tokens = rawInput
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const seen = new Set<string>();
  const cleaned: string[] = [];
  let duplicates = 0;

  for (const token of tokens) {
    // Strip leading hashes or punctuation
    let core = token.replace(/^[#@]+/, "").replace(/[^\p{L}\p{N}_]/gu, "");
    if (!core) continue;

    // Apply casing
    if (caseOption === "lowercase") {
      core = core.toLowerCase();
    } else if (caseOption === "uppercase") {
      core = core.toUpperCase();
    } else if (caseOption === "pascal") {
      // capitalize words split by underscore or capitalize first letter
      core = core.charAt(0).toUpperCase() + core.slice(1);
    }

    const tag = `#${core}`;
    const lowerKey = tag.toLowerCase();

    if (seen.has(lowerKey)) {
      duplicates++;
    } else {
      seen.add(lowerKey);
      cleaned.push(tag);
    }
  }

  // Sorting
  if (sortOption === "alpha") {
    cleaned.sort((a, b) => a.localeCompare(b));
  } else if (sortOption === "length") {
    cleaned.sort((a, b) => a.length - b.length || a.localeCompare(b));
  } else if (sortOption === "reverse") {
    cleaned.reverse();
  }

  return {
    tags: cleaned,
    count: cleaned.length,
    duplicatesRemoved: duplicates,
  };
}

// ─── PLATFORM LIMITS & SPECS ───────────────────────────────────────
export interface PlatformLimit {
  id: string;
  name: string;
  category: "post" | "bio" | "title" | "desc";
  maxChars: number;
  recommendedChars?: number;
  maxHashtags?: number;
  description: string;
}

export const PLATFORM_LIMITS: PlatformLimit[] = [
  {
    id: "twitter-post",
    name: "X (Twitter) Post",
    category: "post",
    maxChars: 280,
    recommendedChars: 100,
    maxHashtags: 5,
    description: "Standard post length. 100-200 chars for optimal engagement.",
  },
  {
    id: "instagram-caption",
    name: "Instagram Caption",
    category: "post",
    maxChars: 2200,
    recommendedChars: 150,
    maxHashtags: 30,
    description: "Truncates at 125 chars before '...more'. 30 hashtags max.",
  },
  {
    id: "threads-post",
    name: "Threads Post",
    category: "post",
    maxChars: 500,
    recommendedChars: 250,
    description: "Standard text post limit. Up to 1 topic tag.",
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    category: "post",
    maxChars: 3000,
    recommendedChars: 1300,
    maxHashtags: 5,
    description: "Truncates at ~140-200 characters before 'see more'.",
  },
  {
    id: "tiktok-caption",
    name: "TikTok Video Caption",
    category: "post",
    maxChars: 2200,
    recommendedChars: 150,
    description: "Displayed over bottom video frame. Truncates after 1-2 lines.",
  },
  {
    id: "youtube-title",
    name: "YouTube Video Title",
    category: "title",
    maxChars: 100,
    recommendedChars: 65,
    description: "Hard limit 100. 60-70 chars prevents cutoff in mobile search.",
  },
  {
    id: "youtube-desc",
    name: "YouTube Description",
    category: "desc",
    maxChars: 5000,
    recommendedChars: 1500,
    description: "First 150 chars appear above the fold before '...more'.",
  },
  {
    id: "instagram-bio",
    name: "Instagram Bio",
    category: "bio",
    maxChars: 150,
    description: "Public profile bio. 1 external link allowed separately.",
  },
  {
    id: "twitter-bio",
    name: "X (Twitter) Bio",
    category: "bio",
    maxChars: 160,
    description: "Bio field displayed directly below header on user profile.",
  },
  {
    id: "tiktok-bio",
    name: "TikTok Profile Bio",
    category: "bio",
    maxChars: 80,
    description: "Short punchy summary displayed on mobile profile.",
  },
  {
    id: "linkedin-headline",
    name: "LinkedIn Headline",
    category: "bio",
    maxChars: 220,
    description: "Displayed beside your name in searches and connections.",
  },
  {
    id: "facebook-post",
    name: "Facebook Post",
    category: "post",
    maxChars: 63206,
    recommendedChars: 80,
    description: "Cut off with 'See More' at ~250 characters.",
  },
  {
    id: "pinterest-desc",
    name: "Pinterest Pin Description",
    category: "desc",
    maxChars: 500,
    recommendedChars: 100,
    description: "First 50-60 characters appear in feed view.",
  },
];

// ─── SOCIAL IMAGE DIMENSIONS REFERENCE ─────────────────────────────
export interface DimensionEntry {
  platform: "Instagram" | "YouTube" | "X (Twitter)" | "LinkedIn" | "TikTok" | "Facebook" | "Pinterest";
  assetType: string;
  width: number;
  height: number;
  aspectRatio: string;
  maxFileSize: string;
  format: string;
  notes: string;
}

export const SOCIAL_IMAGE_DIMENSIONS: DimensionEntry[] = [
  // Instagram
  {
    platform: "Instagram",
    assetType: "Feed Square Post",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    maxFileSize: "30 MB",
    format: "JPG, PNG",
    notes: "Classic square format. Displayed crisp at 1080x1080.",
  },
  {
    platform: "Instagram",
    assetType: "Feed Portrait Post",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    maxFileSize: "30 MB",
    format: "JPG, PNG",
    notes: "Takes up maximum vertical feed screen real estate.",
  },
  {
    platform: "Instagram",
    assetType: "Story & Reel Cover",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    maxFileSize: "30 MB",
    format: "JPG, PNG",
    notes: "Keep key elements within central 1080x1420 safe zone.",
  },
  {
    platform: "Instagram",
    assetType: "Profile Picture",
    width: 320,
    height: 320,
    aspectRatio: "1:1 (Circular)",
    maxFileSize: "10 MB",
    format: "JPG, PNG",
    notes: "Displayed circular. Upload at least 320x320 for sharp Retina rendering.",
  },

  // YouTube
  {
    platform: "YouTube",
    assetType: "Video Thumbnail",
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    maxFileSize: "2 MB",
    format: "JPG, PNG, GIF, BMP",
    notes: "Minimum 640px width. Under 2MB limit strictly enforced by YouTube.",
  },
  {
    platform: "YouTube",
    assetType: "Channel Banner",
    width: 2560,
    height: 1440,
    aspectRatio: "16:9",
    maxFileSize: "6 MB",
    format: "JPG, PNG",
    notes: "Central safe zone for text & logos is 1235 x 338 px.",
  },
  {
    platform: "YouTube",
    assetType: "Channel Profile Icon",
    width: 800,
    height: 800,
    aspectRatio: "1:1 (Circular)",
    maxFileSize: "4 MB",
    format: "JPG, PNG, GIF, BMP",
    notes: "Rendered circular at 98x98 px on desktop.",
  },

  // X / Twitter
  {
    platform: "X (Twitter)",
    assetType: "In-Stream Single Image",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    maxFileSize: "5 MB (Photos) / 15 MB (Web)",
    format: "JPG, PNG, WebP, GIF",
    notes: "Default ratio for single image tweet preview.",
  },
  {
    platform: "X (Twitter)",
    assetType: "Header Banner",
    width: 1500,
    height: 500,
    aspectRatio: "3:1",
    maxFileSize: "5 MB",
    format: "JPG, PNG",
    notes: "Leave bottom-left corner clear for profile picture overlay.",
  },
  {
    platform: "X (Twitter)",
    assetType: "Profile Picture",
    width: 400,
    height: 400,
    aspectRatio: "1:1 (Circular)",
    maxFileSize: "2 MB",
    format: "JPG, PNG",
    notes: "Cropped to a circle on both web and mobile app.",
  },

  // LinkedIn
  {
    platform: "LinkedIn",
    assetType: "Shared Post / Link Feed Image",
    width: 1200,
    height: 627,
    aspectRatio: "1.91:1",
    maxFileSize: "10 MB",
    format: "JPG, PNG",
    notes: "Standard link preview card and image post dimension.",
  },
  {
    platform: "LinkedIn",
    assetType: "Personal Background Cover",
    width: 1584,
    height: 396,
    aspectRatio: "4:1",
    maxFileSize: "8 MB",
    format: "JPG, PNG",
    notes: "Banner across the top of your personal profile.",
  },
  {
    platform: "LinkedIn",
    assetType: "Company Page Cover Banner",
    width: 1128,
    height: 191,
    aspectRatio: "5.9:1",
    maxFileSize: "8 MB",
    format: "JPG, PNG",
    notes: "Banner atop company/organization pages.",
  },
  {
    platform: "LinkedIn",
    assetType: "Profile Picture",
    width: 400,
    height: 400,
    aspectRatio: "1:1 (Circular)",
    maxFileSize: "8 MB",
    format: "JPG, PNG",
    notes: "Professional headshot displayed in circular frame.",
  },

  // TikTok
  {
    platform: "TikTok",
    assetType: "Video / Story Fullscreen",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    maxFileSize: "287 MB (iOS) / 72 MB (Android)",
    format: "MP4, MOV",
    notes: "Keep text away from right edge (buttons) and bottom (captions).",
  },
  {
    platform: "TikTok",
    assetType: "Profile Avatar",
    width: 200,
    height: 200,
    aspectRatio: "1:1 (Circular)",
    maxFileSize: "2 MB",
    format: "JPG, PNG",
    notes: "Minimum 20x20 px, recommended 200x200 px.",
  },

  // Facebook
  {
    platform: "Facebook",
    assetType: "Feed Post / Shared Link",
    width: 1200,
    height: 630,
    aspectRatio: "1.91:1",
    maxFileSize: "8 MB",
    format: "JPG, PNG",
    notes: "Optimal Open Graph shared link image resolution.",
  },
  {
    platform: "Facebook",
    assetType: "Page Cover Photo",
    width: 820,
    height: 312,
    aspectRatio: "2.63:1",
    maxFileSize: "100 KB (Recommended)",
    format: "sRGB JPG or PNG",
    notes: "Displays at 820x312 on desktop and 640x360 on smartphones.",
  },

  // Pinterest
  {
    platform: "Pinterest",
    assetType: "Standard Pin",
    width: 1000,
    height: 1500,
    aspectRatio: "2:3",
    maxFileSize: "20 MB",
    format: "JPG, PNG",
    notes: "Vertical format with highest repin and save rate.",
  },
];
