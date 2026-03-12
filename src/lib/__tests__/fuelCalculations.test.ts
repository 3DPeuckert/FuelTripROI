/**
 * Unit tests for the core fuel calculation engine.
 *
 * Example scenario used across tests:
 *   Vehicle: 7 L/100km, vehicle wear €0.08/km
 *   Trip:    30 km one-way (60 km round-trip)
 *   Fuel:    home €1.65/L, abroad €1.35/L, 40 L to refuel
 *   Extras:  none
 *
 * Manual calculation:
 *   trip_fuel = 60/100 × 7 = 4.2 L
 *   trip_fuel_cost = 4.2 × 1.65 = €6.93
 *   home_refuel = 40 × 1.65 = €66.00
 *   foreign_refuel = 40 × 1.35 = €54.00
 *   vehicle_wear = 60 × 0.08 = €4.80
 *   trip_total = 6.93 + 0 + 4.80 = €11.73
 *   savings = (66 − 54) − 11.73 = 12 − 11.73 = €0.27
 *   effective_price = (54 + 11.73) / 40 = 65.73/40 = €1.6433/L
 *   roi = 0.27 / 54 × 100 ≈ 0.5%
 */

import { describe, it, expect } from 'vitest'
import {
  calcTripDistanceTotal,
  calcTripFuelUsed,
  calcTripFuelCost,
  calcHomeRefuelCost,
  calcForeignRefuelCost,
  calcVehicleCostTotal,
  calcExtraCostTotal,
  calcTripTotalCost,
  calcSavings,
  calcEffectivePricePerL,
  calcRoiPercent,
  calcCostPerKm,
  calculateTrip,
  calculateTripAnalysis,
  calcTotalRefuelLiters,
} from '../fuelCalculations'
import type { VehicleData, TripData, FuelData, ExtraCosts, ActualMeasurements } from '../../types/calculatorTypes'

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const vehicle: VehicleData = {
  averageConsumptionL100km: 7,
  tankCapacityL: 50,
  currentTankLevelPercent: 30,
  vehicleCostPerKm: 0.08,
  includeVehicleWear: true,
}

const trip: TripData = {
  distanceToForeignStationKm: 30,
  totalDistanceKm: 60,
  totalDistanceOverridden: false,
  detourDistanceKm: 0,
  borderWaitTimeMinutes: 0,
}

const fuel: FuelData = {
  homeFuelPricePerL: 1.65,
  foreignFuelPricePerL: 1.35,
  litersToRefuelVehicle: 40,
  extraCanisterLiters: 0,
}

const extras: ExtraCosts = {
  tollCost: 0,
  parkingCost: 0,
  foodCost: 0,
  restroomCost: 0,
  currencyExchangeFee: 0,
  miscCost: 0,
}

const actual: ActualMeasurements = {
  actualFuelUsedL: 0,
  actualForeignPricePerL: 0,
  actualLitersRefuelled: 0,
  overrideFuelUsed: false,
  overrideForeignPrice: false,
  overrideLitersRefuelled: false,
}

// ─── Helper: round to 4 decimals to avoid floating-point noise ────────────────
const r = (n: number) => Math.round(n * 10000) / 10000

// ─── calcTripDistanceTotal ─────────────────────────────────────────────────────

describe('calcTripDistanceTotal', () => {
  it('doubles one-way distance when not overridden', () => {
    expect(calcTripDistanceTotal(trip)).toBe(60)
  })

  it('adds detour to the computed distance', () => {
    const t = { ...trip, detourDistanceKm: 5 }
    expect(calcTripDistanceTotal(t)).toBe(65)
  })

  it('uses totalDistanceKm when overridden', () => {
    const t = { ...trip, totalDistanceOverridden: true, totalDistanceKm: 75 }
    expect(calcTripDistanceTotal(t)).toBe(75)
  })

  it('uses totalDistanceKm + detour when overridden with detour', () => {
    const t = { ...trip, totalDistanceOverridden: true, totalDistanceKm: 75, detourDistanceKm: 10 }
    expect(calcTripDistanceTotal(t)).toBe(85)
  })
})

// ─── calcTripFuelUsed ─────────────────────────────────────────────────────────

describe('calcTripFuelUsed', () => {
  it('calculates fuel used for the trip', () => {
    expect(r(calcTripFuelUsed(60, 7))).toBe(4.2)
  })

  it('returns 0 for zero distance', () => {
    expect(calcTripFuelUsed(0, 7)).toBe(0)
  })

  it('scales linearly with distance', () => {
    expect(r(calcTripFuelUsed(100, 7))).toBe(7)
    expect(r(calcTripFuelUsed(200, 7))).toBe(14)
  })
})

// ─── calcTripFuelCost ─────────────────────────────────────────────────────────

describe('calcTripFuelCost', () => {
  it('multiplies litres by price', () => {
    expect(r(calcTripFuelCost(4.2, 1.65))).toBe(6.93)
  })
})

// ─── calcTotalRefuelLiters ─────────────────────────────────────────────────────

describe('calcTotalRefuelLiters', () => {
  it('sums vehicle and canister litres', () => {
    expect(calcTotalRefuelLiters({ ...fuel, extraCanisterLiters: 10 })).toBe(50)
  })

  it('returns only vehicle litres when no canister', () => {
    expect(calcTotalRefuelLiters(fuel)).toBe(40)
  })
})

// ─── calcHomeRefuelCost ───────────────────────────────────────────────────────

describe('calcHomeRefuelCost', () => {
  it('calculates home refuel cost correctly', () => {
    expect(r(calcHomeRefuelCost(40, 1.65))).toBe(66)
  })
})

// ─── calcForeignRefuelCost ────────────────────────────────────────────────────

describe('calcForeignRefuelCost', () => {
  it('calculates foreign refuel cost correctly', () => {
    expect(r(calcForeignRefuelCost(40, 1.35))).toBe(54)
  })
})

// ─── calcVehicleCostTotal ─────────────────────────────────────────────────────

describe('calcVehicleCostTotal', () => {
  it('calculates vehicle wear cost', () => {
    expect(r(calcVehicleCostTotal(60, 0.08, true))).toBe(4.8)
  })

  it('returns 0 when vehicle wear is disabled', () => {
    expect(calcVehicleCostTotal(60, 0.08, false)).toBe(0)
  })
})

// ─── calcExtraCostTotal ───────────────────────────────────────────────────────

describe('calcExtraCostTotal', () => {
  it('returns 0 for empty extras', () => {
    expect(calcExtraCostTotal(extras)).toBe(0)
  })

  it('sums all extras', () => {
    const e: ExtraCosts = {
      tollCost: 2,
      parkingCost: 1.5,
      foodCost: 5,
      restroomCost: 0.5,
      currencyExchangeFee: 0.3,
      miscCost: 1,
    }
    expect(r(calcExtraCostTotal(e))).toBe(10.3)
  })
})

// ─── calcTripTotalCost ────────────────────────────────────────────────────────

describe('calcTripTotalCost', () => {
  it('sums fuel cost, extras, and vehicle wear', () => {
    expect(r(calcTripTotalCost(6.93, 0, 4.8))).toBe(11.73)
  })

  it('works with non-zero extras', () => {
    expect(r(calcTripTotalCost(6.93, 5, 4.8))).toBe(16.73)
  })
})

// ─── calcSavings ──────────────────────────────────────────────────────────────

describe('calcSavings', () => {
  it('computes positive savings', () => {
    expect(r(calcSavings(66, 54, 11.73))).toBe(0.27)
  })

  it('computes negative savings (loss)', () => {
    // Trip costs more than the fuel saving
    expect(r(calcSavings(66, 54, 20))).toBe(-8)
  })

  it('returns 0 when trip exactly breaks even', () => {
    expect(calcSavings(66, 54, 12)).toBe(0)
  })
})

// ─── calcEffectivePricePerL ───────────────────────────────────────────────────

describe('calcEffectivePricePerL', () => {
  it('computes effective price including trip cost', () => {
    // (54 + 11.73) / 40 = 65.73 / 40 = 1.64325
    expect(r(calcEffectivePricePerL(54, 11.73, 40))).toBe(1.6433)
  })

  it('returns 0 when total refuel litres is 0', () => {
    expect(calcEffectivePricePerL(54, 11.73, 0)).toBe(0)
  })
})

// ─── calcRoiPercent ───────────────────────────────────────────────────────────

describe('calcRoiPercent', () => {
  it('computes positive ROI', () => {
    expect(r(calcRoiPercent(0.27, 54))).toBe(0.5)
  })

  it('computes negative ROI (loss)', () => {
    expect(r(calcRoiPercent(-8, 54))).toBe(-14.8148)
  })

  it('returns 0 when foreign refuel cost is 0', () => {
    expect(calcRoiPercent(5, 0)).toBe(0)
  })
})

// ─── calcCostPerKm ────────────────────────────────────────────────────────────

describe('calcCostPerKm', () => {
  it('divides total cost by distance', () => {
    expect(r(calcCostPerKm(11.73, 60))).toBe(0.1955)
  })

  it('returns 0 for zero distance', () => {
    expect(calcCostPerKm(11.73, 0)).toBe(0)
  })
})

// ─── calculateTrip (orchestrator) ─────────────────────────────────────────────

describe('calculateTrip', () => {
  it('produces correct result for the reference scenario', () => {
    const result = calculateTrip(vehicle, trip, fuel, extras)

    expect(result.tripDistanceTotalKm).toBe(60)
    expect(r(result.tripFuelUsedL)).toBe(4.2)
    expect(r(result.tripFuelCost)).toBe(6.93)
    expect(result.totalRefuelLiters).toBe(40)
    expect(r(result.homeRefuelCost)).toBe(66)
    expect(r(result.foreignRefuelCost)).toBe(54)
    expect(r(result.vehicleCostTotal)).toBe(4.8)
    expect(r(result.extraCostTotal)).toBe(0)
    expect(r(result.tripTotalCost)).toBe(11.73)
    expect(r(result.savings)).toBe(0.27)
    expect(r(result.effectivePricePerL)).toBe(1.6433)
    expect(r(result.roiPercent)).toBe(0.5)
  })

  it('shows a clear loss when the trip is very long', () => {
    const longTrip: TripData = { ...trip, distanceToForeignStationKm: 200 }
    const result = calculateTrip(vehicle, longTrip, fuel, extras)
    expect(result.savings).toBeLessThan(0)
  })

  it('shows larger savings with higher price difference', () => {
    const cheapFuel: FuelData = { ...fuel, foreignFuelPricePerL: 0.90 }
    const result = calculateTrip(vehicle, trip, cheapFuel, extras)
    expect(result.savings).toBeGreaterThan(10)
  })

  it('omits vehicle wear when disabled', () => {
    const noWear: VehicleData = { ...vehicle, includeVehicleWear: false }
    const result = calculateTrip(noWear, trip, fuel, extras)
    expect(result.vehicleCostTotal).toBe(0)
    // Savings should be higher without wear cost
    const withWear = calculateTrip(vehicle, trip, fuel, extras)
    expect(result.savings).toBeGreaterThan(withWear.savings)
  })

  it('correctly accounts for canister litres', () => {
    const withCanister: FuelData = { ...fuel, extraCanisterLiters: 20 }
    const result = calculateTrip(vehicle, trip, withCanister, extras)
    expect(result.totalRefuelLiters).toBe(60)
    expect(r(result.foreignRefuelCost)).toBe(81)
    expect(r(result.homeRefuelCost)).toBe(99)
  })

  it('extra costs reduce savings', () => {
    const withExtras: ExtraCosts = { ...extras, tollCost: 5, foodCost: 10 }
    const result = calculateTrip(vehicle, trip, fuel, withExtras)
    expect(result.extraCostTotal).toBe(15)
    expect(result.savings).toBeLessThan(
      calculateTrip(vehicle, trip, fuel, extras).savings
    )
  })
})

// ─── calculateTripAnalysis ────────────────────────────────────────────────────

describe('calculateTripAnalysis', () => {
  it('uses estimated values when no overrides are set', () => {
    const result = calculateTripAnalysis(vehicle, trip, fuel, extras, actual)
    const baseline = calculateTrip(vehicle, trip, fuel, extras)
    expect(r(result.savings)).toBe(r(baseline.savings))
  })

  it('uses actual fuel used when override is set', () => {
    const actualOverride: ActualMeasurements = {
      ...actual,
      overrideFuelUsed: true,
      actualFuelUsedL: 5, // slightly more than estimated 4.2 L
    }
    const result = calculateTripAnalysis(vehicle, trip, fuel, extras, actualOverride)
    expect(r(result.tripFuelUsedL)).toBe(5)
  })

  it('uses actual foreign price when override is set', () => {
    const actualOverride: ActualMeasurements = {
      ...actual,
      overrideForeignPrice: true,
      actualForeignPricePerL: 1.30, // lower than estimated 1.35
    }
    const result = calculateTripAnalysis(vehicle, trip, fuel, extras, actualOverride)
    expect(r(result.foreignRefuelCost)).toBe(52) // 40 × 1.30
  })

  it('uses actual litres refuelled when override is set', () => {
    const actualOverride: ActualMeasurements = {
      ...actual,
      overrideLitersRefuelled: true,
      actualLitersRefuelled: 45,
    }
    const result = calculateTripAnalysis(vehicle, trip, fuel, extras, actualOverride)
    expect(result.totalRefuelLiters).toBe(45)
  })

  it('all three overrides together produce correct result', () => {
    const actualOverride: ActualMeasurements = {
      overrideFuelUsed: true,
      actualFuelUsedL: 5,
      overrideForeignPrice: true,
      actualForeignPricePerL: 1.30,
      overrideLitersRefuelled: true,
      actualLitersRefuelled: 45,
    }
    const result = calculateTripAnalysis(vehicle, trip, fuel, extras, actualOverride)
    expect(r(result.tripFuelUsedL)).toBe(5)
    expect(r(result.foreignRefuelCost)).toBe(58.5) // 45 × 1.30
    expect(result.totalRefuelLiters).toBe(45)
  })
})
