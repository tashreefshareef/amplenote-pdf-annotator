/**
 * Source-level hazards that break a module at PARSE time, checked by reading the file as
 * text rather than importing it.
 *
 * That distinction is the whole point of this file living apart from the suites that
 * exercise these modules: once html.js cannot parse, every test file that imports it
 * fails to run, so an assertion sitting inside one of those files never executes in the
 * exact situation it was written for. Reading the source keeps the check alive when the
 * module itself is broken, and turns "Missing semicolon (373:12)" - hundreds of lines from
 * the real typo - into a sentence naming the actual problem.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * .href, not the URL object: Jest's global URL is not the class node:url identity-checks
 * against, so passing the object throws "Received an instance of URL" about the URL it
 * was just handed. The string overload sidesteps the check.
 */
const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url).href), "utf8");

describe("template-literal hazards in src/embed/styles.js", () => {
  /**
   * The same pattern the build's minify-embed-stylesheet plugin uses to find the
   * stylesheet. Asserted from both sides on purpose: here it fails as a named test, and in
   * esbuild.js it fails the build - which matters because a silent non-match there means
   * the stylesheet ships unminified and the note creeps back toward its 100k cap with
   * nothing pointing at the cause.
   */
  const STYLES_LITERAL = /export const STYLES = `([\s\S]*?)\n`;\s*$/;

  // Scenario: the stylesheet is a template literal, so a single backtick anywhere inside
  // it - most easily in a CSS comment quoting a property name, which is exactly how
  // comments elsewhere in this codebase are written - ends the string early and stops the
  // module parsing. Done twice in one session before this test existed.
  test("the STYLES stylesheet contains no backtick", () => {
    const styles = read("../src/embed/styles.js").match(STYLES_LITERAL);
    // If this fails, STYLES was renamed or reshaped - fix the pattern rather than
    // deleting the test, or the guard silently stops guarding.
    expect(styles).not.toBeNull();
    expect(styles[1]).not.toContain("`");
  });

  // The build extracts the stylesheet by pattern and hands the captured text to esbuild's
  // CSS minifier, so an interpolation would arrive as the literal characters "${theme}" in
  // the middle of a rule rather than as a value. Nothing needs one today; this is here so
  // that adding one is a failing test rather than a stylesheet that silently stops parsing
  // in the browser.
  test("the STYLES stylesheet interpolates nothing", () => {
    const styles = read("../src/embed/styles.js").match(STYLES_LITERAL);
    expect(styles).not.toBeNull();
    expect(styles[1]).not.toContain("${");
  });

  // The file's other parse-time hazard, a literal closing script tag inside injected
  // data, is NOT checked here: it is already covered by embed-html.test.js's "escapes <
  // in injected JSON" test, which exercises the real escaping path. A source-text scan
  // for it flags the file header's own prose about the hazard, which is a false positive
  // and would make this guard something to argue with rather than trust.
});
