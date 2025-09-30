import { isBrowser, isNode } from "../utils/env.js";
import { parseQrFromBrowser } from "./browserQrImageParser.js";
import { parseQrFromNode } from "./nodeQrImageParser.js";

export type AnyBlob = globalThis.Blob;

/**
 * Reads and decodes a QRIS string from various input types,
 * with automatic environment detection (Node.js or Browser).
 *
 * ## Node.js behavior
 * - Accepts `string` (file path)
 * - If the path ends with `.txt`, reads and returns plain text
 * - If the path points to an image, decodes the QR code inside
 *
 * ## Browser behavior
 * - Accepts `File`, `Blob`, `HTMLImageElement`, or `HTMLCanvasElement`
 * - Uses canvas to extract image data and decode the QR code
 *
 * @param input - Input source, depending on the environment:
 * - Node.js: `string` (path to `.txt` or image file), or `Blob`
 * - Browser `File | Blob | HTMLImageElement | HTMLCanvasElement`
 *
 * @returns A Promise that resolves to the decoded QR string (QRIS payload).
 *
 * @throws Error if:
 * - The environment doesn’t match the input type
 * - No QR code is found in the image
 * - The file cannot be read or the input is invalid
 *
 * @example
 * ```ts
 * // Node.js
 * const result = await readFileAsQris("./qris.png");
 *
 * // Browser (from <input type="file">)
 * const file = document.querySelector("input[type=file]").files[0];
 * const result = await readFileAsQris(file);
 *
 * // Browser (from <canvas>)
 * const canvas = document.querySelector("canvas");
 * const result = await readFileAsQris(canvas);
 * ```
 */
export async function readFileAsQris(
  input: string | File | AnyBlob | HTMLImageElement | HTMLCanvasElement
): Promise<string> {
  if (isNode && (typeof input === "string" || input instanceof Blob)) {
    return parseQrFromNode(input);
  } else if (
    isBrowser &&
    (input instanceof Blob ||
      input instanceof HTMLImageElement ||
      input instanceof HTMLCanvasElement)
  ) {
    return parseQrFromBrowser(input);
  } else {
    throw new Error("Unsupported input type for the current environment.");
  }
}
