/**
 * Detects if the current environment is Node.js
 */
export const isNode =
  typeof process !== "undefined" &&
  process.versions !== null &&
  process.versions.node !== null &&
  !("Bun" in globalThis); // exclude Bun if needed

/**
 * Detects if the current environment is a Browser
 */
export const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

/**
 * Detects if the current environment is Bun
 */
export const isBun =
  typeof Bun !== "undefined" && typeof Bun.version !== "undefined";
