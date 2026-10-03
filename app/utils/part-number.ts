/** Strips spaces, dots, dashes and slashes so "63 31-2.414/105" equals "63312414105". */
export const normalizePartNumber = (value: unknown): string =>
  String(value ?? '').toLowerCase().replace(/[\s.\-/]+/g, '')

/** True when the search query is (part of) this product's part number / SKU. */
export const skuMatchesQuery = (sku: unknown, query: unknown): boolean => {
  const q = normalizePartNumber(query)
  return q.length >= 3 && normalizePartNumber(sku).includes(q)
}
