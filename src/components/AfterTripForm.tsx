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

import { Car, MapPin, Fuel, Home, ReceiptText, Info } from 'lucide-react'
import { useCalculatorStore } from '../store/calculatorStore'
import { SectionCard } from './ui/SectionCard'
import { InputField } from './ui/InputField'
import { Toggle } from './ui/Toggle'
import { formatCurrency, formatLitres } from '../utils/formatters'

// ─── Section 1: Actual Trip Data ───────────────────────────────────────────────

function ActualTripSection() {
  const { afterTrip, updateAfterTrip } = useCalculatorStore()

  const returnDistanceKm = Math.max(0, afterTrip.actualDistanceTotalKm - afterTrip.distanceToStationKm)

  return (
    <SectionCard title="Actual Trip Data" icon={Car} accent="blue">
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
          onChange={(v) => updateAfterTrip({ distanceToStationKm: v })}
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
          onChange={(v) => updateAfterTrip({ actualDistanceTotalKm: v })}
          unit="km"
          placeholder="60"
          min={0}
          step={0.5}
          hint="Full round-trip distance actually driven (odometer)"
        />
        {returnDistanceKm > 0 && (
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

  return (
    <SectionCard title="Tank State" icon={MapPin} accent="brand">
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

function FuelAbroadSection() {
  const { afterTrip, updateAfterTrip, currency } = useCalculatorStore()

  const totalForeignFuelL = afterTrip.litersFilled + afterTrip.extraCanisterLiters
  const calculatedCost = totalForeignFuelL * afterTrip.foreignPricePerL

  return (
    <SectionCard title="Fuel Purchased Abroad" icon={Fuel} accent="amber">
      {/* Quantity */}
      <InputField
        label="Litres Filled (Tank)"
        value={afterTrip.litersFilled}
        onChange={(v) => updateAfterTrip({ litersFilled: v })}
        unit="L"
        placeholder="40"
        min={0}
        step={0.5}
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
        onChange={(v) => updateAfterTrip({ foreignPricePerL: v })}
        unit={`${currency}/L`}
        placeholder="1.35"
        min={0}
        step={0.001}
        hint="Pump price at the foreign station"
      />

      {/* Total paid toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <InputField
            label="Total Paid (Receipt)"
            value={afterTrip.totalPaidForeign}
            onChange={(v) => updateAfterTrip({ totalPaidForeign: v })}
            unit={currency}
            placeholder={calculatedCost > 0 ? calculatedCost.toFixed(2) : '0'}
            min={0}
            step={0.01}
            disabled={!afterTrip.useTotalPaidForeign}
            hint={
              afterTrip.useTotalPaidForeign
                ? 'Actual amount from your receipt'
                : `Calculated: ${formatCurrency(calculatedCost, currency)}`
            }
          />
        </div>
        <Toggle
          checked={afterTrip.useTotalPaidForeign}
          onChange={(v) => updateAfterTrip({ useTotalPaidForeign: v })}
          label="Use actual receipt total"
        />
      </div>
    </SectionCard>
  )
}

// ─── Section 4: Domestic Baseline ─────────────────────────────────────────────

function DomesticBaselineSection() {
  const { afterTrip, updateAfterTrip, currency } = useCalculatorStore()

  const totalForeignFuelL = afterTrip.litersFilled + afterTrip.extraCanisterLiters
  const domesticEquivalent = totalForeignFuelL * afterTrip.homePricePerL
  const priceDiff = afterTrip.homePricePerL - afterTrip.foreignPricePerL

  return (
    <SectionCard title="Domestic Baseline" icon={Home} accent="brand">
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

  return (
    <SectionCard title="Extra Costs" icon={ReceiptText} accent="purple">
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
