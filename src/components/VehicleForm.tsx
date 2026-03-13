/**
 * Vehicle data input section.
 */

import { Car } from 'lucide-react'
import { useCalculatorStore, defaultVehicle } from '../store/calculatorStore'
import { SectionCard } from './ui/SectionCard'
import { InputField } from './ui/InputField'
import { Toggle } from './ui/Toggle'

export function VehicleForm() {
  const { vehicle, updateVehicle } = useCalculatorStore()

  function handleReset() {
    updateVehicle(defaultVehicle)
  }

  return (
    <SectionCard title="Vehicle" icon={Car} accent="brand" onReset={handleReset}>
      <InputField
        label="Avg. Consumption"
        value={vehicle.averageConsumptionL100km}
        onChange={(v) => updateVehicle({ averageConsumptionL100km: v })}
        unit="L/100km"
        placeholder="7.0"
        min={1}
        max={50}
        step={0.1}
        hint="Your vehicle's average fuel consumption"
      />
      <InputField
        label="Tank Capacity"
        value={vehicle.tankCapacityL}
        onChange={(v) => updateVehicle({ tankCapacityL: v })}
        unit="L"
        placeholder="50"
        min={1}
        max={300}
        step={1}
      />
      <InputField
        label="Current Tank Level"
        value={vehicle.currentTankLevelPercent}
        onChange={(v) => updateVehicle({ currentTankLevelPercent: Math.min(100, Math.max(0, v)) })}
        unit="%"
        placeholder="30"
        min={0}
        max={100}
        step={1}
        hint="Current fuel level (0–100%)"
      />
      <div className="sm:col-span-2 flex flex-col gap-3">
        <Toggle
          checked={vehicle.includeVehicleWear}
          onChange={(v) => updateVehicle({ includeVehicleWear: v })}
          label="Include vehicle wear cost"
        />
        {vehicle.includeVehicleWear && (
          <InputField
            label="Vehicle Cost per km"
            value={vehicle.vehicleCostPerKm}
            onChange={(v) => updateVehicle({ vehicleCostPerKm: v })}
            unit="€/km"
            placeholder="0.08"
            min={0}
            max={5}
            step={0.01}
            hint="Maintenance, tires, oil, depreciation. Typical: €0.08/km"
          />
        )}
      </div>
    </SectionCard>
  )
}
