/**
 * Results panel — the core financial summary shown to the user.
 */

import { TrendingUp, TrendingDown, AlertCircle, Gauge, Route, Fuel, BarChart3 } from 'lucide-react'
import { useCalculatorStore } from '../store/calculatorStore'
import {
  formatCurrency,
  formatSavings,
  formatPricePerLitre,
  formatLitres,
  formatDistance,
  formatPercent,
} from '../utils/formatters'

// ─── Individual stat tile ──────────────────────────────────────────────────────

interface StatTileProps {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
  icon?: React.ReactNode
}

function StatTile({ label, value, sub, positive, icon }: StatTileProps) {
  const bg =
    positive === true
      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700'
      : positive === false
      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700'
      : 'bg-gray-50 border-gray-200 dark:bg-gray-700/50 dark:border-gray-600'

  const valueColor =
    positive === true
      ? 'text-green-700 dark:text-green-400'
      : positive === false
      ? 'text-red-600 dark:text-red-400'
      : 'text-gray-800 dark:text-gray-100'

  return (
    <div className={`rounded-xl border-2 p-4 flex flex-col gap-1 ${bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
      </div>
      <span className={`text-xl font-bold ${valueColor}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400 dark:text-gray-500">{sub}</span>}
    </div>
  )
}

// ─── Break-even section ────────────────────────────────────────────────────────

function BreakEvenSection() {
  const { result, currency } = useCalculatorStore()
  if (!result) return null
  const { breakEven } = result

  const priceDiffDisplay =
    !isFinite(breakEven.breakEvenPriceDiff) || breakEven.breakEvenPriceDiff > 99
      ? '—'
      : formatPricePerLitre(breakEven.breakEvenPriceDiff, currency)

  const litersDisplay =
    !isFinite(breakEven.breakEvenLiters) || breakEven.breakEvenLiters > 9999
      ? '—'
      : formatLitres(breakEven.breakEvenLiters)

  const distDisplay =
    !isFinite(breakEven.breakEvenDistanceKm) || breakEven.breakEvenDistanceKm > 9999
      ? '—'
      : formatDistance(breakEven.breakEvenDistanceKm)

  return (
    <div className="mt-4 rounded-xl border-2 border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50 p-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3 flex items-center gap-2">
        <BarChart3 size={14} />
        Break-Even Analysis
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Min. Price Diff</span>
          <span className="text-base font-bold text-gray-700 dark:text-gray-200">{priceDiffDisplay}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">to break even</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Min. Litres</span>
          <span className="text-base font-bold text-gray-700 dark:text-gray-200">{litersDisplay}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">needed to buy</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Max. Distance</span>
          <span className="text-base font-bold text-gray-700 dark:text-gray-200">{distDisplay}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">one-way</span>
        </div>
      </div>
    </div>
  )
}

// ─── Cost breakdown bar ────────────────────────────────────────────────────────

function CostBreakdown() {
  const { result, currency } = useCalculatorStore()
  if (!result) return null
  const { trip } = result

  const items = [
    { label: 'Travel Fuel', value: trip.tripFuelCost, color: 'bg-amber-400' },
    { label: 'Vehicle Wear', value: trip.vehicleCostTotal, color: 'bg-orange-400' },
    { label: 'Extras', value: trip.extraCostTotal, color: 'bg-purple-400' },
  ].filter((i) => i.value > 0)

  const total = trip.tripTotalCost
  if (total === 0 || items.length === 0) return null

  return (
    <div className="mt-4 rounded-xl border-2 border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50 p-4">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">Trip Cost Breakdown</h3>
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={`${item.color} transition-all duration-300`}
            style={{ width: `${(item.value / total) * 100}%` }}
            title={`${item.label}: ${formatCurrency(item.value, currency)}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${item.color}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.label}: {formatCurrency(item.value, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main results panel ────────────────────────────────────────────────────────

export function ResultsPanel() {
  const { result, currency, mode } = useCalculatorStore()

  if (!result) return null

  const { trip, isWorthIt } = result

  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm p-5 transition-colors">
      {/* Header verdict */}
      <div
        className={[
          'flex items-center gap-3 mb-5 p-4 rounded-xl',
          isWorthIt
            ? 'bg-green-50 border-2 border-green-200 dark:bg-green-900/20 dark:border-green-700'
            : 'bg-red-50 border-2 border-red-200 dark:bg-red-900/20 dark:border-red-700',
        ].join(' ')}
      >
        {isWorthIt ? (
          <TrendingUp size={28} className="text-green-600 dark:text-green-400 shrink-0" />
        ) : (
          <TrendingDown size={28} className="text-red-500 dark:text-red-400 shrink-0" />
        )}
        <div>
          <p
            className={[
              'text-lg font-bold',
              isWorthIt ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400',
            ].join(' ')}
          >
            {isWorthIt ? 'This trip saves you money!' : 'You lose money on this trip.'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mode === 'planning' ? 'Estimated result' : 'Actual result based on real values'}
          </p>
        </div>
        {!isWorthIt && (
          <AlertCircle size={20} className="text-red-400 dark:text-red-500 shrink-0 ml-auto" />
        )}
      </div>

      {/* Primary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatTile
          label="Net Savings"
          value={formatSavings(trip.savings, currency)}
          sub={
            isWorthIt
              ? `You save ${formatCurrency(trip.savings, currency)}`
              : `You lose ${formatCurrency(Math.abs(trip.savings), currency)}`
          }
          positive={isWorthIt ? true : false}
          icon={isWorthIt ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        />
        <StatTile
          label="Effective Price/L"
          value={formatPricePerLitre(trip.effectivePricePerL, currency)}
          sub="incl. all trip costs"
          positive={null}
          icon={<Fuel size={16} />}
        />
        <StatTile
          label="Trip ROI"
          value={formatPercent(trip.roiPercent)}
          sub="return on trip investment"
          positive={trip.roiPercent > 0 ? true : trip.roiPercent < 0 ? false : null}
          icon={<Gauge size={16} />}
        />
        <StatTile
          label="Total Trip Cost"
          value={formatCurrency(trip.tripTotalCost, currency)}
          sub="fuel + extras + wear"
          positive={null}
          icon={<Route size={16} />}
        />
        <StatTile
          label="Trip Fuel Used"
          value={formatLitres(trip.tripFuelUsedL)}
          sub={`${formatDistance(trip.tripDistanceTotalKm)} total`}
          positive={null}
        />
        <StatTile
          label="Cost per km"
          value={formatCurrency(trip.costPerKm, currency) + '/km'}
          sub="trip operating cost"
          positive={null}
        />
      </div>

      {/* Refuel comparison */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 p-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Refuel at Home</p>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
            {formatCurrency(trip.homeRefuelCost, currency)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatLitres(trip.totalRefuelLiters)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-200 dark:bg-gray-700/50 dark:border-gray-600 p-3">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Refuel Abroad</p>
          <p className="text-lg font-bold text-gray-700 dark:text-gray-200">
            {formatCurrency(trip.foreignRefuelCost, currency)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            raw saving: {formatCurrency(trip.homeRefuelCost - trip.foreignRefuelCost, currency)}
          </p>
        </div>
      </div>

      <CostBreakdown />
      <BreakEvenSection />
    </div>
  )
}
