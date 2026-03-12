/**
 * Reusable labelled numeric input field.
 */

import React from 'react'

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
  id,
}: InputFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '' || raw === '-') {
      onChange(0)
      return
    }
    const parsed = parseFloat(raw.replace(',', '.'))
    if (!isNaN(parsed)) onChange(parsed)
  }

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
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={[
            'w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            unit ? 'pr-12' : '',
            disabled
              ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 dark:border-gray-700'
              : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:hover:border-gray-500 dark:placeholder-gray-500',
          ].join(' ')}
        />
        {unit && (
          <span className="absolute right-3 text-xs font-medium text-gray-400 dark:text-gray-500 pointer-events-none select-none">
            {unit}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  )
}
