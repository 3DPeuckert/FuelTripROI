/**
 * Global calculator state managed with Zustand.
 *
 * The store owns all input state and the derived calculation result.
 * Components read from the store and call actions to update it.
 * Recalculation is triggered automatically on every state change.
 */

import { create } from 'zustand'
import type {
  CalculatorState,
  CalculatorMode,
  VehicleData,
  TripData,
  FuelData,
  ExtraCosts,
  AfterTripData,
  FullCalculationResult,
} from '../types/calculatorTypes'
import { runCalculation } from '../lib/fuelCalculations'
import { calculateBreakEven } from '../lib/breakEvenCalculations'

// ─── Default values ────────────────────────────────────────────────────────────

export const defaultVehicle: VehicleData = {
  averageConsumptionL100km: 7,
  tankCapacityL: 50,
  currentTankLevelPercent: 30,
  vehicleCostPerKm: 0,
  includeVehicleWear: false,
}

export const defaultTrip: TripData = {
  distanceToForeignStationKm: 30,
  totalDistanceKm: 60,
  totalDistanceOverridden: false,
  detourDistanceKm: 0,
  borderWaitTimeMinutes: 0,
}

export const defaultFuel: FuelData = {
  homeFuelPricePerL: 1.65,
  foreignFuelPricePerL: 1.35,
  litersToRefuelVehicle: 40,
  extraCanisterLiters: 0,
}

export const defaultExtraCosts: ExtraCosts = {
  tollCost: 0,
  parkingCost: 0,
  foodCost: 0,
  restroomCost: 0,
  currencyExchangeFee: 0,
  miscCost: 0,
}

export const defaultAfterTrip: AfterTripData = {
  // Vehicle
  actualConsumptionL100km: 7,
  vehicleCostPerKm: 0,
  includeVehicleWear: false,

  // Trip distances
  distanceToStationKm: 30,
  actualDistanceTotalKm: 60,

  // Tank state
  tankCapacityL: 50,
  tankLevelAtDeparturePercent: 30,
  tankLevelAfterReturnPercent: 25,

  // Fuel purchased abroad
  foreignPricePerL: 1.35,
  litersFilled: 40,
  extraCanisterLiters: 0,
  totalPaidForeign: 0,
  useTotalPaidForeign: false,

  // Domestic comparison
  homePricePerL: 1.65,

  // Extra costs
  tollCost: 0,
  parkingCost: 0,
  foodCost: 0,
  restroomCost: 0,
  currencyExchangeFee: 0,
  miscCost: 0,
}

/** Neutral break-even used in analysis mode (planning-only concept). */
const nullBreakEven = {
  breakEvenPriceDiff: Infinity,
  breakEvenLiters: Infinity,
  breakEvenDistanceKm: Infinity,
}

// ─── Store interface ───────────────────────────────────────────────────────────

interface CalculatorStore extends CalculatorState {
  // Actions
  setMode: (mode: CalculatorMode) => void
  updateVehicle: (partial: Partial<VehicleData>) => void
  updateTrip: (partial: Partial<TripData>) => void
  updateFuel: (partial: Partial<FuelData>) => void
  updateExtraCosts: (partial: Partial<ExtraCosts>) => void
  updateAfterTrip: (partial: Partial<AfterTripData>) => void
  setCurrency: (currency: string) => void
  recalculate: () => void
  reset: () => void
}

// ─── Calculation helper ────────────────────────────────────────────────────────

function compute(
  mode: CalculatorMode,
  vehicle: VehicleData,
  trip: TripData,
  fuel: FuelData,
  extras: ExtraCosts,
  afterTrip: AfterTripData
): FullCalculationResult {
  const tripResult = runCalculation(mode, vehicle, trip, fuel, extras, afterTrip)

  // Break-even is only meaningful in planning mode
  const breakEven =
    mode === 'planning' ? calculateBreakEven(vehicle, trip, fuel, extras) : nullBreakEven

  const priceDifferencePerL =
    mode === 'planning'
      ? fuel.homeFuelPricePerL - fuel.foreignFuelPricePerL
      : afterTrip.homePricePerL - afterTrip.foreignPricePerL

  return {
    trip: tripResult,
    breakEven,
    mode,
    isWorthIt: tripResult.savings > 0,
    priceDifferencePerL,
  }
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  mode: 'planning',
  vehicle: defaultVehicle,
  trip: defaultTrip,
  fuel: defaultFuel,
  extraCosts: defaultExtraCosts,
  afterTrip: defaultAfterTrip,
  currency: '€',
  result: compute('planning', defaultVehicle, defaultTrip, defaultFuel, defaultExtraCosts, defaultAfterTrip),

  setMode: (mode) => {
    set({ mode })
    const s = get()
    set({ result: compute(mode, s.vehicle, s.trip, s.fuel, s.extraCosts, s.afterTrip) })
  },

  updateVehicle: (partial) => {
    const vehicle = { ...get().vehicle, ...partial }
    set({ vehicle })
    const s = get()
    set({ result: compute(s.mode, vehicle, s.trip, s.fuel, s.extraCosts, s.afterTrip) })
  },

  updateTrip: (partial) => {
    const existing = get().trip
    const updated = { ...existing, ...partial }

    // Auto-sync totalDistanceKm if not overridden
    const trip: TripData = updated.totalDistanceOverridden
      ? updated
      : { ...updated, totalDistanceKm: updated.distanceToForeignStationKm * 2 }

    set({ trip })
    const s = get()
    set({ result: compute(s.mode, s.vehicle, trip, s.fuel, s.extraCosts, s.afterTrip) })
  },

  updateFuel: (partial) => {
    const fuel = { ...get().fuel, ...partial }
    set({ fuel })
    const s = get()
    set({ result: compute(s.mode, s.vehicle, s.trip, fuel, s.extraCosts, s.afterTrip) })
  },

  updateExtraCosts: (partial) => {
    const extraCosts = { ...get().extraCosts, ...partial }
    set({ extraCosts })
    const s = get()
    set({ result: compute(s.mode, s.vehicle, s.trip, s.fuel, extraCosts, s.afterTrip) })
  },

  updateAfterTrip: (partial) => {
    const afterTrip = { ...get().afterTrip, ...partial }
    set({ afterTrip })
    const s = get()
    set({ result: compute(s.mode, s.vehicle, s.trip, s.fuel, s.extraCosts, afterTrip) })
  },

  setCurrency: (currency) => set({ currency }),

  recalculate: () => {
    const s = get()
    set({
      result: compute(s.mode, s.vehicle, s.trip, s.fuel, s.extraCosts, s.afterTrip),
    })
  },

  reset: () => {
    const result = compute('planning', defaultVehicle, defaultTrip, defaultFuel, defaultExtraCosts, defaultAfterTrip)
    set({
      mode: 'planning',
      vehicle: defaultVehicle,
      trip: defaultTrip,
      fuel: defaultFuel,
      extraCosts: defaultExtraCosts,
      afterTrip: defaultAfterTrip,
      currency: '€',
      result,
    })
  },
}))
