/**
 * Analysis mode: Actual measured values override.
 * Shown only in 'analysis' mode.
 */

import { ClipboardCheck } from 'lucide-react'
import { useCalculatorStore } from '../store/calculatorStore'
import { SectionCard } from './ui/SectionCard'
import { InputField } from './ui/InputField'
import { Toggle } from './ui/Toggle'

export function ActualMeasurementsForm() {
  const { actualMeasurements, updateActual, currency } = useCalculatorStore()

  return (
    <SectionCard title="Actual Measurements" icon={ClipboardCheck} accent="blue">
      <div className="sm:col-span-2 space-y-4">
        {/* Actual fuel used */}
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <Toggle
            checked={actualMeasurements.overrideFuelUsed}
            onChange={(v) => updateActual({ overrideFuelUsed: v })}
            label="Override trip fuel consumption"
          />
          {actualMeasurements.overrideFuelUsed && (
            <InputField
              label="Actual Fuel Used (Trip)"
              value={actualMeasurements.actualFuelUsedL}
              onChange={(v) => updateActual({ actualFuelUsedL: v })}
              unit="L"
              placeholder="0"
              min={0}
              step={0.1}
              hint="Actual litres consumed driving to and from the station"
            />
          )}
        </div>

        {/* Actual foreign price */}
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <Toggle
            checked={actualMeasurements.overrideForeignPrice}
            onChange={(v) => updateActual({ overrideForeignPrice: v })}
            label="Override foreign fuel price"
          />
          {actualMeasurements.overrideForeignPrice && (
            <InputField
              label="Actual Price Paid"
              value={actualMeasurements.actualForeignPricePerL}
              onChange={(v) => updateActual({ actualForeignPricePerL: v })}
              unit={`${currency}/L`}
              placeholder="0"
              min={0}
              step={0.001}
              hint="Actual price per litre at the foreign pump"
            />
          )}
        </div>

        {/* Actual litres refuelled */}
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <Toggle
            checked={actualMeasurements.overrideLitersRefuelled}
            onChange={(v) => updateActual({ overrideLitersRefuelled: v })}
            label="Override litres refuelled"
          />
          {actualMeasurements.overrideLitersRefuelled && (
            <InputField
              label="Actual Litres Refuelled"
              value={actualMeasurements.actualLitersRefuelled}
              onChange={(v) => updateActual({ actualLitersRefuelled: v })}
              unit="L"
              placeholder="0"
              min={0}
              step={0.1}
              hint="Actual total litres purchased at the foreign station"
            />
          )}
        </div>
      </div>
    </SectionCard>
  )
}
