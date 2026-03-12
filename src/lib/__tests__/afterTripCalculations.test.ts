/**
 * Unit tests for calculateAfterTrip — the real-data after-trip analysis engine.
 *
 * Reference scenario:
 *   Vehicle:     7 L/100km, vehicle wear €0.08/km (enabled)
 *   Distances:   30 km one-way, 60 km round-trip
 *   Tank:        50 L capacity, 30% on departure (15 L), 25% on return (12.5 L)
 *   Foreign:     €1.35/L, 40 L filled, no canister, no receipt override
 *   Home price:  €1.65/L
 *   Extras:      none
 *
 * Manual verification:
 *   outbound_fuel   = (30/100) × 7 = 2.1 L
 *   outbound_cost   = 2.1 × 1.65 = €3.465
 *   trip_fuel_total = (60/100) × 7 = 4.2 L
 *   vehicle_wear    = 60 × 0.08 = €4.80
 *   trip_total_cost = 3.465 + 0 + 4.80 = €8.265
 *   foreign_cost    = 40 × 1.35 = €54.00
 *   domestic_equiv  = 40 × 1.65 = €66.00
 *   savings         = 66 − (54 + 8.265) = €3.735
 *   effective/L     = (54 + 8.265) / 40 = 62.265/40 = €1.5566...
 *   roi             = 3.735 / 54 × 100 ≈ 6.917%
 */

import { describe, it, expect } from 'vitest'
import { calculateAfterTrip } from '../fuelCalculations'
import type { AfterTripData } from '../../types/calculatorTypes'

// ─── Base fixture ──────────────────────────────────────────────────────────────

const base: AfterTripData = {
  actualConsumptionL100km: 7,
  vehicleCostPerKm: 0.08,
  includeVehicleWear: true,

  distanceToStationKm: 30,
  actualDistanceTotalKm: 60,

  tankCapacityL: 50,
  tankLevelAtDeparturePercent: 30,
  tankLevelAfterReturnPercent: 25,

  foreignPricePerL: 1.35,
  litersFilled: 40,
  extraCanisterLiters: 0,
  totalPaidForeign: 0,
  useTotalPaidForeign: false,

  homePricePerL: 1.65,

  tollCost: 0,
  parkingCost: 0,
  foodCost: 0,
  restroomCost: 0,
  currencyExchangeFee: 0,
  miscCost: 0,
}

const r = (n: number) => Math.round(n * 10000) / 10000

// ─── Core metrics ──────────────────────────────────────────────────────────────

describe('calculateAfterTrip — core metrics', () => {
  it('calculates trip distance correctly', () => {
    const res = calculateAfterTrip(base)
    expect(res.tripDistanceTotalKm).toBe(60)
  })

  it('calculates total trip fuel used (both legs)', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.tripFuelUsedL)).toBe(4.2)
  })

  it('calculates outbound fuel cost (home price × outbound leg only)', () => {
    const res = calculateAfterTrip(base)
    // outbound = 2.1 L × €1.65 = €3.465
    expect(r(res.tripFuelCost)).toBe(3.465)
  })

  it('calculates total refuel litres (tank + canister)', () => {
    const res = calculateAfterTrip(base)
    expect(res.totalRefuelLiters).toBe(40)
  })

  it('calculates domestic equivalent cost', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.homeRefuelCost)).toBe(66)
  })

  it('calculates foreign fuel cost from price × litres', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.foreignRefuelCost)).toBe(54)
  })

  it('calculates vehicle wear cost', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.vehicleCostTotal)).toBe(4.8)
  })

  it('calculates trip total cost (outbound fuel + extras + wear)', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.tripTotalCost)).toBe(8.265)
  })

  it('calculates net savings correctly', () => {
    const res = calculateAfterTrip(base)
    // 66 − 54 − 8.265 = 3.735
    expect(r(res.savings)).toBe(3.735)
  })

  it('calculates effective price per litre', () => {
    const res = calculateAfterTrip(base)
    // (54 + 8.265) / 40 = 1.556625
    expect(r(res.effectivePricePerL)).toBe(1.5566)
  })

  it('calculates ROI percentage', () => {
    const res = calculateAfterTrip(base)
    // 3.735 / 54 × 100 ≈ 6.9167%
    expect(r(res.roiPercent)).toBe(6.9167)
  })

  it('calculates cost per km', () => {
    const res = calculateAfterTrip(base)
    // 8.265 / 60 = 0.13775
    expect(r(res.costPerKm)).toBe(0.1378)
  })
})

// ─── After-trip detail (outbound/return split) ────────────────────────────────

describe('calculateAfterTrip — afterTripDetail', () => {
  it('populates afterTripDetail', () => {
    const res = calculateAfterTrip(base)
    expect(res.afterTripDetail).toBeDefined()
  })

  it('outbound distance equals distanceToStationKm', () => {
    const res = calculateAfterTrip(base)
    expect(res.afterTripDetail!.outboundDistanceKm).toBe(30)
  })

  it('return distance equals total minus outbound', () => {
    const res = calculateAfterTrip(base)
    expect(res.afterTripDetail!.returnDistanceKm).toBe(30)
  })

  it('outbound fuel L = (outboundKm/100) × consumption', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.afterTripDetail!.outboundFuelL)).toBe(2.1)
  })

  it('return fuel L = total − outbound', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.afterTripDetail!.returnFuelL)).toBe(2.1)
  })

  it('outbound fuel cost = outboundFuelL × homePricePerL', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.afterTripDetail!.outboundFuelCost)).toBe(3.465)
  })

  it('fuelAtDepartureL = tankCapacity × (departurePct / 100)', () => {
    const res = calculateAfterTrip(base)
    // 50 × 0.30 = 15 L
    expect(res.afterTripDetail!.fuelAtDepartureL).toBe(15)
  })

  it('fuelAfterReturnL = tankCapacity × (returnPct / 100)', () => {
    const res = calculateAfterTrip(base)
    // 50 × 0.25 = 12.5 L
    expect(res.afterTripDetail!.fuelAfterReturnL).toBe(12.5)
  })
})

// ─── Receipt total override ────────────────────────────────────────────────────

describe('calculateAfterTrip — receipt total override', () => {
  it('uses totalPaidForeign when useTotalPaidForeign is true', () => {
    const data: AfterTripData = { ...base, useTotalPaidForeign: true, totalPaidForeign: 52 }
    const res = calculateAfterTrip(data)
    expect(r(res.foreignRefuelCost)).toBe(52)
  })

  it('uses calculated cost when useTotalPaidForeign is false', () => {
    const res = calculateAfterTrip(base)
    expect(r(res.foreignRefuelCost)).toBe(54) // 40 × 1.35
  })

  it('receipt total affects savings calculation', () => {
    const withReceipt: AfterTripData = { ...base, useTotalPaidForeign: true, totalPaidForeign: 50 }
    const res = calculateAfterTrip(withReceipt)
    // savings = 66 − (50 + 8.265) = 7.735
    expect(r(res.savings)).toBe(7.735)
  })
})

// ─── Canister logic ────────────────────────────────────────────────────────────

describe('calculateAfterTrip — canister litres', () => {
  it('includes canister litres in totalRefuelLiters', () => {
    const withCanister: AfterTripData = { ...base, extraCanisterLiters: 20 }
    const res = calculateAfterTrip(withCanister)
    expect(res.totalRefuelLiters).toBe(60)
  })

  it('canister litres scale domestic equivalent cost', () => {
    const withCanister: AfterTripData = { ...base, extraCanisterLiters: 20 }
    const res = calculateAfterTrip(withCanister)
    // 60 × 1.65 = 99
    expect(r(res.homeRefuelCost)).toBe(99)
  })

  it('canister litres scale foreign fuel cost', () => {
    const withCanister: AfterTripData = { ...base, extraCanisterLiters: 20 }
    const res = calculateAfterTrip(withCanister)
    // 60 × 1.35 = 81
    expect(r(res.foreignRefuelCost)).toBe(81)
  })
})

// ─── Vehicle wear ──────────────────────────────────────────────────────────────

describe('calculateAfterTrip — vehicle wear', () => {
  it('omits vehicle wear when disabled', () => {
    const noWear: AfterTripData = { ...base, includeVehicleWear: false }
    const res = calculateAfterTrip(noWear)
    expect(res.vehicleCostTotal).toBe(0)
  })

  it('disabling vehicle wear increases savings', () => {
    const noWear: AfterTripData = { ...base, includeVehicleWear: false }
    const withWear = calculateAfterTrip(base)
    const withoutWear = calculateAfterTrip(noWear)
    expect(withoutWear.savings).toBeGreaterThan(withWear.savings)
  })
})

// ─── Extra costs ───────────────────────────────────────────────────────────────

describe('calculateAfterTrip — extra costs', () => {
  it('sums all extra cost fields', () => {
    const withExtras: AfterTripData = {
      ...base,
      tollCost: 3,
      parkingCost: 2,
      foodCost: 5,
      restroomCost: 0.5,
      currencyExchangeFee: 0.3,
      miscCost: 1,
    }
    const res = calculateAfterTrip(withExtras)
    expect(r(res.extraCostTotal)).toBe(11.8)
  })

  it('extra costs reduce savings', () => {
    const withExtras: AfterTripData = { ...base, tollCost: 10 }
    const baseline = calculateAfterTrip(base)
    const withToll = calculateAfterTrip(withExtras)
    expect(withToll.savings).toBe(baseline.savings - 10)
  })
})

// ─── Edge cases ────────────────────────────────────────────────────────────────

describe('calculateAfterTrip — edge cases', () => {
  it('returns zero savings when trip exactly breaks even', () => {
    // Make foreign price exactly match the break-even
    // savings = domestic − (foreign + tripCost)
    // At break-even: foreign = domestic − tripCost = 66 − 8.265 = 57.735
    // ⇒ price/L = 57.735/40 ≈ 1.4434
    const breakEvenPrice = (66 - 8.265) / 40
    const data: AfterTripData = { ...base, foreignPricePerL: breakEvenPrice }
    const res = calculateAfterTrip(data)
    expect(Math.abs(res.savings)).toBeLessThan(0.0001)
  })

  it('produces a loss when foreign station is far away', () => {
    const longTrip: AfterTripData = { ...base, distanceToStationKm: 150, actualDistanceTotalKm: 300 }
    const res = calculateAfterTrip(longTrip)
    expect(res.savings).toBeLessThan(0)
    expect('isWorthIt' in res).toBe(false) // isWorthIt lives on FullCalculationResult, not here
  })

  it('handles zero litres gracefully (no division by zero)', () => {
    const data: AfterTripData = { ...base, litersFilled: 0, extraCanisterLiters: 0 }
    const res = calculateAfterTrip(data)
    expect(res.effectivePricePerL).toBe(0)
    expect(isFinite(res.roiPercent)).toBe(true)
  })

  it('return distance is never negative', () => {
    // If user enters total distance < one-way distance
    const data: AfterTripData = { ...base, distanceToStationKm: 80, actualDistanceTotalKm: 60 }
    const res = calculateAfterTrip(data)
    expect(res.afterTripDetail!.returnDistanceKm).toBe(0)
  })

  it('isWorthIt is not on TripCalculationResult (lives in FullCalculationResult)', () => {
    const res = calculateAfterTrip(base)
    expect('isWorthIt' in res).toBe(false)
  })
})
