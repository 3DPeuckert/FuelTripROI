/**
 * Trip data input section.
 */

import { MapPin } from 'lucide-react'
import { useCalculatorStore } from '../store/calculatorStore'
import { SectionCard } from './ui/SectionCard'
import { InputField } from './ui/InputField'

export function TripForm() {
  const { trip, updateTrip } = useCalculatorStore()

  return (
    <SectionCard title="Trip" icon={MapPin} accent="blue">
      <InputField
        label="Distance to Station"
        value={trip.distanceToForeignStationKm}
        onChange={(v) => {
          if (!trip.totalDistanceOverridden) {
            updateTrip({ distanceToForeignStationKm: v, totalDistanceKm: v * 2 })
          } else {
            updateTrip({ distanceToForeignStationKm: v })
          }
        }}
        unit="km"
        placeholder="30"
        min={0}
        step={0.5}
        hint="One-way distance to the foreign fuel station"
      />

      <div className="flex flex-col gap-2">
        <InputField
          label="Total Trip Distance"
          value={trip.totalDistanceKm}
          onChange={(v) => updateTrip({ totalDistanceKm: v, totalDistanceOverridden: true })}
          unit="km"
          placeholder={String(trip.distanceToForeignStationKm * 2)}
          min={0}
          step={0.5}
          hint={
            trip.totalDistanceOverridden
              ? 'Manually set'
              : `Auto: ${trip.distanceToForeignStationKm * 2} km (× 2)`
          }
        />
        {trip.totalDistanceOverridden && (
          <button
            type="button"
            onClick={() =>
              updateTrip({
                totalDistanceKm: trip.distanceToForeignStationKm * 2,
                totalDistanceOverridden: false,
              })
            }
            className="text-xs text-brand-600 hover:underline text-left"
          >
            ↺ Reset to auto (×2)
          </button>
        )}
      </div>

      <InputField
        label="Detour Distance"
        value={trip.detourDistanceKm}
        onChange={(v) => updateTrip({ detourDistanceKm: v })}
        unit="km"
        placeholder="0"
        min={0}
        step={0.5}
        hint="Extra km added by detours or route deviations"
      />

      <InputField
        label="Border Wait Time"
        value={trip.borderWaitTimeMinutes}
        onChange={(v) => updateTrip({ borderWaitTimeMinutes: v })}
        unit="min"
        placeholder="0"
        min={0}
        step={5}
        hint="Estimated border crossing wait (informational only)"
      />
    </SectionCard>
  )
}
