/**
 * Simple toggle / switch component.
 */

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  id?: string
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  const toggleId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label htmlFor={toggleId} className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          id={toggleId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={[
            'w-10 h-6 rounded-full transition-colors duration-200',
            checked ? 'bg-brand-500' : 'bg-gray-200',
          ].join(' ')}
        />
        <div
          className={[
            'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )
}
