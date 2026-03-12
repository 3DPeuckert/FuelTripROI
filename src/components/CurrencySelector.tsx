/**
 * Currency selector dropdown.
 */

import { useCalculatorStore } from '../store/calculatorStore'

const CURRENCIES = [
  { symbol: '€', label: 'Euro (€)' },
  { symbol: '£', label: 'Pound (£)' },
  { symbol: '$', label: 'Dollar ($)' },
  { symbol: 'CHF', label: 'Swiss Franc (CHF)' },
  { symbol: 'zł', label: 'Złoty (zł)' },
  { symbol: 'Kč', label: 'Czech Koruna (Kč)' },
  { symbol: 'Ft', label: 'Forint (Ft)' },
  { symbol: 'kr', label: 'Krone (kr)' },
]

export function CurrencySelector() {
  const { currency, setCurrency } = useCalculatorStore()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="currency-select" className="text-xs font-medium text-gray-500 dark:text-gray-400">
        Currency:
      </label>
      <select
        id="currency-select"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
      >
        {CURRENCIES.map(({ symbol, label }) => (
          <option key={symbol} value={symbol}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
}
