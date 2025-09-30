import fs from "fs/promises";
import { Blob } from "buffer";
import Jimp from "jimp";
import jsQR from "jsqr";
import { AnyBlob } from "./qrImageParser";

/**
 * Parses and decodes a QR code from Node.js-compatible inputs.
 *
 * Supported inputs:
 * - File path (string):
 *   - If `.txt`, reads and returns the file content as plain text
 *   - If image file, loads it via Jimp and decodes the QR
 * - Blob: Converts the Blob to a Buffer, loads it with Jimp, then decodes the QR
 *
 * @param input - A file path (string) or Blob.
 * @returns A Promise that resolves to the decoded QR string.
 * @throws Error if the file cannot be read, the image is invalid, or no QR code is found.
 *
 * @example
 * ```ts
 * // From a text file
 * const txtResult = await parseQrFromNode("./qris.txt");
 *
 * // From an image file
 * const imgResult = await parseQrFromNode("./qris.png");
 *
 * // From a Blob
 * import { readFile } from "fs/promises";
 * const buffer = await readFile("./qris.png");
 * const blob = new Blob([buffer]);
 * const blobResult = await parseQrFromNode(blob);
 * ```
 */
export async function parseQrFromNode(
  input: string | AnyBlob
): Promise<string> {
  if (typeof input === "string") {
    if (input.endsWith(".txt")) {
      return fs.readFile(input, "utf8");
    }

    const image = await Jimp.read(input);
    return decodeQr(image);
  }

  if (input instanceof Blob) {
    const buffer = Buffer.from(await input.arrayBuffer());
    const image = await Jimp.read(buffer);
    return decodeQr(image);
  }

  throw new Error("Unsupported input type. Expected string path or Blob.");
}

/**
 * Decodes a QR code from a Jimp image.
 *
 * @param image - A Jimp image instance.
 * @returns The decoded QR string.
 * @throws Error if no QR code is found in the image.
 */
function decodeQr(image: Jimp): string {
  const imageData = {
    data: new Uint8ClampedArray(image.bitmap.data),
    width: image.bitmap.width,
    height: image.bitmap.height,
  };

  const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);
  if (!decodedQR) {
    throw new Error("QR code not found in the image.");
  }

  return decodedQR.data;
}
