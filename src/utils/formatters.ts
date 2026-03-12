/**
 * Display formatters used throughout the UI.
 * All formatting is centralised here so currency/locale changes are trivial.
 */

// ─── Currency ──────────────────────────────────────────────────────────────────

/**
 * Format a monetary value with the given currency symbol.
 * Uses 2 decimal places for amounts < 1000, 0 for larger amounts.
 */
export function formatCurrency(value: number, currency = '€'): string {
  if (!isFinite(value)) return '—'
  const decimals = Math.abs(value) < 1000 ? 2 : 0
  return `${value >= 0 ? '' : '−'}${currency}${Math.abs(value).toFixed(decimals)}`
}

/**
 * Format a price per litre value (always 3 decimal places for precision).
 */
export function formatPricePerLitre(value: number, currency = '€'): string {
  if (!isFinite(value)) return '—'
  return `${currency}${value.toFixed(3)}/L`
}

// ─── Distances & volumes ───────────────────────────────────────────────────────

/**
 * Format a distance in kilometres.
 */
export function formatDistance(km: number): string {
  if (!isFinite(km)) return '—'
  return `${km.toFixed(1)} km`
}

/**
 * Format a volume in litres.
 */
export function formatLitres(l: number): string {
  if (!isFinite(l)) return '—'
  return `${l.toFixed(2)} L`
}

// ─── Percentages ───────────────────────────────────────────────────────────────

/**
 * Format a percentage value.
 * Clamps display to avoid showing e.g. "−12345.67%" for absurd losses.
 */
export function formatPercent(value: number, decimals = 1): string {
  if (!isFinite(value)) return '—'
  return `${value.toFixed(decimals)}%`
}

// ─── Sign helpers ──────────────────────────────────────────────────────────────

/**
 * Return '+' for positive values and '' for zero/negative.
 * Useful for showing explicit sign on gains.
 */
export function explicitSign(value: number): string {
  return value > 0 ? '+' : ''
}

/**
 * Format savings with explicit sign (e.g. "+€12.50" or "−€5.00").
 */
export function formatSavings(value: number, currency = '€'): string {
  if (!isFinite(value)) return '—'
  const abs = Math.abs(value).toFixed(2)
  const sign = value >= 0 ? '+' : '−'
  return `${sign}${currency}${abs}`
}

// ─── Input helpers ─────────────────────────────────────────────────────────────

/**
 * Parse a numeric input string, returning 0 for empty/invalid.
 */
export function parseNumericInput(raw: string): number {
  const parsed = parseFloat(raw.replace(',', '.'))
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Convert a number to a display string for input fields.
 * Returns empty string for 0 so placeholder is visible.
 */
export function numberToInputString(value: number): string {
  if (value === 0) return ''
  return String(value)
}
