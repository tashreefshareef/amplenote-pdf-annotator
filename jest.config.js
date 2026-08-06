/**
 * Jest runs against the ESM sources in src/ directly — no build step, no transform.
 * That works because src/ is plain modern JS and package.json sets "type": "module";
 * the `--experimental-vm-modules` flag in the `test` script is what enables it.
 *
 * jsdom is the default environment because the embed-side code (Phase 1 onward)
 * touches the DOM. Pure action/logic tests are unaffected by it.
 */
export default {
  testEnvironment: "jsdom",
  testMatch: ["**/test/**/*.test.js"],
  // spike/ holds throwaway research scripts, not tests.
  testPathIgnorePatterns: ["/node_modules/", "/spike/", "/dist/"],
  collectCoverageFrom: ["src/**/*.js"],
  verbose: true,
};
