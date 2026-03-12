/**
 * Main calculator panel — assembles all form sections and the results panel.
 */

import { RotateCcw } from 'lucide-react'
import { useCalculatorStore } from '../store/calculatorStore'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/20">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">⛽</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">FuelTripROI</h1>
              <p className="text-xs text-gray-400 leading-none mt-0.5 hidden sm:block">
                Is it worth driving abroad for cheaper fuel?
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CurrencySelector />
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors"
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
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
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
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Results
            </h2>
            <ResultsPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-12 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>
            FuelTripROI — open source, MIT licensed.{' '}
            <a
              href="https://github.com/3DPeuckert/FuelTripROI"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-600 transition-colors"
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
