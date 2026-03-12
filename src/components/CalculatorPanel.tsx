/**
 * Main calculator panel — assembles all form sections and the results panel.
 */

import { RotateCcw, Sun, Moon } from 'lucide-react'
import { useCalculatorStore } from '../store/calculatorStore'
import { useTheme } from '../hooks/useTheme'
import { ModeSelector } from './ModeSelector'
import { VehicleForm } from './VehicleForm'
import { TripForm } from './TripForm'
import { FuelForm } from './FuelForm'
import { ExtraCostsForm } from './ExtraCostsForm'
import { ActualMeasurementsForm } from './ActualMeasurementsForm'
import { ResultsPanel } from './ResultsPanel'
import { CurrencySelector } from './CurrencySelector'

export function CalculatorPanel() {
  const { mode, reset } = useCalculatorStore()
  const { isDark, toggle: toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">⛽</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-50 leading-none">FuelTripROI</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5 hidden sm:block">
                Is it worth driving abroad for cheaper fuel?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <CurrencySelector />

            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Reset all inputs to defaults"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">

          {/* Left column: inputs */}
          <div className="flex flex-col gap-5">
            {/* Mode selector */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Calculator Mode
              </h2>
              <ModeSelector />
            </div>

            {/* Form sections */}
            <VehicleForm />
            <TripForm />
            <FuelForm />
            <ExtraCostsForm />
            {mode === 'analysis' && <ActualMeasurementsForm />}
          </div>

          {/* Right column: results (sticky on desktop) */}
          <div className="xl:sticky xl:top-20 xl:self-start">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Results
            </h2>
            <ResultsPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-gray-800 mt-12 py-6 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 dark:text-gray-500">
          <p>
            FuelTripROI — open source, MIT licensed.{' '}
            <a
              href="https://github.com/3DPeuckert/FuelTripROI"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
          </p>
          <p>All calculations run locally in your browser. No data is sent anywhere.</p>
        </div>
      </footer>
    </div>
  )
}
