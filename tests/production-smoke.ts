import http from "node:http";

interface TestResult {
  id: string;
  name: string;
  url: string;
  expectedStatus: number | number[];
  actualStatus?: number;
  pass: boolean;
  notes?: string;
}

interface CustomRequestOptions extends http.RequestOptions {
  body?: string;
}

function fetchStatus(path: string, options: CustomRequestOptions = {}): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: "localhost",
        port: 3000,
        path,
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body,
          });
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runProductionSmokeTests() {
  console.log("=== STARTING PRODUCTION SMOKE TEST ON http://localhost:3000 ===\n");

  const results: TestResult[] = [];

  const coreRoutes = [
    { id: "CORE-01", path: "/", name: "Homepage" },
    { id: "CORE-02", path: "/about", name: "About Page" },
    { id: "CORE-02B", path: "/privacy", name: "Privacy Page" },
    { id: "CORE-02C", path: "/terms", name: "Terms Page" },
    { id: "CORE-03", path: "/categories", name: "Categories Hub" },
    { id: "CORE-04", path: "/popular", name: "Popular Tools" },
    { id: "CORE-05", path: "/recent", name: "Recent Tools" },
    { id: "CORE-06", path: "/tools", name: "All Tools Directory" },
    { id: "CORE-07", path: "/robots.txt", name: "Robots.txt" },
    { id: "CORE-08", path: "/sitemap.xml", name: "Sitemap XML" },
    { id: "CORE-09", path: "/non-existent-page-404", name: "404 Not Found Page", expectedStatus: 404 },
  ];

  for (const r of coreRoutes) {
    const expected = r.expectedStatus || 200;
    try {
      const res = await fetchStatus(r.path);
      const pass = res.statusCode === expected;
      results.push({
        id: r.id,
        name: r.name,
        url: r.path,
        expectedStatus: expected,
        actualStatus: res.statusCode,
        pass,
        notes: pass ? "OK" : `Unexpected status: ${res.statusCode}`,
      });
    } catch (err: unknown) {
      results.push({
        id: r.id,
        name: r.name,
        url: r.path,
        expectedStatus: expected,
        pass: false,
        notes: (err as Error).message,
      });
    }
  }

  // 22 Category routes
  const categories = [
    "image", "pdf", "text", "developer", "calculator", "generator", "audio", "video",
    "security", "web", "seo", "design", "data", "datetime", "finance", "qr-barcode",
    "typography", "network", "social", "education", "accessibility", "ai"
  ];

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const path = `/categories/${cat}`;
    const id = `CAT-${String(i + 1).padStart(2, "0")}`;
    try {
      const res = await fetchStatus(path);
      const pass = res.statusCode === 200;
      results.push({
        id,
        name: `Category: ${cat}`,
        url: path,
        expectedStatus: 200,
        actualStatus: res.statusCode,
        pass,
        notes: pass ? "OK" : `Status ${res.statusCode}`,
      });
    } catch (err: unknown) {
      results.push({
        id,
        name: `Category: ${cat}`,
        url: path,
        expectedStatus: 200,
        pass: false,
        notes: (err as Error).message,
      });
    }
  }

  // Representative tools from each of the 22 categories
  const sampleTools = [
    { cat: "image", slug: "image-compressor" },
    { cat: "pdf", slug: "merge-pdf" },
    { cat: "text", slug: "word-counter" },
    { cat: "developer", slug: "regex-tester" },
    { cat: "calculator", slug: "percentage-calculator" },
    { cat: "generator", slug: "qr-code-generator" },
    { cat: "audio", slug: "audio-trimmer" },
    { cat: "video", slug: "video-compressor" },
    { cat: "security", slug: "password-generator" },
    { cat: "web", slug: "http-status-checker" },
    { cat: "seo", slug: "keyword-density-checker" },
    { cat: "design", slug: "color-picker" },
    { cat: "data", slug: "markdown-to-html-converter" },
    { cat: "datetime", slug: "unix-timestamp-converter" },
    { cat: "finance", slug: "gst-calculator" },
    { cat: "qr-barcode", slug: "wifi-qr-generator" },
    { cat: "typography", slug: "font-pairing-preview" },
    { cat: "network", slug: "ipv4-subnet-calculator" },
    { cat: "social", slug: "youtube-thumbnail-preview" },
    { cat: "education", slug: "gpa-calculator" },
    { cat: "accessibility", slug: "wcag-color-contrast-checker" },
    { cat: "ai", slug: "ai-text-summarizer" },
  ];

  for (let i = 0; i < sampleTools.length; i++) {
    const t = sampleTools[i];
    const path = `/tools/${t.slug}`;
    const id = `TOOL-${String(i + 1).padStart(2, "0")}`;
    try {
      const res = await fetchStatus(path);
      const pass = res.statusCode === 200;
      results.push({
        id,
        name: `Tool (${t.cat}): ${t.slug}`,
        url: path,
        expectedStatus: 200,
        actualStatus: res.statusCode,
        pass,
        notes: pass ? "OK" : `Status ${res.statusCode}`,
      });
    } catch (err: unknown) {
      results.push({
        id,
        name: `Tool (${t.cat}): ${t.slug}`,
        url: path,
        expectedStatus: 200,
        pass: false,
        notes: (err as Error).message,
      });
    }
  }

  // API Route verification
  // 1. SSRF check-status
  try {
    const getRes = await fetchStatus("/api/check-status", { method: "GET" });
    results.push({
      id: "API-01",
      name: "Check-Status GET Method Restriction",
      url: "/api/check-status",
      expectedStatus: 405,
      actualStatus: getRes.statusCode,
      pass: getRes.statusCode === 405,
      notes: getRes.statusCode === 405 ? "Method not allowed enforced" : `Got ${getRes.statusCode}`,
    });

    const ssrfRes = await fetchStatus("/api/check-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://127.0.0.1:80" }),
    });
    const ssrfBlocked = ssrfRes.statusCode === 403 && ssrfRes.body.includes("SSRF protection");
    results.push({
      id: "API-02",
      name: "Check-Status SSRF 127.0.0.1 Blocking",
      url: "/api/check-status",
      expectedStatus: 403,
      actualStatus: ssrfRes.statusCode,
      pass: ssrfBlocked,
      notes: ssrfBlocked ? "Blocked with 403 Forbidden by SSRF protection" : ssrfRes.body,
    });

    const metaRes = await fetchStatus("/api/check-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://169.254.169.254/latest/meta-data/" }),
    });
    const metaBlocked = metaRes.statusCode === 403 && metaRes.body.includes("SSRF protection");
    results.push({
      id: "API-03",
      name: "Check-Status Cloud Metadata Blocking",
      url: "/api/check-status",
      expectedStatus: 403,
      actualStatus: metaRes.statusCode,
      pass: metaBlocked,
      notes: metaBlocked ? "Blocked with 403 Forbidden by SSRF protection" : metaRes.body,
    });

    const portRes = await fetchStatus("/api/check-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "http://example.com:22" }),
    });
    const portBlocked = portRes.statusCode === 403;
    results.push({
      id: "API-04",
      name: "Check-Status Disallowed Port Blocking (port 22)",
      url: "/api/check-status",
      expectedStatus: 403,
      actualStatus: portRes.statusCode,
      pass: portBlocked,
      notes: portBlocked ? "Blocked non-standard port with 403" : portRes.body,
    });
  } catch (err: unknown) {
    results.push({
      id: "API-01-04",
      name: "Check-Status API Suite",
      url: "/api/check-status",
      expectedStatus: 200,
      pass: false,
      notes: (err as Error).message,
    });
  }

  // 2. AI Text Endpoint
  try {
    const emptyRes = await fetchStatus("/api/ai/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "", action: "summarize" }),
    });
    const emptyPass = emptyRes.statusCode === 400;
    results.push({
      id: "API-05",
      name: "AI Text Rejects Empty Prompt",
      url: "/api/ai/text",
      expectedStatus: 400,
      actualStatus: emptyRes.statusCode,
      pass: emptyPass,
      notes: emptyPass ? "Rejected 400" : `Got ${emptyRes.statusCode}`,
    });

    const invalidActionRes = await fetchStatus("/api/ai/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "hello world", action: "malicious_unauthorized_action" }),
    });
    const invalidActionPass = invalidActionRes.statusCode === 400;
    results.push({
      id: "API-06",
      name: "AI Text Rejects Invalid Action",
      url: "/api/ai/text",
      expectedStatus: 400,
      actualStatus: invalidActionRes.statusCode,
      pass: invalidActionPass,
      notes: invalidActionPass ? "Rejected 400" : `Got ${invalidActionRes.statusCode}`,
    });

    const oversizedRes = await fetchStatus("/api/ai/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "A".repeat(15000), action: "summarize" }),
    });
    const oversizedPass = oversizedRes.statusCode === 413;
    results.push({
      id: "API-07",
      name: "AI Text Rejects Oversized Input (>12k chars)",
      url: "/api/ai/text",
      expectedStatus: 413,
      actualStatus: oversizedRes.statusCode,
      pass: oversizedPass,
      notes: oversizedPass ? "Rejected 413 Payload Too Large" : `Got ${oversizedRes.statusCode}`,
    });
  } catch (err: unknown) {
    results.push({
      id: "API-05-07",
      name: "AI Text API Suite",
      url: "/api/ai/text",
      expectedStatus: 200,
      pass: false,
      notes: (err as Error).message,
    });
  }

  // 3. AI Vision Endpoint
  try {
    const visionNoImgRes = await fetchStatus("/api/ai/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Describe" }),
    });
    const visionPass = visionNoImgRes.statusCode === 400;
    results.push({
      id: "API-08",
      name: "AI Vision Rejects Missing Image",
      url: "/api/ai/vision",
      expectedStatus: 400,
      actualStatus: visionNoImgRes.statusCode,
      pass: visionPass,
      notes: visionPass ? "Rejected 400" : `Got ${visionNoImgRes.statusCode}`,
    });

    const visionBadMimeRes = await fetchStatus("/api/ai/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Describe", image: "data:application/pdf;base64,JVBERi0xLjQK" }),
    });
    const badMimePass = visionBadMimeRes.statusCode === 400;
    results.push({
      id: "API-09",
      name: "AI Vision Rejects Unsupported MIME Type",
      url: "/api/ai/vision",
      expectedStatus: 400,
      actualStatus: visionBadMimeRes.statusCode,
      pass: badMimePass,
      notes: badMimePass ? "Rejected 400 Bad MIME" : `Got ${visionBadMimeRes.statusCode}`,
    });
  } catch (err: unknown) {
    results.push({
      id: "API-08-09",
      name: "AI Vision API Suite",
      url: "/api/ai/vision",
      expectedStatus: 200,
      pass: false,
      notes: (err as Error).message,
    });
  }

  // 4. AI Remove-BG Endpoint
  try {
    const bgJsonRes = await fetchStatus("/api/ai/remove-bg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: "data" }),
    });
    const bgPass = bgJsonRes.statusCode === 400;
    results.push({
      id: "API-10",
      name: "AI Remove-BG Rejects Non-Multipart Request",
      url: "/api/ai/remove-bg",
      expectedStatus: 400,
      actualStatus: bgJsonRes.statusCode,
      pass: bgPass,
      notes: bgPass ? "Rejected 400" : `Got ${bgJsonRes.statusCode}`,
    });
  } catch (err: unknown) {
    results.push({
      id: "API-10",
      name: "AI Remove-BG API Suite",
      url: "/api/ai/remove-bg",
      expectedStatus: 200,
      pass: false,
      notes: (err as Error).message,
    });
  }

  // Summary
  let passedCount = 0;
  let failedCount = 0;

  console.log("ID       | Result | Expected | Actual | Path / Test Name");
  console.log("---------+--------+----------+--------+--------------------------------------------------");
  for (const r of results) {
    if (r.pass) passedCount++;
    else failedCount++;
    const resStr = r.pass ? "PASS  " : "FAIL  ";
    const expStr = Array.isArray(r.expectedStatus) ? r.expectedStatus.join("/") : String(r.expectedStatus);
    console.log(`${r.id.padEnd(8)} | ${resStr} | ${expStr.padEnd(8)} | ${String(r.actualStatus || "ERR").padEnd(6)} | ${r.name}`);
  }

  console.log("\n==================================================");
  console.log(`TOTAL PRODUCTION SMOKE TESTS: ${results.length}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log("==================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runProductionSmokeTests().catch((e) => {
  console.error("FATAL ERROR in smoke tests:", e);
  process.exit(1);
});
