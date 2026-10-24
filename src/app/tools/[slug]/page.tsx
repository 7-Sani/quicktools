import { notFound } from "next/navigation";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { TOOLS, TOOL_MAP } from "@/config/tools";
import { ToolShell } from "@/components/ToolShell";

// ─── DYNAMIC TOOL COMPONENT MAP ───────────────────────────────────
const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  // Image tools
  "image-compressor": dynamic(() => import("@/tools/image/image-compressor/ImageCompressorTool")),
  "image-resizer": dynamic(() => import("@/tools/image/image-resizer/ImageResizerTool")),
  "image-cropper": dynamic(() => import("@/tools/image/image-cropper/ImageCropperTool")),
  "jpg-to-png": dynamic(() => import("@/tools/image/jpg-to-png/JpgToPngTool")),
  "png-to-jpg": dynamic(() => import("@/tools/image/png-to-jpg/PngToJpgTool")),
  "jpg-to-webp": dynamic(() => import("@/tools/image/jpg-to-webp/JpgToWebpTool")),
  "png-to-webp": dynamic(() => import("@/tools/image/png-to-webp/PngToWebpTool")),
  "image-to-pdf": dynamic(() => import("@/tools/image/image-to-pdf/ImageToPdfTool")),

  // PDF tools
  "merge-pdf": dynamic(() => import("@/tools/pdf/merge-pdf/MergePdfTool")),
  "split-pdf": dynamic(() => import("@/tools/pdf/split-pdf/SplitPdfTool")),
  "compress-pdf": dynamic(() => import("@/tools/pdf/compress-pdf/CompressPdfTool")),
  "pdf-to-jpg": dynamic(() => import("@/tools/pdf/pdf-to-jpg/PdfToJpgTool")),
  "jpg-to-pdf": dynamic(() => import("@/tools/pdf/jpg-to-pdf/JpgToPdfTool")),
  "rotate-pdf": dynamic(() => import("@/tools/pdf/rotate-pdf/RotatePdfTool")),
  "extract-pdf-pages": dynamic(() => import("@/tools/pdf/extract-pdf-pages/ExtractPdfPagesTool")),

  // Text tools
  "word-counter": dynamic(() => import("@/tools/text/word-counter/WordCounterTool")),
  "character-counter": dynamic(() => import("@/tools/text/character-counter/CharacterCounterTool")),
  "case-converter": dynamic(() => import("@/tools/text/case-converter/CaseConverterTool")),
  "text-formatter": dynamic(() => import("@/tools/text/text-formatter/TextFormatterTool")),
  "remove-duplicate-lines": dynamic(() => import("@/tools/text/remove-duplicate-lines/RemoveDuplicateLinesTool")),
  "lorem-ipsum-generator": dynamic(() => import("@/tools/text/lorem-ipsum-generator/LoremIpsumGeneratorTool")),

  // Developer tools
  "json-formatter": dynamic(() => import("@/tools/developer/json-formatter/JsonFormatterTool")),
  "json-validator": dynamic(() => import("@/tools/developer/json-validator/JsonValidatorTool")),
  "base64-encoder-decoder": dynamic(() => import("@/tools/developer/base64-encoder-decoder/Base64EncoderDecoderTool")),
  "url-encoder-decoder": dynamic(() => import("@/tools/developer/url-encoder-decoder/UrlEncoderDecoderTool")),
  "jwt-decoder": dynamic(() => import("@/tools/developer/jwt-decoder/JwtDecoderTool")),
  "uuid-generator": dynamic(() => import("@/tools/developer/uuid-generator/UuidGeneratorTool")),
  "regex-tester": dynamic(() => import("@/tools/developer/regex-tester/RegexTesterTool")),
  "hash-generator": dynamic(() => import("@/tools/developer/hash-generator/HashGeneratorTool")),

  // Calculator tools
  "percentage-calculator": dynamic(() => import("@/tools/calculator/percentage-calculator/PercentageCalculatorTool")),
  "age-calculator": dynamic(() => import("@/tools/calculator/age-calculator/AgeCalculatorTool")),
  "emi-calculator": dynamic(() => import("@/tools/calculator/emi-calculator/EmiCalculatorTool")),
  "discount-calculator": dynamic(() => import("@/tools/calculator/discount-calculator/DiscountCalculatorTool")),
  "unit-converter": dynamic(() => import("@/tools/calculator/unit-converter/UnitConverterTool")),

  // Generator tools
  "password-generator": dynamic(() => import("@/tools/generator/password-generator/PasswordGeneratorTool")),
  "random-number-generator": dynamic(() => import("@/tools/generator/random-number-generator/RandomNumberGeneratorTool")),
  "username-generator": dynamic(() => import("@/tools/generator/username-generator/UsernameGeneratorTool")),
  "slug-generator": dynamic(() => import("@/tools/generator/slug-generator/SlugGeneratorTool")),

  // Audio tools
  "mp3-cutter": dynamic(() => import("@/tools/audio/mp3-cutter/Mp3CutterTool")),
  "audio-trimmer": dynamic(() => import("@/tools/audio/audio-trimmer/AudioTrimmerTool")),
  "audio-merger": dynamic(() => import("@/tools/audio/audio-merger/AudioMergerTool")),
  "audio-format-converter": dynamic(() => import("@/tools/audio/audio-format-converter/AudioFormatConverterTool")),
  "audio-speed-changer": dynamic(() => import("@/tools/audio/audio-speed-changer/AudioSpeedChangerTool")),
  "volume-booster": dynamic(() => import("@/tools/audio/volume-booster/VolumeBoosterTool")),
  "audio-metadata-viewer": dynamic(() => import("@/tools/audio/audio-metadata-viewer/AudioMetadataViewerTool")),
  "audio-duration-calculator": dynamic(() => import("@/tools/audio/audio-duration-calculator/AudioDurationCalculatorTool")),
  "audio-waveform-viewer": dynamic(() => import("@/tools/audio/audio-waveform-viewer/AudioWaveformViewerTool")),
  "voice-recorder": dynamic(() => import("@/tools/audio/voice-recorder/VoiceRecorderTool")),

  // Video tools
  "video-compressor": dynamic(() => import("@/tools/video/video-compressor/VideoCompressorTool")),
  "video-trimmer": dynamic(() => import("@/tools/video/video-trimmer/VideoTrimmerTool")),
  "video-merger": dynamic(() => import("@/tools/video/video-merger/VideoMergerTool")),
  "video-to-gif": dynamic(() => import("@/tools/video/video-to-gif/VideoToGifTool")),
  "video-to-mp3": dynamic(() => import("@/tools/video/video-to-mp3/VideoToMp3Tool")),
  "video-speed-changer": dynamic(() => import("@/tools/video/video-speed-changer/VideoSpeedChangerTool")),
  "video-muter": dynamic(() => import("@/tools/video/video-muter/VideoMuterTool")),
  "video-metadata-viewer": dynamic(() => import("@/tools/video/video-metadata-viewer/VideoMetadataViewerTool")),
  "video-resolution-converter": dynamic(() => import("@/tools/video/video-resolution-converter/VideoResolutionConverterTool")),
  "video-frame-extractor": dynamic(() => import("@/tools/video/video-frame-extractor/VideoFrameExtractorTool")),

  // Security & Privacy tools
  "secure-password-generator": dynamic(() => import("@/tools/security/secure-password-generator/SecurePasswordGeneratorTool")),
  "password-strength-checker": dynamic(() => import("@/tools/security/password-strength-checker/PasswordStrengthCheckerTool")),
  "text-encryptor-decryptor": dynamic(() => import("@/tools/security/text-encryptor-decryptor/TextEncryptorDecryptorTool")),
  "sha256-hash-generator": dynamic(() => import("@/tools/security/sha256-hash-generator/Sha256HashGeneratorTool")),
  "file-checksum-calculator": dynamic(() => import("@/tools/security/file-checksum-calculator/FileChecksumCalculatorTool")),
  "secure-uuid-generator": dynamic(() => import("@/tools/security/secure-uuid-generator/SecureUuidGeneratorTool")),
  "random-token-generator": dynamic(() => import("@/tools/security/random-token-generator/RandomTokenGeneratorTool")),
  "secure-base64-encoder-decoder": dynamic(() => import("@/tools/security/secure-base64-encoder-decoder/SecureBase64EncoderDecoderTool")),
  "secure-url-encoder-decoder": dynamic(() => import("@/tools/security/secure-url-encoder-decoder/SecureUrlEncoderDecoderTool")),
  "text-to-hash-converter": dynamic(() => import("@/tools/security/text-to-hash-converter/TextToHashConverterTool")),

  // URL & Web tools
  "url-encoder": dynamic(() => import("@/tools/web/url-encoder/UrlEncoderTool")),
  "url-decoder": dynamic(() => import("@/tools/web/url-decoder/UrlDecoderTool")),
  "url-parser": dynamic(() => import("@/tools/web/url-parser/UrlParserTool")),
  "url-slug-generator": dynamic(() => import("@/tools/web/url-slug-generator/UrlSlugGeneratorTool")),
  "utm-link-builder": dynamic(() => import("@/tools/web/utm-link-builder/UtmLinkBuilderTool")),
  "meta-tag-generator": dynamic(() => import("@/tools/web/meta-tag-generator/MetaTagGeneratorTool")),
  "robots-txt-generator": dynamic(() => import("@/tools/web/robots-txt-generator/RobotsTxtGeneratorTool")),
  "sitemap-xml-generator": dynamic(() => import("@/tools/web/sitemap-xml-generator/SitemapXmlGeneratorTool")),
  "http-status-checker": dynamic(() => import("@/tools/web/http-status-checker/HttpStatusCheckerTool")),
  "query-string-parser": dynamic(() => import("@/tools/web/query-string-parser/QueryStringParserTool")),

  // SEO tools
  "keyword-density-checker": dynamic(() => import("@/tools/seo/keyword-density-checker/KeywordDensityCheckerTool")),
  "serp-snippet-preview": dynamic(() => import("@/tools/seo/serp-snippet-preview/SerpSnippetPreviewTool")),
  "meta-description-length-checker": dynamic(() => import("@/tools/seo/meta-description-length-checker/MetaDescriptionLengthCheckerTool")),
  "title-tag-length-checker": dynamic(() => import("@/tools/seo/title-tag-length-checker/TitleTagLengthCheckerTool")),
  "open-graph-preview": dynamic(() => import("@/tools/seo/open-graph-preview/OpenGraphPreviewTool")),
  "schema-markup-generator": dynamic(() => import("@/tools/seo/schema-markup-generator/SchemaMarkupGeneratorTool")),
  "xml-sitemap-validator": dynamic(() => import("@/tools/seo/xml-sitemap-validator/XmlSitemapValidatorTool")),
  "robots-txt-validator": dynamic(() => import("@/tools/seo/robots-txt-validator/RobotsTxtValidatorTool")),
  "heading-structure-analyzer": dynamic(() => import("@/tools/seo/heading-structure-analyzer/HeadingStructureAnalyzerTool")),
  "canonical-url-tag-generator": dynamic(() => import("@/tools/seo/canonical-url-tag-generator/CanonicalUrlTagGeneratorTool")),

  // Color & Design tools
  "color-picker": dynamic(() => import("@/tools/design/color-picker/ColorPickerTool")),
  "hex-to-rgb-converter": dynamic(() => import("@/tools/design/hex-to-rgb-converter/HexToRgbConverterTool")),
  "rgb-to-hex-converter": dynamic(() => import("@/tools/design/rgb-to-hex-converter/RgbToHexConverterTool")),
  "hsl-color-converter": dynamic(() => import("@/tools/design/hsl-color-converter/HslColorConverterTool")),
  "gradient-generator": dynamic(() => import("@/tools/design/gradient-generator/GradientGeneratorTool")),
  "color-palette-generator": dynamic(() => import("@/tools/design/color-palette-generator/ColorPaletteGeneratorTool")),
  "color-contrast-checker": dynamic(() => import("@/tools/design/color-contrast-checker/ColorContrastCheckerTool")),
  "css-box-shadow-generator": dynamic(() => import("@/tools/design/css-box-shadow-generator/CssBoxShadowGeneratorTool")),
  "css-border-radius-generator": dynamic(() => import("@/tools/design/css-border-radius-generator/CssBorderRadiusGeneratorTool")),
  "glassmorphism-css-generator": dynamic(() => import("@/tools/design/glassmorphism-css-generator/GlassmorphismCssGeneratorTool")),
  "css-gradient-text-generator": dynamic(() => import("@/tools/design/css-gradient-text-generator/CssGradientTextGeneratorTool")),
  "css-button-style-generator": dynamic(() => import("@/tools/design/css-button-style-generator/CssButtonStyleGeneratorTool")),

  // File & Data tools
  "json-formatter-and-validator": dynamic(() => import("@/tools/data/json-formatter-and-validator/JsonFormatterAndValidatorTool")),
  "json-to-csv-converter": dynamic(() => import("@/tools/data/json-to-csv-converter/JsonToCsvConverterTool")),
  "csv-to-json-converter": dynamic(() => import("@/tools/data/csv-to-json-converter/CsvToJsonConverterTool")),
  "xml-formatter-and-validator": dynamic(() => import("@/tools/data/xml-formatter-and-validator/XmlFormatterAndValidatorTool")),
  "yaml-to-json-converter": dynamic(() => import("@/tools/data/yaml-to-json-converter/YamlToJsonConverterTool")),
  "json-to-yaml-converter": dynamic(() => import("@/tools/data/json-to-yaml-converter/JsonToYamlConverterTool")),
  "markdown-to-html-converter": dynamic(() => import("@/tools/data/markdown-to-html-converter/MarkdownToHtmlConverterTool")),
  "html-to-markdown-converter": dynamic(() => import("@/tools/data/html-to-markdown-converter/HtmlToMarkdownConverterTool")),
  "zip-file-extractor": dynamic(() => import("@/tools/data/zip-file-extractor/ZipFileExtractorTool")),
  "file-size-converter": dynamic(() => import("@/tools/data/file-size-converter/FileSizeConverterTool")),
  "duplicate-line-remover": dynamic(() => import("@/tools/data/duplicate-line-remover/DuplicateLineRemoverTool")),
  "text-diff-checker": dynamic(() => import("@/tools/data/text-diff-checker/TextDiffCheckerTool")),

  // Date & Time tools
  "unix-timestamp-converter": dynamic(() => import("@/tools/datetime/unix-timestamp-converter/UnixTimestampConverterTool")),
  "timestamp-to-date-converter": dynamic(() => import("@/tools/datetime/timestamp-to-date-converter/TimestampToDateConverterTool")),
  "date-difference-calculator": dynamic(() => import("@/tools/datetime/date-difference-calculator/DateDifferenceCalculatorTool")),
  "exact-age-calculator": dynamic(() => import("@/tools/datetime/exact-age-calculator/ExactAgeCalculatorTool")),
  "time-zone-converter": dynamic(() => import("@/tools/datetime/time-zone-converter/TimeZoneConverterTool")),
  "countdown-generator": dynamic(() => import("@/tools/datetime/countdown-generator/CountdownGeneratorTool")),
  "working-days-calculator": dynamic(() => import("@/tools/datetime/working-days-calculator/WorkingDaysCalculatorTool")),
  "days-between-dates-calculator": dynamic(() => import("@/tools/datetime/days-between-dates-calculator/DaysBetweenDatesCalculatorTool")),
  "utc-to-local-time-converter": dynamic(() => import("@/tools/datetime/utc-to-local-time-converter/UtcToLocalTimeConverterTool")),
  "date-format-converter": dynamic(() => import("@/tools/datetime/date-format-converter/DateFormatConverterTool")),

  // Finance & Business tools
  "gst-calculator": dynamic(() => import("@/tools/finance/gst-calculator/GstCalculatorTool")),
  "business-discount-calculator": dynamic(() => import("@/tools/finance/business-discount-calculator/BusinessDiscountCalculatorTool")),
  "profit-margin-calculator": dynamic(() => import("@/tools/finance/profit-margin-calculator/ProfitMarginCalculatorTool")),
  "markup-calculator": dynamic(() => import("@/tools/finance/markup-calculator/MarkupCalculatorTool")),
  "compound-interest-calculator": dynamic(() => import("@/tools/finance/compound-interest-calculator/CompoundInterestCalculatorTool")),
  "simple-interest-calculator": dynamic(() => import("@/tools/finance/simple-interest-calculator/SimpleInterestCalculatorTool")),
  "loan-emi-calculator": dynamic(() => import("@/tools/finance/loan-emi-calculator/LoanEmiCalculatorTool")),
  "salary-calculator": dynamic(() => import("@/tools/finance/salary-calculator/SalaryCalculatorTool")),
  "invoice-generator": dynamic(() => import("@/tools/finance/invoice-generator/InvoiceGeneratorTool")),
  "break-even-calculator": dynamic(() => import("@/tools/finance/break-even-calculator/BreakEvenCalculatorTool")),
  "percentage-change-calculator": dynamic(() => import("@/tools/finance/percentage-change-calculator/PercentageChangeCalculatorTool")),
  "currency-converter": dynamic(() => import("@/tools/finance/currency-converter/CurrencyConverterTool")),

  // QR & Barcode tools
  "qr-code-generator": dynamic(() => import("@/tools/qr-barcode/qr-code-generator/QrCodeGeneratorTool")),
  "qr-code-scanner": dynamic(() => import("@/tools/qr-barcode/qr-code-scanner/QrCodeScannerTool")),
  "wifi-qr-generator": dynamic(() => import("@/tools/qr-barcode/wifi-qr-generator/WifiQrGeneratorTool")),
  "url-qr-generator": dynamic(() => import("@/tools/qr-barcode/url-qr-generator/UrlQrGeneratorTool")),
  "contact-card-qr-generator": dynamic(() => import("@/tools/qr-barcode/contact-card-qr-generator/ContactCardQrGeneratorTool")),
  "email-qr-generator": dynamic(() => import("@/tools/qr-barcode/email-qr-generator/EmailQrGeneratorTool")),
  "phone-number-qr-generator": dynamic(() => import("@/tools/qr-barcode/phone-number-qr-generator/PhoneNumberQrGeneratorTool")),
  "barcode-generator": dynamic(() => import("@/tools/qr-barcode/barcode-generator/BarcodeGeneratorTool")),
  "barcode-scanner": dynamic(() => import("@/tools/qr-barcode/barcode-scanner/BarcodeScannerTool")),
  "qr-code-image-downloader": dynamic(() => import("@/tools/qr-barcode/qr-code-image-downloader/QrCodeImageDownloaderTool")),

  // Font & Typography tools
  "font-pairing-preview": dynamic(() => import("@/tools/typography/font-pairing-preview/FontPairingPreviewTool")),
  "font-size-converter": dynamic(() => import("@/tools/typography/font-size-converter/FontSizeConverterTool")),
  "typography-scale-generator": dynamic(() => import("@/tools/typography/typography-scale-generator/TypographyScaleGeneratorTool")),
  "line-height-calculator": dynamic(() => import("@/tools/typography/line-height-calculator/LineHeightCalculatorTool")),
  "letter-spacing-preview": dynamic(() => import("@/tools/typography/letter-spacing-preview/LetterSpacingPreviewTool")),
  "css-font-generator": dynamic(() => import("@/tools/typography/css-font-generator/CssFontGeneratorTool")),
  "text-preview-playground": dynamic(() => import("@/tools/typography/text-preview-playground/TextPreviewPlaygroundTool")),
  "google-fonts-css-snippet-generator": dynamic(() => import("@/tools/typography/google-fonts-css-snippet-generator/GoogleFontsCssSnippetGeneratorTool")),

  // Network tools
  "ipv4-subnet-calculator": dynamic(() => import("@/tools/network/ipv4-subnet-calculator/Ipv4SubnetCalculatorTool")),
  "ipv4-address-converter": dynamic(() => import("@/tools/network/ipv4-address-converter/Ipv4AddressConverterTool")),
  "cidr-range-calculator": dynamic(() => import("@/tools/network/cidr-range-calculator/CidrRangeCalculatorTool")),
  "dns-record-lookup": dynamic(() => import("@/tools/network/dns-record-lookup/DnsRecordLookupTool")),
  "public-ip-information-lookup": dynamic(() => import("@/tools/network/public-ip-information-lookup/PublicIpInformationLookupTool")),
  "mac-address-format-validator": dynamic(() => import("@/tools/network/mac-address-format-validator/MacAddressFormatValidatorTool")),
  "network-address-calculator": dynamic(() => import("@/tools/network/network-address-calculator/NetworkAddressCalculatorTool")),
  "ip-address-format-validator": dynamic(() => import("@/tools/network/ip-address-format-validator/IpAddressFormatValidatorTool")),

  // Social Media tools
  "youtube-thumbnail-preview": dynamic(() => import("@/tools/social/youtube-thumbnail-preview/YoutubeThumbnailPreviewTool")),
  "social-image-dimension-guide": dynamic(() => import("@/tools/social/social-image-dimension-guide/SocialImageDimensionGuideTool")),
  "hashtag-organizer": dynamic(() => import("@/tools/social/hashtag-organizer/HashtagOrganizerTool")),
  "caption-formatter": dynamic(() => import("@/tools/social/caption-formatter/CaptionFormatterTool")),
  "open-graph-image-preview": dynamic(() => import("@/tools/social/open-graph-image-preview/OpenGraphImagePreviewTool")),
  "social-bio-formatter": dynamic(() => import("@/tools/social/social-bio-formatter/SocialBioFormatterTool")),
  "youtube-title-length-checker": dynamic(() => import("@/tools/social/youtube-title-length-checker/YoutubeTitleLengthCheckerTool")),
  "video-description-formatter": dynamic(() => import("@/tools/social/video-description-formatter/VideoDescriptionFormatterTool")),
  "social-media-character-counter": dynamic(() => import("@/tools/social/social-media-character-counter/SocialMediaCharacterCounterTool")),
  "utm-campaign-link-builder": dynamic(() => import("@/tools/social/utm-campaign-link-builder/UtmCampaignLinkBuilderTool")),

  // Education tools
  "academic-percentage-calculator": dynamic(() => import("@/tools/education/academic-percentage-calculator/AcademicPercentageCalculatorTool")),
  "marks-percentage-calculator": dynamic(() => import("@/tools/education/marks-percentage-calculator/MarksPercentageCalculatorTool")),
  "gpa-calculator": dynamic(() => import("@/tools/education/gpa-calculator/GpaCalculatorTool")),
  "cgpa-calculator": dynamic(() => import("@/tools/education/cgpa-calculator/CgpaCalculatorTool")),
  "cgpa-to-percentage-converter": dynamic(() => import("@/tools/education/cgpa-to-percentage-converter/CgpaToPercentageConverterTool")),
  "study-time-calculator": dynamic(() => import("@/tools/education/study-time-calculator/StudyTimeCalculatorTool")),
  "average-marks-calculator": dynamic(() => import("@/tools/education/average-marks-calculator/AverageMarksCalculatorTool")),
  "exam-countdown-calculator": dynamic(() => import("@/tools/education/exam-countdown-calculator/ExamCountdownCalculatorTool")),
  "grade-calculator": dynamic(() => import("@/tools/education/grade-calculator/GradeCalculatorTool")),
  "attendance-percentage-calculator": dynamic(() => import("@/tools/education/attendance-percentage-calculator/AttendancePercentageCalculatorTool")),

  // Accessibility tools
  "wcag-color-contrast-checker": dynamic(() => import("@/tools/accessibility/wcag-color-contrast-checker/WcagColorContrastCheckerTool")),
  "accessible-color-pair-preview": dynamic(() => import("@/tools/accessibility/accessible-color-pair-preview/AccessibleColorPairPreviewTool")),
  "html-heading-structure-checker": dynamic(() => import("@/tools/accessibility/html-heading-structure-checker/HtmlHeadingStructureCheckerTool")),
  "image-alt-text-checklist": dynamic(() => import("@/tools/accessibility/image-alt-text-checklist/ImageAltTextChecklistTool")),
  "aria-attribute-reference": dynamic(() => import("@/tools/accessibility/aria-attribute-reference/AriaAttributeReferenceTool")),
  "keyboard-accessibility-checklist": dynamic(() => import("@/tools/accessibility/keyboard-accessibility-checklist/KeyboardAccessibilityChecklistTool")),
  "accessible-form-checklist": dynamic(() => import("@/tools/accessibility/accessible-form-checklist/AccessibleFormChecklistTool")),
  "text-readability-calculator": dynamic(() => import("@/tools/accessibility/text-readability-calculator/TextReadabilityCalculatorTool")),

  // AI tools
  "ai-text-summarizer": dynamic(() => import("@/tools/ai/ai-text-summarizer/AiTextSummarizerTool")),
  "grammar-checker": dynamic(() => import("@/tools/ai/grammar-checker/GrammarCheckerTool")),
  "text-rewriter": dynamic(() => import("@/tools/ai/text-rewriter/TextRewriterTool")),
  "text-to-speech": dynamic(() => import("@/tools/ai/text-to-speech/TextToSpeechTool")),
  "speech-to-text": dynamic(() => import("@/tools/ai/speech-to-text/SpeechToTextTool")),
  "image-background-remover": dynamic(() => import("@/tools/ai/image-background-remover/ImageBackgroundRemoverTool")),
  "image-caption-generator": dynamic(() => import("@/tools/ai/image-caption-generator/ImageCaptionGeneratorTool")),
  "text-translator": dynamic(() => import("@/tools/ai/text-translator/TextTranslatorTool")),
  "keyword-extractor": dynamic(() => import("@/tools/ai/keyword-extractor/KeywordExtractorTool")),
  "writing-assistant": dynamic(() => import("@/tools/ai/writing-assistant/WritingAssistantTool")),
};

// ─── STATIC PARAMS ────────────────────────────────────────────────
export async function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

// ─── METADATA ─────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOL_MAP.get(slug);

  if (!tool) {
    return { title: "Tool Not Found" };
  }

  return {
    title: `${tool.name} Online – Free`,
    description: tool.longDescription,
    keywords: tool.tags,
    openGraph: {
      title: `${tool.name} Online – QuickTools`,
      description: tool.longDescription,
      type: "website",
    },
  };
}

// ─── PAGE ─────────────────────────────────────────────────────────
export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = TOOL_MAP.get(slug);

  if (!tool) {
    notFound();
  }

  const ToolComponent = TOOL_COMPONENTS[tool.slug];

  return (
    <ToolShell tool={tool}>
      {ToolComponent ? (
        <ToolComponent />
      ) : (
        <div className="text-center py-12 text-text-secondary">
          <p className="font-heading font-bold text-lg mb-2">Coming Soon</p>
          <p>This tool is under development.</p>
        </div>
      )}
    </ToolShell>
  );
}
