/**
 * Card wrapper for form sections with title and optional icon.
 */

import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface SectionCardProps {
  title: string
  icon?: LucideIcon
  children: React.ReactNode
  className?: string
  accent?: string
}

export function SectionCard({ title, icon: Icon, children, className = '', accent = 'brand' }: SectionCardProps) {
  const accentClasses: Record<string, string> = {
    brand: 'border-brand-200 bg-brand-50/30 dark:border-brand-700 dark:bg-brand-900/10',
    blue:  'border-blue-200 bg-blue-50/30 dark:border-blue-700 dark:bg-blue-900/10',
    amber: 'border-amber-200 bg-amber-50/30 dark:border-amber-700 dark:bg-amber-900/10',
    purple:'border-purple-200 bg-purple-50/30 dark:border-purple-700 dark:bg-purple-900/10',
  }

  const iconClasses: Record<string, string> = {
    brand: 'text-brand-600 dark:text-brand-400',
    blue:  'text-blue-600 dark:text-blue-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple:'text-purple-600 dark:text-purple-400',
  }

  return (
    <div
      className={[
        'rounded-xl border-2 bg-white dark:bg-gray-800 p-5 shadow-sm transition-colors',
        accentClasses[accent] ?? accentClasses.brand,
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-2 mb-4">
        {Icon && (
          <Icon
            size={18}
            className={iconClasses[accent] ?? iconClasses.brand}
            aria-hidden="true"
          />
        )}
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  )
}
