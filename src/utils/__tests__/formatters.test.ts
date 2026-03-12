/**
 * Unit tests for display formatters.
 */

import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPricePerLitre,
  formatDistance,
  formatLitres,
  formatPercent,
  formatSavings,
  explicitSign,
  parseNumericInput,
  numberToInputString,
} from '../formatters'

describe('formatCurrency', () => {
  it('formats positive value with default euro sign', () => {
    expect(formatCurrency(12.5)).toBe('€12.50')
  })

  it('formats negative value with minus sign', () => {
    expect(formatCurrency(-5.99)).toBe('−€5.99')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('€0.00')
  })

  it('uses custom currency symbol', () => {
    expect(formatCurrency(10, '$')).toBe('$10.00')
  })

  it('returns em dash for non-finite value', () => {
    expect(formatCurrency(Infinity)).toBe('—')
    expect(formatCurrency(NaN)).toBe('—')
  })

  it('uses 0 decimal places for values >= 1000', () => {
    expect(formatCurrency(1234.56)).toBe('€1235')
  })
})

describe('formatPricePerLitre', () => {
  it('formats with 3 decimal places', () => {
    expect(formatPricePerLitre(1.35)).toBe('€1.350/L')
  })

  it('uses custom currency', () => {
    expect(formatPricePerLitre(1.35, '$')).toBe('$1.350/L')
  })

  it('returns em dash for non-finite', () => {
    expect(formatPricePerLitre(Infinity)).toBe('—')
  })
})

describe('formatDistance', () => {
  it('formats km with 1 decimal', () => {
    expect(formatDistance(60)).toBe('60.0 km')
    expect(formatDistance(30.5)).toBe('30.5 km')
  })

  it('returns em dash for non-finite', () => {
    expect(formatDistance(Infinity)).toBe('—')
  })
})

describe('formatLitres', () => {
  it('formats litres with 2 decimal places', () => {
    expect(formatLitres(4.2)).toBe('4.20 L')
  })

  it('returns em dash for non-finite', () => {
    expect(formatLitres(NaN)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('formats with 1 decimal by default', () => {
    expect(formatPercent(0.5)).toBe('0.5%')
    expect(formatPercent(-14.8)).toBe('-14.8%')
  })

  it('respects custom decimal places', () => {
    expect(formatPercent(12.3456, 2)).toBe('12.35%')
  })

  it('returns em dash for non-finite', () => {
    expect(formatPercent(Infinity)).toBe('—')
  })
})

describe('formatSavings', () => {
  it('formats positive savings with + prefix', () => {
    expect(formatSavings(12.5)).toBe('+€12.50')
  })

  it('formats negative savings (loss) with − prefix', () => {
    expect(formatSavings(-5)).toBe('−€5.00')
  })

  it('formats zero with + prefix', () => {
    expect(formatSavings(0)).toBe('+€0.00')
  })
})

describe('explicitSign', () => {
  it('returns + for positive', () => {
    expect(explicitSign(10)).toBe('+')
  })

  it('returns empty string for zero', () => {
    expect(explicitSign(0)).toBe('')
  })

  it('returns empty string for negative', () => {
    expect(explicitSign(-5)).toBe('')
  })
})

describe('parseNumericInput', () => {
  it('parses a normal number string', () => {
    expect(parseNumericInput('7.5')).toBe(7.5)
  })

  it('handles comma as decimal separator', () => {
    expect(parseNumericInput('1,65')).toBe(1.65)
  })

  it('returns 0 for empty string', () => {
    expect(parseNumericInput('')).toBe(0)
  })

  it('returns 0 for non-numeric input', () => {
    expect(parseNumericInput('abc')).toBe(0)
  })
})

describe('numberToInputString', () => {
  it('converts a non-zero number to its string representation', () => {
    expect(numberToInputString(7.5)).toBe('7.5')
  })

  it('returns empty string for 0 so placeholder is visible', () => {
    expect(numberToInputString(0)).toBe('')
  })
})
