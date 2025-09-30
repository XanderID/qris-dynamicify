import { extractMetadata, type QrisMetadata } from "./metadata/metadata.js";
import { readFileAsQris } from "./parser/qrImageParser.js";
import {
  setPrice as setPriceQR,
  setTax as setTaxQR,
} from "./utils/DynamicUtils.js";
import { isNode } from "./utils/env.js";
import type { QRCodeToDataURLOptions, QRCodeToFileOptions } from "qrcode";

export class DynamicQris {
  private qris: string;
  private price: number = 0;
  private taxAmount: number = 0;

  /**
   * Creates a new DynamicQris instance.
   * @param initialQris - The initial static QRIS string
   */
  constructor(initialQris: string) {
    this.qris = initialQris;
  }

  /**
   * Sets the transaction price.
   * @param price - The price amount (must be >= 0)
   * @returns The current DynamicQris instance for chaining
   * @example
   * dynamicQris.setPrice(10000).setTax("10%")
   */
  setPrice(price: number): this {
    if (price < 0) throw new Error("Price must be >= 0");
    this.price = price;
    this.qris = setPriceQR(this.qris, price);
    return this;
  }

  /**
   * Sets the tax for the transaction.
   * Note: Not all providers support tax
   * @param tax - Either a number (nominal) or a string percentage (e.g., "10%")
   * @returns The current DynamicQris instance for chaining
   * @example
   * dynamicQris.setTax(1000); // nominal tax
   * dynamicQris.setTax("10%"); // 10% of price
   */
  setTax(tax: number | string): this {
    if (typeof tax === "number") {
      if (tax < 0) throw new Error("Tax must be >= 0");
      this.taxAmount = tax;
    } else if (typeof tax === "string" && tax.endsWith("%")) {
      const percent = parseFloat(tax);
      if (isNaN(percent) || percent < 0) {
        throw new Error("Invalid tax percentage");
      }
      this.taxAmount = Math.round((percent / 100) * this.price);
    } else {
      throw new Error("Invalid tax format");
    }

    this.qris = setTaxQR(this.qris, tax);
    return this;
  }

  /**
   * Retrieves metadata of the current dynamic QRIS.
   * @returns An object containing QRIS merchant metadata:
   * - `merchant`: Merchant name
   * - `company`: Company/organization name
   * - `region`: Region or province
   * - `country`: Country code (ISO)
   * - `postal_code`: Postal/ZIP code
   * - `merchant_pan`: Merchant PAN (Primary Account Number)
   * - `price`: Transaction amount (if present)
   * - `tax`: Service fee or tax (if present)
   * @example
   * const metadata = dynamicQris.getMetadata();
   * console.log(metadata.merchant, metadata.country);
   */
  getMetadata(): QrisMetadata {
    return extractMetadata(this.qris);
  }

  /**
   * Writes the current QRIS string to a file (Node.js only).
   * - If .txt saves plain text
   * - If .png/.jpg saves QR image
   * @param path File path where the QRIS should be saved
   * @param options QR code options (only applied if output is image)
   * @returns The file path where it was saved
   */
  async writeToFile(
    filePath: string,
    options: QRCodeToFileOptions = {}
  ): Promise<string> {
    if (!isNode) {
      throw new Error("writeToFile is only available in Node.js environment.");
    }

    const { default: fs } = await import("fs/promises");
    const { default: path } = await import("path");
    const { default: QRCode } = await import("qrcode");

    const ext = path.extname(filePath).toLowerCase();

    if (ext === ".txt") {
      await fs.writeFile(filePath, this.qris, "utf8");
    } else if ([".png", ".jpg", ".jpeg"].includes(ext)) {
      await QRCode.toFile(filePath, this.qris, {
        type: "png",
        margin: 2,
        width: 300,
        ...options,
      });
    } else {
      throw new Error(`Unsupported file extension: ${ext}`);
    }

    return filePath;
  }

  /**
   * Generate QRIS as a base64 data URL (Browser only).
   * - Useful for <img src="..."> or direct embedding
   * @param options QR code render options
   * @returns Base64 data URL string
   */
  async writeToDataURL(options: QRCodeToDataURLOptions = {}): Promise<string> {
    const { default: QRCode } = await import("qrcode");

    return await QRCode.toDataURL(this.qris, {
      type: "image/png",
      margin: 2,
      width: 300,
      ...options,
    });
  }

  /**
   * Returns the final QRIS string.
   * @returns The dynamic QRIS string
   */
  toString(): string {
    return this.qris;
  }
}

/**
 * Generates a dynamic QRIS from a static QRIS string.
 * @param staticQris - The input static QRIS string
 * @returns A promise that resolves to a DynamicQris instance
 * @throws {Error} If `staticQris` is invalid
 * @example
 * const dynamic = await fromString("staticQRIS_here");
 * dynamic.setPrice(10000).setTax("10%").writeToFile("dynamic.txt");
 */
export async function fromString(staticQris: string): Promise<DynamicQris> {
  if (!staticQris || typeof staticQris !== "string") {
    throw new Error("Invalid QRIS input");
  }

  return new DynamicQris(staticQris);
}

/**
 * Generates a dynamic QRIS from various sources.
 * @param input - The source of the static QRIS. Can be a file path (Node.js),
 *                or a File, Blob, HTMLImageElement, HTMLCanvasElement (Browser).
 * @returns A promise that resolves to a DynamicQris instance.
 * @example
 * // Node.js
 * const dynamic = await fromFile("staticQris.png");
 *
 * // Browser
 * const fileInput = document.getElementById('qrisFileInput');
 * const file = fileInput.files[0];
 * const dynamic = await fromFile(file);
 */
export async function fromFile(
  input: string | File | Blob | HTMLImageElement | HTMLCanvasElement
): Promise<DynamicQris> {
  const staticQris = await readFileAsQris(input);
  return fromString(staticQris);
}
