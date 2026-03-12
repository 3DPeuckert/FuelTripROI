/**
 * Simple hover tooltip.
 */

import { useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  text: string
}

export function Tooltip({ text }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="More information"
      >
        <HelpCircle size={14} />
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-gray-800 px-3 py-2 text-xs text-white shadow-lg z-50 text-center leading-relaxed">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </span>
      )}
    </span>
  )
}
