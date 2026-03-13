/**
 * Fuel price and quantity input section.
 */

import { Fuel } from 'lucide-react'
import { useCalculatorStore, defaultFuel } from '../store/calculatorStore'
import { SectionCard } from './ui/SectionCard'
import { InputField } from './ui/InputField'

export function FuelForm() {
  const { fuel, updateFuel, currency } = useCalculatorStore()

  const priceDiff = fuel.homeFuelPricePerL - fuel.foreignFuelPricePerL
  const totalRefuel = fuel.litersToRefuelVehicle + fuel.extraCanisterLiters

  function handleReset() {
    updateFuel(defaultFuel)
  }

  return (
    <SectionCard title="Fuel" icon={Fuel} accent="amber" onReset={handleReset}>
      {/* Prices */}
      <InputField
        label="Home Fuel Price"
        value={fuel.homeFuelPricePerL}
        onChange={(v) => updateFuel({ homeFuelPricePerL: v })}
        unit={`${currency}/L`}
        placeholder="1.65"
        min={0}
        step={0.001}
        hint="Fuel price at your local station"
      />
      <div className="flex flex-col gap-1">
        <InputField
          label="Foreign Fuel Price"
          value={fuel.foreignFuelPricePerL}
          onChange={(v) => updateFuel({ foreignFuelPricePerL: v })}
          unit={`${currency}/L`}
          placeholder="1.35"
          min={0}
          step={0.001}
          hint="Fuel price at the foreign station"
        />
        {priceDiff !== 0 && (
          <p
            className={[
              'text-xs font-medium',
              priceDiff > 0 ? 'text-brand-600 dark:text-brand-400' : 'text-red-500 dark:text-red-400',
            ].join(' ')}
          >
            {priceDiff > 0
              ? `▼ ${currency}${priceDiff.toFixed(3)}/L cheaper abroad`
              : `▲ ${currency}${Math.abs(priceDiff).toFixed(3)}/L more expensive abroad`}
          </p>
        )}
      </div>

      {/* Quantities */}
      <InputField
        label="Litres to Refuel (Tank)"
        value={fuel.litersToRefuelVehicle}
        onChange={(v) => updateFuel({ litersToRefuelVehicle: v })}
        unit="L"
        placeholder="40"
        min={0}
        step={1}
        hint="How many litres you plan to put in the tank"
      />
      <div className="flex flex-col gap-1">
        <InputField
          label="Extra Canister Litres"
          value={fuel.extraCanisterLiters}
          onChange={(v) => updateFuel({ extraCanisterLiters: v })}
          unit="L"
          placeholder="0"
          min={0}
          step={1}
          hint="Additional fuel carried in canisters"
        />
        {totalRefuel > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Total: {totalRefuel.toFixed(1)} L</p>
        )}
      </div>
    </SectionCard>
  )
}
