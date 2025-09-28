/**
 * Inserts or updates the transaction amount (tag `54`) in a QRIS payload.
 *
 * @param staticQris - The original static QRIS string (must be valid QRIS format).
 * @param price - Transaction amount in integer (must be >= 0).
 * @returns A new QRIS string with the price included and a valid CRC16 checksum.
 * @throws If QRIS is invalid or price < 0.
 *
 * @example
 * const withPrice = setPrice(staticQris, 10000);
 */
export function setPrice(staticQris: string, price: number): string {
  if (price < 0) throw new Error("Price must be >= 0");

  // Remove old CRC (last 4 characters)
  let qris = staticQris.slice(0, -4);

  // Convert to dynamic QR (replace tag 01 from "11" to "12")
  qris = qris.replace("010211", "010212");

  // Split before country code (tag 58)
  const parts = qris.split("5802ID");
  if (parts.length !== 2) {
    throw new Error("Invalid QRIS format (missing 5802ID)");
  }

  // Build tag 54 with the given price
  const priceTag = `54${String(price)
    .length.toString()
    .padStart(2, "0")}${price}`;

  // Rebuild QRIS string
  const result = `${parts[0]}${priceTag}5802ID${parts[1]}`;

  // Append updated CRC16
  return result + computeCRC16(result);
}

/**
 * Inserts or updates a service fee (tag `55`) in a QRIS payload.
 *
 * The service fee must always come **after the transaction amount (tag 54)**
 * and before the country code (tag 58).
 *
 * Two formats are supported:
 * - **Nominal (number)** encoded with tag `55020256`
 * - **Percentage (string with %)** encoded with tag `55020357`
 *
 * @param staticQris - The QRIS string (must already include a transaction amount).
 * @param tax - Either a number (nominal fee) or a string percentage (e.g., `"10%"`).
 * @returns A new QRIS string with the service fee included and a valid CRC16 checksum.
 * @throws If tax format is invalid or no transaction amount (tag 54) is found.
 *
 * @example
 * const withPrice = setPrice(staticQris, 10000);
 * const withTaxNominal = setTax(withPrice, 2000);   // adds Rp 2000 fee
 * const withTaxPercent = setTax(withPrice, "10%");  // adds 10% fee
 */
export function setTax(staticQris: string, tax: number | string): string {
  let tag = "";

  if (typeof tax === "number") {
    // Nominal service fee (Rp)
    tag = `55020256${String(tax).length.toString().padStart(2, "0")}${tax}`;
  } else if (typeof tax === "string" && tax.endsWith("%")) {
    // Percentage-based service fee
    const percent = tax.replace("%", "");
    tag = `55020357${percent.length.toString().padStart(2, "0")}${percent}`;
  } else {
    throw new Error(
      "Invalid tax format, must be a number or a percentage string (e.g., '10%')."
    );
  }

  // Remove the old CRC (last 4 characters)
  let qris = staticQris.slice(0, -4);
  qris = qris.replace("010211", "010212");

  // Split before country code (tag 58)
  const parts = qris.split("5802ID");
  if (parts.length !== 2) {
    throw new Error("Invalid QRIS format (missing 5802ID tag).");
  }

  // Find the transaction amount (tag 54)
  const match = parts[0].match(/54\d{2}\d+/);
  if (!match) {
    throw new Error(
      "QRIS does not contain a transaction amount (tag 54). Please call setPrice() first."
    );
  }

  // Insert the service fee right after the amount
  const withTax = parts[0].replace(match[0], match[0] + tag);

  const result = `${withTax}5802ID${parts[1]}`;
  return result + computeCRC16(result);
}

/**
 * Computes CRC16 (CCITT-FALSE) checksum for a QRIS payload.
 *
 * @param str - QRIS payload string without CRC.
 * @returns Uppercase hexadecimal checksum (4 characters).
 *
 * @example
 * const crc = computeCRC16("000201010212...");
 */
export function computeCRC16(str: string): string {
  let crc = 0xffff;
  for (let c = 0; c < str.length; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }
  let hex = crc.toString(16).toUpperCase();
  if (hex.length === 3) hex = "0" + hex;
  return hex;
}
