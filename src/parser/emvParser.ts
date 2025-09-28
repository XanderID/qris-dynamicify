/**
 * Generic EMV TLV (Tag-Length-Value) parser
 * Parses QRIS string into key-value pairs where key is the tag
 * @param qris - The QRIS string
 * @returns Record<string, string> - Parsed TLV key-value pairs
 */
export function parseEmv(qris: string): Record<string, string> {
  let i = 0;
  const result: Record<string, string> = {};

  while (i < qris.length) {
    const tag = qris.substring(i, i + 2);
    const len = parseInt(qris.substring(i + 2, i + 4), 10);
    const value = qris.substring(i + 4, i + 4 + len);
    result[tag] = value;
    i += 4 + len;
  }

  return result;
}
