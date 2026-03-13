/**
 * Info tooltip — hover on desktop, tap-to-toggle on mobile.
 * Shows an ⓘ icon; content appears above on hover/tap.
 */

import { useState } from 'react'
import { Info } from 'lucide-react'

interface TooltipProps {
  text: string
  wide?: boolean
}

export function Tooltip({ text, wide = false }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    setVisible((v) => !v)
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggle}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        aria-label="Show formula"
        aria-expanded={visible}
      >
        <Info size={14} />
      </button>
      {visible && (
        <span
          className={[
            'absolute bottom-full right-0 mb-2 rounded-lg bg-gray-800 dark:bg-gray-900 px-3 py-2 text-xs text-white shadow-lg z-50 leading-relaxed',
            wide ? 'w-72' : 'w-56',
          ].join(' ')}
        >
          {text}
          <span className="absolute top-full right-3 border-4 border-transparent border-t-gray-800 dark:border-t-gray-900" />
        </span>
      )}
    </span>
  )
}
