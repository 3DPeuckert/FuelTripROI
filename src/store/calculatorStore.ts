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
  ActualMeasurements,
  FullCalculationResult,
} from '../types/calculatorTypes'
import { runCalculation } from '../lib/fuelCalculations'
import { calculateBreakEven } from '../lib/breakEvenCalculations'

// ─── Default values ────────────────────────────────────────────────────────────

const defaultVehicle: VehicleData = {
  averageConsumptionL100km: 7,
  tankCapacityL: 50,
  currentTankLevelPercent: 30,
  vehicleCostPerKm: 0.08,
  includeVehicleWear: false,
}

const defaultTrip: TripData = {
  distanceToForeignStationKm: 30,
  totalDistanceKm: 60,
  totalDistanceOverridden: false,
  detourDistanceKm: 0,
  borderWaitTimeMinutes: 0,
}

const defaultFuel: FuelData = {
  homeFuelPricePerL: 1.65,
  foreignFuelPricePerL: 1.35,
  litersToRefuelVehicle: 40,
  extraCanisterLiters: 0,
}

const defaultExtraCosts: ExtraCosts = {
  tollCost: 0,
  parkingCost: 0,
  foodCost: 0,
  restroomCost: 0,
  currencyExchangeFee: 0,
  miscCost: 0,
}

const defaultActual: ActualMeasurements = {
  actualFuelUsedL: 0,
  actualForeignPricePerL: 0,
  actualLitersRefuelled: 0,
  overrideFuelUsed: false,
  overrideForeignPrice: false,
  overrideLitersRefuelled: false,
}

// ─── Store interface ───────────────────────────────────────────────────────────

interface CalculatorStore extends CalculatorState {
  // Actions
  setMode: (mode: CalculatorMode) => void
  updateVehicle: (partial: Partial<VehicleData>) => void
  updateTrip: (partial: Partial<TripData>) => void
  updateFuel: (partial: Partial<FuelData>) => void
  updateExtraCosts: (partial: Partial<ExtraCosts>) => void
  updateActual: (partial: Partial<ActualMeasurements>) => void
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
  actual: ActualMeasurements
): FullCalculationResult {
  const tripResult = runCalculation(mode, vehicle, trip, fuel, extras, actual)
  const breakEven = calculateBreakEven(vehicle, trip, fuel, extras)
  const priceDifferencePerL = fuel.homeFuelPricePerL - fuel.foreignFuelPricePerL

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
  actualMeasurements: defaultActual,
  currency: '€',
  result: compute('planning', defaultVehicle, defaultTrip, defaultFuel, defaultExtraCosts, defaultActual),

  setMode: (mode) => {
    set({ mode })
    const s = get()
    set({ result: compute(mode, s.vehicle, s.trip, s.fuel, s.extraCosts, s.actualMeasurements) })
  },

  updateVehicle: (partial) => {
    const vehicle = { ...get().vehicle, ...partial }
    set({ vehicle })
    const s = get()
    set({ result: compute(s.mode, vehicle, s.trip, s.fuel, s.extraCosts, s.actualMeasurements) })
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
    set({ result: compute(s.mode, s.vehicle, trip, s.fuel, s.extraCosts, s.actualMeasurements) })
  },

  updateFuel: (partial) => {
    const fuel = { ...get().fuel, ...partial }
    set({ fuel })
    const s = get()
    set({ result: compute(s.mode, s.vehicle, s.trip, fuel, s.extraCosts, s.actualMeasurements) })
  },

  updateExtraCosts: (partial) => {
    const extraCosts = { ...get().extraCosts, ...partial }
    set({ extraCosts })
    const s = get()
    set({ result: compute(s.mode, s.vehicle, s.trip, s.fuel, extraCosts, s.actualMeasurements) })
  },

  updateActual: (partial) => {
    const actualMeasurements = { ...get().actualMeasurements, ...partial }
    set({ actualMeasurements })
    const s = get()
    set({
      result: compute(s.mode, s.vehicle, s.trip, s.fuel, s.extraCosts, actualMeasurements),
    })
  },

  setCurrency: (currency) => set({ currency }),

  recalculate: () => {
    const s = get()
    set({
      result: compute(s.mode, s.vehicle, s.trip, s.fuel, s.extraCosts, s.actualMeasurements),
    })
  },

  reset: () => {
    const result = compute('planning', defaultVehicle, defaultTrip, defaultFuel, defaultExtraCosts, defaultActual)
    set({
      mode: 'planning',
      vehicle: defaultVehicle,
      trip: defaultTrip,
      fuel: defaultFuel,
      extraCosts: defaultExtraCosts,
      actualMeasurements: defaultActual,
      currency: '€',
      result,
    })
  },
}))
