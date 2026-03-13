/**
 * Reusable labelled numeric input field.
 *
 * locked={true}   → readonly field, muted background, lock icon
 * onUnlock        → if provided on a locked field, focusing it calls onUnlock
 *                   to allow a "click to unlock" pattern (soft-lock UX)
 */

import React from 'react'
import { Lock } from 'lucide-react'

interface InputFieldProps {
  label: string
  value: number
  onChange: (value: number) => void
  unit?: string
  placeholder?: string
  min?: number
  max?: number
  step?: number
  hint?: string
  disabled?: boolean
  locked?: boolean
  /** Called when user focuses a locked field — parent can use this to unlock */
  onUnlock?: () => void
  id?: string
}

export function InputField({
  label,
  value,
  onChange,
  unit,
  placeholder = '0',
  min,
  max,
  step = 0.01,
  hint,
  disabled = false,
  locked = false,
  onUnlock,
  id,
}: InputFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (locked) return
    const raw = e.target.value
    if (raw === '' || raw === '-') {
      onChange(0)
      return
    }
    const parsed = parseFloat(raw.replace(',', '.'))
    if (!isNaN(parsed)) onChange(parsed)
  }

  function handleFocus() {
    if (locked && onUnlock) onUnlock()
  }

  const isInactive = disabled || locked

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={fieldId}
          type="number"
          value={value === 0 ? '' : value}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={isInactive && !onUnlock}
          readOnly={locked && !onUnlock}
          className={[
            'w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            unit || locked ? 'pr-12' : '',
            locked
              ? onUnlock
                ? 'bg-slate-100 text-gray-600 border-slate-300 cursor-text dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600'
                : 'bg-slate-100 text-gray-600 border-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600'
              : disabled
              ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
              : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:border-gray-500 dark:placeholder-gray-500',
          ].join(' ')}
        />
        {locked ? (
          <span className="absolute right-3 text-xs font-medium text-slate-400 dark:text-slate-500 pointer-events-none select-none flex items-center gap-1">
            {unit && <span>{unit}</span>}
            <Lock size={11} />
          </span>
        ) : unit ? (
          <span className="absolute right-3 text-xs font-medium text-gray-400 dark:text-gray-500 pointer-events-none select-none">
            {unit}
          </span>
        ) : null}
      </div>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  )
}
