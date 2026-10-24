import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSafeUrl, parseMarkdownToHtml } from "../src/tools/data/markdown-to-html-converter/MarkdownToHtmlConverterTool";

describe("Markdown XSS Prevention & Sanitization", () => {
  it("permits safe HTTP, HTTPS, mailto, and fragment URLs", () => {
    assert.strictEqual(isSafeUrl("https://quicktools.app"), true);
    assert.strictEqual(isSafeUrl("http://example.com/path?arg=1"), true);
    assert.strictEqual(isSafeUrl("mailto:support@example.com"), true);
    assert.strictEqual(isSafeUrl("#heading-1"), true);
    assert.strictEqual(isSafeUrl("/relative/path"), true);
  });

  it("blocks dangerous schemes (javascript:, data:, vbscript:)", () => {
    assert.strictEqual(isSafeUrl("javascript:alert(1)"), false);
    assert.strictEqual(isSafeUrl("JAVASCRIPT:alert(document.cookie)"), false);
    assert.strictEqual(isSafeUrl("data:text/html,<script>alert(1)</script>"), false);
    assert.strictEqual(isSafeUrl("vbscript:msgbox('hello')"), false);
    assert.strictEqual(isSafeUrl("file:///etc/passwd"), false);
    assert.strictEqual(isSafeUrl("/#javascript:alert(1)"), false);
    assert.strictEqual(isSafeUrl("https://example.com\" onmouseover=\"alert(1)"), false);
  });

  it("prevents javascript: links from rendering anchor tags", () => {
    const input = "[Malicious Link](javascript:alert(1))";
    const result = parseMarkdownToHtml(input, false);
    assert.strictEqual(result.safePreview.includes('href="javascript:'), false);
    assert.strictEqual(result.safePreview.includes("<a "), false);
    assert.strictEqual(result.safePreview.includes("Malicious Link"), true);
  });

  it("neutralizes attribute breakout attempts via double quotes in href", () => {
    const input = '[Injected Link](https://example.com" onmouseover="alert(1)" x=")';
    const result = parseMarkdownToHtml(input, false);
    assert.strictEqual(result.safePreview.includes("onmouseover"), false);
    assert.strictEqual(result.safePreview.includes("<a "), false);
    assert.strictEqual(result.safePreview.includes("Injected Link"), true);
  });

  it("escapes direct HTML script tags in markdown input", () => {
    const input = "Normal text <script>alert('xss')</script> more text";
    const result = parseMarkdownToHtml(input, false);
    assert.strictEqual(result.safePreview.includes("<script>"), false);
    assert.strictEqual(result.safePreview.includes("&lt;script&gt;"), true);
  });

  it("escapes img onerror XSS payloads in markdown input", () => {
    const input = '<img src=x onerror="alert(1)">';
    const result = parseMarkdownToHtml(input, false);
    assert.strictEqual(result.safePreview.includes("<img"), false);
    assert.strictEqual(result.safePreview.includes("&lt;img"), true);
  });

  it("preserves legitimate markdown formatting", () => {
    const input = `
# Title
This is **bold** and *italic*.

- Item 1
- Item 2

[Valid Link](https://example.com)
`;
    const result = parseMarkdownToHtml(input, false);
    assert.strictEqual(result.safePreview.includes("<h1>Title</h1>"), true);
    assert.strictEqual(result.safePreview.includes("<strong>bold</strong>"), true);
    assert.strictEqual(result.safePreview.includes("<em>italic</em>"), true);
    assert.strictEqual(result.safePreview.includes("<li>Item 1</li>"), true);
    assert.strictEqual(result.safePreview.includes('href="https://example.com"'), true);
  });
});
