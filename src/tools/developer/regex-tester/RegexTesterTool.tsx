"use client";
import React, { useState, useEffect, useRef } from "react";

const MAX_PATTERN_LENGTH = 500;
const MAX_TEST_STRING_LENGTH = 50000;
const MAX_MATCHES = 500;
const EXECUTION_TIMEOUT_MS = 1000;

// Inline worker script source code to prevent main thread freezing during catastrophic backtracking (ReDoS)
const WORKER_SCRIPT = `
self.onmessage = function(e) {
  const { pattern, flags, testString, maxMatches } = e.data;
  try {
    const regex = new RegExp(pattern, flags);
    const results = [];
    let match;
    if (flags.includes('g')) {
      while ((match = regex.exec(testString)) !== null) {
        // Build array: [fullMatch, ...capturedGroups]
        const item = [match[0]];
        for (let i = 1; i < match.length; i++) {
          item.push(match[i]);
        }
        results.push(item);

        if (match[0].length === 0) {
          regex.lastIndex++;
        }
        if (results.length >= maxMatches) {
          break;
        }
      }
    } else {
      match = regex.exec(testString);
      if (match) {
        const item = [match[0]];
        for (let i = 1; i < match.length; i++) {
          item.push(match[i]);
        }
        results.push(item);
      }
    }
    self.postMessage({ success: true, results });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};
`;

export default function RegexTesterTool() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [matches, setMatches] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const activeWorkerRef = useRef<Worker | null>(null);
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Clean up any ongoing worker on effect re-run
    if (activeWorkerRef.current) {
      activeWorkerRef.current.terminate();
      activeWorkerRef.current = null;
    }
    if (activeTimerRef.current) {
      clearTimeout(activeTimerRef.current);
      activeTimerRef.current = null;
    }

    const debounceTimer = setTimeout(() => {
      if (cancelled) return;

      if (!pattern.trim()) {
        setMatches([]);
        setError(null);
        setIsEvaluating(false);
        return;
      }

      // Input bounds validation
      if (pattern.length > MAX_PATTERN_LENGTH) {
        setError(`Pattern length exceeds maximum allowed limit of ${MAX_PATTERN_LENGTH} characters.`);
        setMatches([]);
        setIsEvaluating(false);
        return;
      }

      if (testString.length > MAX_TEST_STRING_LENGTH) {
        setError(`Test string length exceeds maximum allowed limit of ${MAX_TEST_STRING_LENGTH} characters.`);
        setMatches([]);
        setIsEvaluating(false);
        return;
      }

      // Syntax pre-validation
      try {
        new RegExp(pattern, flags);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Invalid regular expression";
        setError(msg);
        setMatches([]);
        setIsEvaluating(false);
        return;
      }

      // If Web Workers are available (browser environment), run regex isolated in worker thread
      if (typeof window !== "undefined" && typeof Worker !== "undefined") {
        setIsEvaluating(true);
        setError(null);

        const blob = new Blob([WORKER_SCRIPT], { type: "application/javascript" });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        activeWorkerRef.current = worker;

        // Hard termination timeout against catastrophic backtracking
        activeTimerRef.current = setTimeout(() => {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          activeWorkerRef.current = null;
          activeTimerRef.current = null;
          setError(
            `Execution timed out after ${EXECUTION_TIMEOUT_MS}ms. The regular expression may be suffering from catastrophic backtracking (ReDoS).`
          );
          setMatches([]);
          setIsEvaluating(false);
        }, EXECUTION_TIMEOUT_MS);

        worker.onmessage = (e) => {
          if (activeTimerRef.current) {
            clearTimeout(activeTimerRef.current);
            activeTimerRef.current = null;
          }
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          activeWorkerRef.current = null;

          const { success, results, error: workerErr } = e.data;
          if (success) {
            setMatches(results || []);
            setError(null);
          } else {
            setError(workerErr || "Regex evaluation failed.");
            setMatches([]);
          }
          setIsEvaluating(false);
        };

        worker.onerror = (e) => {
          if (activeTimerRef.current) {
            clearTimeout(activeTimerRef.current);
            activeTimerRef.current = null;
          }
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          activeWorkerRef.current = null;

          setError(`Worker error: ${e.message}`);
          setMatches([]);
          setIsEvaluating(false);
        };

        worker.postMessage({
          pattern,
          flags,
          testString,
          maxMatches: MAX_MATCHES,
        });
      } else {
        // Non-worker fallback (e.g. node / ssr tests)
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
          setMatches(results);
          setError(null);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "Regex evaluation error";
          setError(msg);
          setMatches([]);
        }
      }
    }, 50);

    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
      if (activeWorkerRef.current) {
        activeWorkerRef.current.terminate();
        activeWorkerRef.current = null;
      }
      if (activeTimerRef.current) {
        clearTimeout(activeTimerRef.current);
        activeTimerRef.current = null;
      }
    };
  }, [pattern, flags, testString]);

  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) setFlags(flags.replace(flag, ""));
    else setFlags(flags + flag);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="font-heading font-semibold text-sm uppercase tracking-wide block mb-2">
            Regular Expression
          </label>
          <div className="flex items-center">
            <span className="text-xl text-text-secondary px-2">/</span>
            <input
              type="text"
              className="neo-input flex-1 font-mono p-3"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="^([a-z0-9]+)$"
            />
            <span className="text-xl text-text-secondary px-2">/</span>
            <input
              type="text"
              className="neo-input w-20 font-mono p-3 text-center bg-surface"
              value={flags}
              readOnly
            />
          </div>
        </div>
        <div className="flex items-end gap-2 pb-1">
          <label className="flex items-center gap-1 cursor-pointer bg-surface border-2 border-border px-3 py-2 rounded font-semibold">
            <input type="checkbox" checked={flags.includes("g")} onChange={() => toggleFlag("g")} /> g
          </label>
          <label className="flex items-center gap-1 cursor-pointer bg-surface border-2 border-border px-3 py-2 rounded font-semibold">
            <input type="checkbox" checked={flags.includes("i")} onChange={() => toggleFlag("i")} /> i
          </label>
          <label className="flex items-center gap-1 cursor-pointer bg-surface border-2 border-border px-3 py-2 rounded font-semibold">
            <input type="checkbox" checked={flags.includes("m")} onChange={() => toggleFlag("m")} /> m
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 text-red-700 font-mono text-sm">
          {error}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="font-heading font-semibold text-sm uppercase tracking-wide">
            Test String
          </label>
          {isEvaluating && (
            <span className="text-xs font-mono font-semibold text-accent animate-pulse">
              Evaluating in sandbox worker...
            </span>
          )}
        </div>
        <textarea
          className="neo-input w-full min-h-[150px] p-4 font-mono text-sm"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test your regex against..."
        />
      </div>

      <div className="neo-card p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">
          Matches {matches.length > 0 && <span className="text-accent">({matches.length})</span>}
        </h3>

        {matches.length === 0 ? (
          <p className="text-text-secondary italic">No matches found</p>
        ) : (
          <div className="space-y-4">
            {matches.map((m, i) => (
              <div key={i} className="border-2 border-border rounded p-4 bg-surface">
                <div className="font-semibold mb-2">Match {i + 1}</div>
                <div className="font-mono text-sm bg-bg p-2 rounded border border-border break-all">{m[0]}</div>
                {m.length > 1 && (
                  <div className="mt-3">
                    <div className="text-xs uppercase font-semibold text-text-secondary mb-1">Groups</div>
                    <ul className="space-y-1">
                      {m.slice(1).map((group, j) => (
                        <li key={j} className="flex gap-2">
                          <span className="text-text-secondary font-mono w-6">{j + 1}:</span>
                          <span className="font-mono text-sm break-all">
                            {group === undefined ? <em className="text-text-secondary opacity-50">undefined</em> : group}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
