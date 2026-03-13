/**
 * After-Trip (Analysis) mode input form.
 *
 * Divided into four clearly labelled sections that separate
 * REAL DATA (what actually happened) from the HYPOTHETICAL domestic scenario:
 *
 *  1. Actual Trip Data  — vehicle consumption, distances, vehicle wear
 *  2. Tank State        — departure / return fill levels (partial tank logic)
 *  3. Fuel Abroad       — what you bought, what you paid
 *  4. Domestic Baseline — home price for the "what if" comparison
 *  5. Extra Costs       — tolls, food, parking, etc.
 */

import { useState } from 'react'
import { Car, MapPin, Fuel, Home, ReceiptText, Info } from 'lucide-react'
import { useCalculatorStore, defaultAfterTrip } from '../store/calculatorStore'
import { SectionCard } from './ui/SectionCard'
import { InputField } from './ui/InputField'
import { Toggle } from './ui/Toggle'
import { formatCurrency, formatLitres } from '../utils/formatters'

// ─── Section 1: Actual Trip Data ───────────────────────────────────────────────

function ActualTripSection() {
  const { afterTrip, updateAfterTrip } = useCalculatorStore()
  const [totalDistanceLocked, setTotalDistanceLocked] = useState(true)

  const returnDistanceKm = Math.max(0, afterTrip.actualDistanceTotalKm - afterTrip.distanceToStationKm)

  function handleDistanceToStationChange(v: number) {
    if (totalDistanceLocked) {
      updateAfterTrip({ distanceToStationKm: v, actualDistanceTotalKm: v * 2 })
    } else {
      updateAfterTrip({ distanceToStationKm: v })
    }
  }

  function handleTotalDistanceChange(v: number) {
    if (v === 0) {
      setTotalDistanceLocked(true)
      updateAfterTrip({ actualDistanceTotalKm: afterTrip.distanceToStationKm * 2 })
    } else {
      setTotalDistanceLocked(false)
      updateAfterTrip({ actualDistanceTotalKm: v })
    }
  }

  function handleReset() {
    setTotalDistanceLocked(true)
    updateAfterTrip({
      actualConsumptionL100km: defaultAfterTrip.actualConsumptionL100km,
      vehicleCostPerKm: defaultAfterTrip.vehicleCostPerKm,
      includeVehicleWear: defaultAfterTrip.includeVehicleWear,
      distanceToStationKm: defaultAfterTrip.distanceToStationKm,
      actualDistanceTotalKm: defaultAfterTrip.actualDistanceTotalKm,
    })
  }

  return (
    <SectionCard title="Actual Trip Data" icon={Car} accent="blue" onReset={handleReset}>
      <InputField
        label="Actual Consumption"
        value={afterTrip.actualConsumptionL100km}
        onChange={(v) => updateAfterTrip({ actualConsumptionL100km: v })}
        unit="L/100km"
        placeholder="7.0"
        min={1}
        max={50}
        step={0.1}
        hint="Measured fuel consumption for this specific trip"
      />

      <div className="flex flex-col gap-1">
        <InputField
          label="Distance to Station"
          value={afterTrip.distanceToStationKm}
          onChange={handleDistanceToStationChange}
          unit="km"
          placeholder="30"
          min={0}
          step={0.5}
          hint="One-way distance driven to the foreign station"
        />
      </div>

      <div className="flex flex-col gap-1">
        <InputField
          label="Total Actual Distance"
          value={afterTrip.actualDistanceTotalKm}
          onChange={handleTotalDistanceChange}
          onUnlock={() => setTotalDistanceLocked(false)}
          unit="km"
          placeholder="60"
          min={0}
          step={0.5}
          locked={totalDistanceLocked}
          hint={
            totalDistanceLocked
              ? `Auto: ${afterTrip.distanceToStationKm * 2} km — click to override`
              : 'Full round-trip distance actually driven (odometer)'
          }
        />
        {!totalDistanceLocked && returnDistanceKm > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Return leg: {returnDistanceKm.toFixed(1)} km
          </p>
        )}
      </div>

      <div className="sm:col-span-2 flex flex-col gap-3">
        <Toggle
          checked={afterTrip.includeVehicleWear}
          onChange={(v) => updateAfterTrip({ includeVehicleWear: v })}
          label="Include vehicle wear cost"
        />
        {afterTrip.includeVehicleWear && (
          <InputField
            label="Vehicle Cost per km"
            value={afterTrip.vehicleCostPerKm}
            onChange={(v) => updateAfterTrip({ vehicleCostPerKm: v })}
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

// ─── Section 2: Tank State ─────────────────────────────────────────────────────

function TankStateSection() {
  const { afterTrip, updateAfterTrip } = useCalculatorStore()

  const fuelAtDepartureL = (afterTrip.tankLevelAtDeparturePercent / 100) * afterTrip.tankCapacityL
  const fuelAfterReturnL = (afterTrip.tankLevelAfterReturnPercent / 100) * afterTrip.tankCapacityL

  function handleReset() {
    updateAfterTrip({
      tankCapacityL: defaultAfterTrip.tankCapacityL,
      tankLevelAtDeparturePercent: defaultAfterTrip.tankLevelAtDeparturePercent,
      tankLevelAfterReturnPercent: defaultAfterTrip.tankLevelAfterReturnPercent,
    })
  }

  return (
    <SectionCard title="Tank State" icon={MapPin} accent="brand" onReset={handleReset}>
      <InputField
        label="Tank Capacity"
        value={afterTrip.tankCapacityL}
        onChange={(v) => updateAfterTrip({ tankCapacityL: v })}
        unit="L"
        placeholder="50"
        min={1}
        max={300}
        step={1}
      />

      <div /> {/* grid spacer */}

      <div className="flex flex-col gap-1">
        <InputField
          label="Tank Level at Departure"
          value={afterTrip.tankLevelAtDeparturePercent}
          onChange={(v) =>
            updateAfterTrip({ tankLevelAtDeparturePercent: Math.min(100, Math.max(0, v)) })
          }
          unit="%"
          placeholder="30"
          min={0}
          max={100}
          step={1}
          hint="How full was the tank when you left home?"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          ≈ {fuelAtDepartureL.toFixed(1)} L in tank
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <InputField
          label="Tank Level After Return"
          value={afterTrip.tankLevelAfterReturnPercent}
          onChange={(v) =>
            updateAfterTrip({ tankLevelAfterReturnPercent: Math.min(100, Math.max(0, v)) })
          }
          unit="%"
          placeholder="25"
          min={0}
          max={100}
          step={1}
          hint="How full was the tank when you got home?"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          ≈ {fuelAfterReturnL.toFixed(1)} L in tank
        </p>
      </div>

      {/* Summary row */}
      <div className="sm:col-span-2 flex items-start gap-2 p-3 rounded-lg bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800">
        <Info size={14} className="text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Tank state is informational — it helps you verify your fuel accounting. The financial
          calculation uses the litres purchased abroad and what you actually paid.
        </p>
      </div>
    </SectionCard>
  )
}

// ─── Section 3: Fuel Purchased Abroad ─────────────────────────────────────────
//
// Bidirectional auto-calc within: litersFilled, foreignPricePerL, totalPaidForeign
// When n-1 of the 3 fields are filled, the remaining one is auto-calculated & locked.
// Clearing any field in the group unlocks all fields.

type FuelAbroadLocked = 'litersFilled' | 'foreignPricePerL' | 'totalPaidForeign' | null

function FuelAbroadSection() {
  const { afterTrip, updateAfterTrip, currency } = useCalculatorStore()
  const [lockedField, setLockedField] = useState<FuelAbroadLocked>(null)

  const totalForeignFuelL = afterTrip.litersFilled + afterTrip.extraCanisterLiters

  /** Unlock: clear the locked field value and set lockedField to null */
  function unlock(extraUpdates: Partial<typeof afterTrip> = {}) {
    const clearLocked: Partial<typeof afterTrip> = {}
    if (lockedField === 'totalPaidForeign') {
      clearLocked.totalPaidForeign = 0
      clearLocked.useTotalPaidForeign = false
    } else if (lockedField === 'foreignPricePerL') {
      clearLocked.foreignPricePerL = 0
    } else if (lockedField === 'litersFilled') {
      clearLocked.litersFilled = 0
    }
    updateAfterTrip({ ...clearLocked, ...extraUpdates })
    setLockedField(null)
  }

  function handleLitersChange(v: number) {
    const p = afterTrip.foreignPricePerL
    const t = afterTrip.totalPaidForeign

    if (v === 0) {
      // Clearing this field → unlock everything
      unlock({ litersFilled: 0 })
      return
    }

    if (lockedField === 'totalPaidForeign' && p > 0) {
      updateAfterTrip({ litersFilled: v, totalPaidForeign: v * p, useTotalPaidForeign: true })
    } else if (lockedField === 'foreignPricePerL' && t > 0) {
      updateAfterTrip({ litersFilled: v, foreignPricePerL: t / v })
    } else if (lockedField === null && p > 0 && t === 0) {
      updateAfterTrip({ litersFilled: v, totalPaidForeign: v * p, useTotalPaidForeign: true })
      setLockedField('totalPaidForeign')
    } else if (lockedField === null && t > 0 && p === 0) {
      updateAfterTrip({ litersFilled: v, foreignPricePerL: t / v })
      setLockedField('foreignPricePerL')
    } else {
      updateAfterTrip({ litersFilled: v })
    }
  }

  function handlePriceChange(v: number) {
    const l = afterTrip.litersFilled
    const t = afterTrip.totalPaidForeign

    if (v === 0) {
      unlock({ foreignPricePerL: 0 })
      return
    }

    if (lockedField === 'totalPaidForeign' && l > 0) {
      updateAfterTrip({ foreignPricePerL: v, totalPaidForeign: l * v, useTotalPaidForeign: true })
    } else if (lockedField === 'litersFilled' && t > 0) {
      updateAfterTrip({ foreignPricePerL: v, litersFilled: t / v })
    } else if (lockedField === null && l > 0 && t === 0) {
      updateAfterTrip({ foreignPricePerL: v, totalPaidForeign: l * v, useTotalPaidForeign: true })
      setLockedField('totalPaidForeign')
    } else if (lockedField === null && t > 0 && l === 0) {
      updateAfterTrip({ foreignPricePerL: v, litersFilled: t / v })
      setLockedField('litersFilled')
    } else {
      updateAfterTrip({ foreignPricePerL: v })
    }
  }

  function handleTotalPaidChange(v: number) {
    const l = afterTrip.litersFilled
    const p = afterTrip.foreignPricePerL

    if (v === 0) {
      unlock({ totalPaidForeign: 0, useTotalPaidForeign: false })
      return
    }

    if (lockedField === 'foreignPricePerL' && l > 0) {
      updateAfterTrip({ totalPaidForeign: v, foreignPricePerL: v / l, useTotalPaidForeign: true })
    } else if (lockedField === 'litersFilled' && p > 0) {
      updateAfterTrip({ totalPaidForeign: v, litersFilled: v / p, useTotalPaidForeign: true })
    } else if (lockedField === null && l > 0 && p === 0) {
      updateAfterTrip({ totalPaidForeign: v, foreignPricePerL: v / l, useTotalPaidForeign: true })
      setLockedField('foreignPricePerL')
    } else if (lockedField === null && p > 0 && l === 0) {
      updateAfterTrip({ totalPaidForeign: v, litersFilled: v / p, useTotalPaidForeign: true })
      setLockedField('litersFilled')
    } else {
      updateAfterTrip({ totalPaidForeign: v, useTotalPaidForeign: true })
    }
  }

  function handleReset() {
    setLockedField(null)
    updateAfterTrip({
      litersFilled: defaultAfterTrip.litersFilled,
      extraCanisterLiters: defaultAfterTrip.extraCanisterLiters,
      foreignPricePerL: defaultAfterTrip.foreignPricePerL,
      totalPaidForeign: defaultAfterTrip.totalPaidForeign,
      useTotalPaidForeign: defaultAfterTrip.useTotalPaidForeign,
    })
  }

  return (
    <SectionCard title="Fuel Purchased Abroad" icon={Fuel} accent="amber" onReset={handleReset}>
      {/* Quantity */}
      <InputField
        label="Litres Filled (Tank)"
        value={afterTrip.litersFilled}
        onChange={handleLitersChange}
        unit="L"
        placeholder="40"
        min={0}
        step={0.5}
        locked={lockedField === 'litersFilled'}
        hint="Litres pumped into the vehicle tank"
      />
      <div className="flex flex-col gap-1">
        <InputField
          label="Extra Canister Litres"
          value={afterTrip.extraCanisterLiters}
          onChange={(v) => updateAfterTrip({ extraCanisterLiters: v })}
          unit="L"
          placeholder="0"
          min={0}
          step={0.5}
          hint="Additional fuel carried home in canisters"
        />
        {totalForeignFuelL > 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Total: {totalForeignFuelL.toFixed(1)} L purchased
          </p>
        )}
      </div>

      {/* Price */}
      <InputField
        label="Foreign Price per Litre"
        value={afterTrip.foreignPricePerL}
        onChange={handlePriceChange}
        unit={`${currency}/L`}
        placeholder="1.35"
        min={0}
        step={0.001}
        locked={lockedField === 'foreignPricePerL'}
        hint="Pump price at the foreign station"
      />

      {/* Total paid */}
      <InputField
        label="Total Paid (Receipt)"
        value={afterTrip.totalPaidForeign}
        onChange={handleTotalPaidChange}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.01}
        locked={lockedField === 'totalPaidForeign'}
        hint={
          lockedField === 'totalPaidForeign'
            ? 'Auto-calculated — clear a sibling field to override'
            : 'Enter receipt total to auto-derive missing field'
        }
      />

      {lockedField === null && (
        <div className="sm:col-span-2">
          <Toggle
            checked={afterTrip.useTotalPaidForeign}
            onChange={(v) => updateAfterTrip({ useTotalPaidForeign: v })}
            label="Use actual receipt total"
          />
        </div>
      )}
    </SectionCard>
  )
}

// ─── Section 4: Domestic Baseline ─────────────────────────────────────────────

function DomesticBaselineSection() {
  const { afterTrip, updateAfterTrip, currency } = useCalculatorStore()

  const totalForeignFuelL = afterTrip.litersFilled + afterTrip.extraCanisterLiters
  const domesticEquivalent = totalForeignFuelL * afterTrip.homePricePerL
  const priceDiff = afterTrip.homePricePerL - afterTrip.foreignPricePerL

  function handleReset() {
    updateAfterTrip({ homePricePerL: defaultAfterTrip.homePricePerL })
  }

  return (
    <SectionCard title="Domestic Baseline" icon={Home} accent="brand" onReset={handleReset}>
      <div className="sm:col-span-2 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <InputField
            label="Home Fuel Price"
            value={afterTrip.homePricePerL}
            onChange={(v) => updateAfterTrip({ homePricePerL: v })}
            unit={`${currency}/L`}
            placeholder="1.65"
            min={0}
            step={0.001}
            hint="What you would have paid at your local station"
          />
          {priceDiff !== 0 && (
            <p
              className={[
                'text-xs font-medium',
                priceDiff > 0
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-red-500 dark:text-red-400',
              ].join(' ')}
            >
              {priceDiff > 0
                ? `▼ ${currency}${priceDiff.toFixed(3)}/L cheaper abroad`
                : `▲ ${currency}${Math.abs(priceDiff).toFixed(3)}/L more expensive abroad`}
            </p>
          )}
        </div>

        {/* Hypothetical comparison banner */}
        {totalForeignFuelL > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-brand-50/50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800">
            <Info size={14} className="text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <span className="font-semibold">Hypothetical:</span> buying{' '}
              {formatLitres(totalForeignFuelL)} locally would have cost{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {formatCurrency(domesticEquivalent, currency)}
              </span>
              . The savings calculation compares this to your actual foreign spend + all trip costs.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

// ─── Section 5: Extra Costs ────────────────────────────────────────────────────

function AfterTripExtraCostsSection() {
  const { afterTrip, updateAfterTrip, currency } = useCalculatorStore()

  const total =
    afterTrip.tollCost +
    afterTrip.parkingCost +
    afterTrip.foodCost +
    afterTrip.restroomCost +
    afterTrip.currencyExchangeFee +
    afterTrip.miscCost

  function handleReset() {
    updateAfterTrip({
      tollCost: 0,
      parkingCost: 0,
      foodCost: 0,
      restroomCost: 0,
      currencyExchangeFee: 0,
      miscCost: 0,
    })
  }

  return (
    <SectionCard title="Extra Costs" icon={ReceiptText} accent="purple" onReset={handleReset}>
      <InputField
        label="Toll"
        value={afterTrip.tollCost}
        onChange={(v) => updateAfterTrip({ tollCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.5}
      />
      <InputField
        label="Parking"
        value={afterTrip.parkingCost}
        onChange={(v) => updateAfterTrip({ parkingCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.5}
      />
      <InputField
        label="Food & Drinks"
        value={afterTrip.foodCost}
        onChange={(v) => updateAfterTrip({ foodCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.5}
      />
      <InputField
        label="Restroom"
        value={afterTrip.restroomCost}
        onChange={(v) => updateAfterTrip({ restroomCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.1}
      />
      <InputField
        label="Currency Exchange Fee"
        value={afterTrip.currencyExchangeFee}
        onChange={(v) => updateAfterTrip({ currencyExchangeFee: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.1}
        hint="Bank or card conversion fees"
      />
      <InputField
        label="Misc"
        value={afterTrip.miscCost}
        onChange={(v) => updateAfterTrip({ miscCost: v })}
        unit={currency}
        placeholder="0"
        min={0}
        step={0.5}
        hint="Any other costs"
      />
      {total > 0 && (
        <div className="sm:col-span-2 pt-1 border-t border-purple-100 dark:border-purple-900">
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
            Total extras: {formatCurrency(total, currency)}
          </p>
        </div>
      )}
    </SectionCard>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────────

export function AfterTripForm() {
  return (
    <>
      <ActualTripSection />
      <TankStateSection />
      <FuelAbroadSection />
      <DomesticBaselineSection />
      <AfterTripExtraCostsSection />
    </>
  )
}
