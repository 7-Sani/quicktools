import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Regex Evaluation & ReDoS Safety Bounds", () => {
  const MAX_PATTERN_LENGTH = 500;
  const MAX_TEST_STRING_LENGTH = 50000;
  const MAX_MATCHES = 500;

  function evaluateRegexSafe(
    pattern: string,
    flags: string,
    testString: string
  ): { success: boolean; matches?: string[][]; error?: string } {
    if (pattern.length > MAX_PATTERN_LENGTH) {
      return { success: false, error: `Pattern exceeds ${MAX_PATTERN_LENGTH} characters.` };
    }
    if (testString.length > MAX_TEST_STRING_LENGTH) {
      return { success: false, error: `Test string exceeds ${MAX_TEST_STRING_LENGTH} characters.` };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const results: string[][] = [];
      let match: RegExpExecArray | null;

      if (flags.includes("g")) {
        while ((match = regex.exec(testString)) !== null) {
          results.push([match[0], ...match.slice(1)]);
          if (match[0].length === 0) regex.lastIndex++;
          if (results.length >= MAX_MATCHES) break;
        }
      } else {
        match = regex.exec(testString);
        if (match) results.push([match[0], ...match.slice(1)]);
      }
      return { success: true, matches: results };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Regex error";
      return { success: false, error: msg };
    }
  }

  it("evaluates valid patterns and extracts matches with groups", () => {
    const res = evaluateRegexSafe("(\\d{4})-(\\d{2})-(\\d{2})", "g", "Date: 2026-10-23 and 2025-01-01");
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.matches?.length, 2);
    assert.strictEqual(res.matches?.[0][0], "2026-10-23");
    assert.strictEqual(res.matches?.[0][1], "2026");
    assert.strictEqual(res.matches?.[0][2], "10");
    assert.strictEqual(res.matches?.[0][3], "23");
  });

  it("handles case-insensitive and multiline flags properly", () => {
    const res = evaluateRegexSafe("^quicktools", "im", "QUICKTOOLS is fast");
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.matches?.length, 1);
    assert.strictEqual(res.matches?.[0][0], "QUICKTOOLS");
  });

  it("rejects oversized regex patterns exceeding 500 characters", () => {
    const hugePattern = "a".repeat(501);
    const res = evaluateRegexSafe(hugePattern, "g", "test");
    assert.strictEqual(res.success, false);
    assert.ok(res.error?.includes("Pattern exceeds 500 characters"));
  });

  it("rejects oversized test strings exceeding 50,000 characters", () => {
    const hugeString = "x".repeat(50001);
    const res = evaluateRegexSafe("test", "g", hugeString);
    assert.strictEqual(res.success, false);
    assert.ok(res.error?.includes("Test string exceeds 50000 characters"));
  });

  it("safely enforces maximum match bounds to avoid memory exhaustion", () => {
    // Pattern matches every character in a 2000 character string
    const string = "a".repeat(2000);
    const res = evaluateRegexSafe("a", "g", string);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.matches?.length, MAX_MATCHES);
  });
});
