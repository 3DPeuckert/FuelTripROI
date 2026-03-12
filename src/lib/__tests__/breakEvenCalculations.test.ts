/**
 * Unit tests for the break-even calculation engine.
 */

import { describe, it, expect } from 'vitest'
import {
  calcBreakEvenPriceDiff,
  calcBreakEvenLiters,
  calcBreakEvenDistanceKm,
  calculateBreakEven,
} from '../breakEvenCalculations'
import type { VehicleData, TripData, FuelData, ExtraCosts } from '../../types/calculatorTypes'

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

const r = (n: number) => Math.round(n * 10000) / 10000

// ─── calcBreakEvenPriceDiff ────────────────────────────────────────────────────

describe('calcBreakEvenPriceDiff', () => {
  it('returns trip_cost / litres', () => {
    // trip_cost = 11.73, litres = 40 → 0.29325
    expect(r(calcBreakEvenPriceDiff(11.73, 40))).toBe(0.2933)
  })

  it('returns Infinity when litres is 0', () => {
    expect(calcBreakEvenPriceDiff(11.73, 0)).toBe(Infinity)
  })

  it('returns 0 when trip cost is 0', () => {
    expect(calcBreakEvenPriceDiff(0, 40)).toBe(0)
  })
})

// ─── calcBreakEvenLiters ───────────────────────────────────────────────────────

describe('calcBreakEvenLiters', () => {
  it('returns trip_cost / price_diff', () => {
    // price_diff = 1.65 - 1.35 = 0.30, trip_cost = 11.73
    // break_even = 11.73 / 0.30 = 39.1
    expect(r(calcBreakEvenLiters(11.73, 1.65, 1.35))).toBe(39.1)
  })

  it('returns Infinity when foreign price >= home price', () => {
    expect(calcBreakEvenLiters(11.73, 1.35, 1.35)).toBe(Infinity) // same price
    expect(calcBreakEvenLiters(11.73, 1.35, 1.65)).toBe(Infinity) // more expensive abroad
  })

  it('returns 0 when trip cost is 0', () => {
    expect(calcBreakEvenLiters(0, 1.65, 1.35)).toBe(0)
  })
})

// ─── calcBreakEvenDistanceKm ───────────────────────────────────────────────────

describe('calcBreakEvenDistanceKm', () => {
  it('returns a positive distance for a favorable price difference', () => {
    const d = calcBreakEvenDistanceKm(vehicle, fuel, extras, 40)
    expect(d).toBeGreaterThan(0)
    expect(isFinite(d)).toBe(true)
  })

  it('returns Infinity when foreign price >= home price', () => {
    const expensiveFuel: FuelData = { ...fuel, foreignFuelPricePerL: 1.65 }
    expect(calcBreakEvenDistanceKm(vehicle, expensiveFuel, extras, 40)).toBe(Infinity)
  })

  it('returns smaller distance with fewer litres to refuel', () => {
    const fewLitres = calcBreakEvenDistanceKm(vehicle, fuel, extras, 10)
    const manyLitres = calcBreakEvenDistanceKm(vehicle, fuel, extras, 60)
    expect(manyLitres).toBeGreaterThan(fewLitres)
  })

  it('returns 0 or negative when extras exceed price advantage', () => {
    const heavyExtras: ExtraCosts = {
      tollCost: 100,
      parkingCost: 0,
      foodCost: 0,
      restroomCost: 0,
      currencyExchangeFee: 0,
      miscCost: 0,
    }
    // price advantage for 40L at €0.30/L = €12 < €100 extras → 0
    const d = calcBreakEvenDistanceKm(vehicle, fuel, heavyExtras, 40)
    expect(d).toBe(0)
  })
})

// ─── calculateBreakEven (orchestrator) ───────────────────────────────────────

describe('calculateBreakEven', () => {
  it('returns all three metrics for the reference scenario', () => {
    const result = calculateBreakEven(vehicle, trip, fuel, extras)

    // breakEvenPriceDiff: trip_total(11.73) / 40L ≈ 0.2933
    expect(r(result.breakEvenPriceDiff)).toBe(0.2933)

    // breakEvenLiters: 11.73 / 0.30 = 39.1
    expect(r(result.breakEvenLiters)).toBe(39.1)

    // breakEvenDistanceKm: should be positive and finite
    expect(result.breakEvenDistanceKm).toBeGreaterThan(0)
    expect(isFinite(result.breakEvenDistanceKm)).toBe(true)
  })

  it('breakEvenLiters is less than actual litres when trip is profitable', () => {
    const result = calculateBreakEven(vehicle, trip, fuel, extras)
    // We refuel 40L, break-even is ≈39.1L → trip IS profitable
    expect(result.breakEvenLiters).toBeLessThan(fuel.litersToRefuelVehicle)
  })

  it('breakEvenLiters is more than actual litres when trip is loss-making', () => {
    const shortFuel: FuelData = { ...fuel, litersToRefuelVehicle: 10 }
    const result = calculateBreakEven(vehicle, trip, shortFuel, extras)
    const totalRefuel = 10 // same as fuel.litersToRefuelVehicle (no canister)
    expect(result.breakEvenLiters).toBeGreaterThan(totalRefuel)
  })

  it('handles no vehicle wear gracefully', () => {
    const noWear: VehicleData = { ...vehicle, includeVehicleWear: false }
    const result = calculateBreakEven(noWear, trip, fuel, extras)
    // Without wear, trip is cheaper → breakEven thresholds are lower
    const withWear = calculateBreakEven(vehicle, trip, fuel, extras)
    expect(result.breakEvenPriceDiff).toBeLessThan(withWear.breakEvenPriceDiff)
  })
})
