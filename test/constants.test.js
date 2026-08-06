/**
 * Tests for the CORS proxy helper and pinned CDN versions.
 *
 * Why these matter: attachment bytes are unreadable without the proxy — a direct fetch
 * of the presigned S3 URL fails from every context. A malformed proxy URL therefore
 * breaks the viewer completely, with a generic "Failed to fetch" as the only symptom.
 * The version pins are asserted because PDF.js 4.x ships ESM that the embed's plain
 * <script> bootstrap cannot load; an innocent-looking bump would break rendering.
 */
import { proxiedURL, CORS_PROXY, CDN } from "../src/constants.js";

describe("CORS proxy URL", () => {
  // Scenario: the attachment URL is a presigned S3 link full of query parameters
  // (X-Amz-Signature etc). It must be encoded into a single `apiurl` parameter, not
  // concatenated — otherwise its & separators split into sibling params and the
  // signature is lost, which S3 rejects.
  test("encodes a presigned S3 URL into a single apiurl parameter", () => {
    const s3 =
      "https://ample-attachments.s3.us-west-2.amazonaws.com/note/file.pdf" +
      "?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&X-Amz-Signature=abc123";

    const result = new URL(proxiedURL(s3));

    expect(result.origin + result.pathname).toBe(CORS_PROXY);
    // Round-trips exactly, signature intact.
    expect(result.searchParams.get("apiurl")).toBe(s3);
    // Exactly one parameter — the S3 params must not have leaked out.
    expect([...result.searchParams.keys()]).toEqual(["apiurl"]);
  });

  // Scenario: the signature contains characters that must survive encoding.
  test("preserves characters that would otherwise break the query string", () => {
    const tricky = "https://example.test/f.pdf?sig=a+b/c=d&x=1#frag";
    expect(new URL(proxiedURL(tricky)).searchParams.get("apiurl")).toBe(tricky);
  });
});

describe("pinned CDN versions", () => {
  // Scenario: PDF.js must stay on the 3.x UMD build. 4.x is .mjs-only and will not
  // load via a plain <script> tag in the embed.
  test("PDF.js is pinned to the verified 3.x UMD build, not an .mjs module", () => {
    expect(CDN.pdfJs).toContain("/3.11.174/");
    expect(CDN.pdfJs.endsWith(".js")).toBe(true);
    expect(CDN.pdfJs.endsWith(".mjs")).toBe(false);
  });

  // Scenario: the worker must match the library version exactly. A mismatch throws
  // a version error at document-load time.
  test("worker version matches the library version", () => {
    const version = (url) => url.match(/\/pdf\.js\/([^/]+)\//)[1];
    expect(version(CDN.pdfJsWorker)).toBe(version(CDN.pdfJs));
    expect(CDN.pdfJsWorker).toContain("pdf.worker");
  });

  // Scenario: every library is loaded over https from the CDN confirmed to pass the
  // embed's CSP.
  test("all CDN URLs are https on the verified host", () => {
    for (const url of Object.values(CDN)) {
      expect(url.startsWith("https://cdnjs.cloudflare.com/")).toBe(true);
    }
  });
});
