import jsQR from "jsqr";

/**
 * Converts a File, Blob, or HTMLImageElement into an HTMLCanvasElement.
 *
 * - If given an HTMLImageElement, it directly draws the image onto a canvas.
 * - If given a File/Blob, it creates a temporary Image object and draws it onto a canvas.
 *
 * @param input - The input source (File, Blob, or HTMLImageElement).
 * @returns A Promise that resolves to an HTMLCanvasElement containing the drawn image.
 * @throws Error if the canvas context cannot be created or the image fails to load.
 */
async function getCanvasFromInput(
  input: File | Blob | HTMLImageElement
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context could not be created.");
  }

  if (input instanceof HTMLImageElement) {
    canvas.width = input.naturalWidth;
    canvas.height = input.naturalHeight;
    ctx.drawImage(input, 0, 0);
    return canvas;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
      resolve(canvas);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(img.src);
      reject(err);
    };
    img.src = URL.createObjectURL(input);
  });
}

/**
 * Parses and decodes a QR code from various browser-compatible inputs.
 *
 * Supported inputs:
 * - File (e.g., uploaded via <input type="file">)
 * - Blob (binary image data)
 * - HTMLImageElement (already loaded <img> element)
 * - HTMLCanvasElement (existing canvas with image drawn)
 *
 * @param input - The input source to decode the QR code from.
 * @returns A Promise that resolves to the decoded QRIS/QR string.
 * @throws Error if no QR code is found or if canvas context cannot be retrieved.
 *
 * @example
 * ```ts
 * const file = document.querySelector("input[type=file]").files[0];
 * const result = await parseQrFromBrowser(file);
 * console.log(result); // Decoded QR string
 * ```
 */
export async function parseQrFromBrowser(
  input: File | Blob | HTMLImageElement | HTMLCanvasElement
): Promise<string> {
  let canvas: HTMLCanvasElement;

  if (input instanceof HTMLCanvasElement) {
    canvas = input;
  } else {
    canvas = await getCanvasFromInput(input);
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context could not be retrieved.");
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

  if (!decodedQR) {
    throw new Error("QR code not found in the input.");
  }

  return decodedQR.data;
}
