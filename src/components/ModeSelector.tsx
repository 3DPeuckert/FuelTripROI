/**
 * Trip mode selector: Planning vs Analysis.
 */

import { ClipboardList, ClipboardCheck } from 'lucide-react'
import { useCalculatorStore } from '../store/calculatorStore'
import type { CalculatorMode } from '../types/calculatorTypes'

interface ModeOption {
  id: CalculatorMode
  label: string
  description: string
  icon: typeof ClipboardList
}

const MODES: ModeOption[] = [
  {
    id: 'planning',
    label: 'Trip Planning',
    description: 'Estimate if the trip is worth it before you go',
    icon: ClipboardList,
  },
  {
    id: 'analysis',
    label: 'Trip Analysis',
    description: 'Calculate true savings after you return',
    icon: ClipboardCheck,
  },
]

export function ModeSelector() {
  const { mode, setMode } = useCalculatorStore()

  return (
    <div className="grid grid-cols-2 gap-3">
      {MODES.map(({ id, label, description, icon: Icon }) => {
        const active = mode === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={[
              'flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all duration-150',
              active
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-500 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-700/50',
            ].join(' ')}
            aria-pressed={active}
          >
            <div className="flex items-center gap-2">
              <Icon
                size={16}
                className={active ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500'}
                aria-hidden="true"
              />
              <span
                className={[
                  'text-sm font-semibold',
                  active ? 'text-brand-700 dark:text-brand-300' : 'text-gray-700 dark:text-gray-300',
                ].join(' ')}
              >
                {label}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-snug">{description}</p>
          </button>
        )
      })}
    </div>
  )
}
