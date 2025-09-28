import { parseEmv } from "../parser/emvParser.js";

/**
 * Metadata structure extracted from a QRIS string.
 * Represents merchant-related information and optional transaction details.
 */
export interface QrisMetadata {
  /** Merchant name (store or individual) */
  merchant: string;
  /** Company or organization name */
  company: string;
  /** Region or province of the merchant */
  region: string;
  /** Country code in ISO format (e.g., "ID") */
  country: string;
  /** Postal/ZIP code of the merchant’s address */
  postal_code: string;
  /** Merchant PAN (Primary Account Number) */
  merchant_pan: string;
  /** Transaction amount (tag 54), if present */
  price?: string | null;
  /** Service fee or tax (tag 55), if present (number for nominal, string with "%" for percentage) */
  tax?: string | null;
}

/**
 * Extract merchant, company, and optional transaction metadata from a QRIS string.
 * @param qris - QRIS string
 * @returns QrisMetadata - Parsed metadata object
 */
export function extractMetadata(qris: string): QrisMetadata {
  const emv = parseEmv(qris);

  const merchant = emv["59"] || "";
  const region = emv["60"] || "";
  const country = emv["58"] || "ID";
  const postal_code = emv["61"] || "";

  let company = "";
  let merchant_pan = "";
  for (const tag of ["26", "27", "51"]) {
    if (emv[tag]) {
      const nested = parseEmv(emv[tag]);
      const gui = nested["00"] || "";
      const acc = nested["01"] || "";

      if (gui && gui.toUpperCase() !== "ID.CO.QRIS.WWW") {
        company = gui;
        if (acc) merchant_pan = acc;
        break;
      }
    }
  }

  const price = emv["54"] || null;
  const tax = emv["55"] || null;

  return {
    merchant,
    company,
    region,
    country,
    postal_code,
    merchant_pan,
    price,
    tax,
  };
}
