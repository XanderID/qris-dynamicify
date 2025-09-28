import fs from "fs/promises";
import { Jimp } from "jimp";
import jsQR from "jsqr";

/**
 * Reads a QRIS string from a file.
 * If the file is a .txt, it reads the text directly.
 * If the file is an image, it decodes the QR code from the image.
 * @param filePath - Input file path
 * @returns Promise<string> - QRIS string extracted from the file
 */
export async function readFileAsQris(filePath: string): Promise<string> {
  if (filePath.endsWith(".txt")) {
    return fs.readFile(filePath, "utf8");
  }

  const image = await Jimp.read(filePath);
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
