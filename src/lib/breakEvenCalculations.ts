/**
 * Break-even calculation engine.
 *
 * Answers three related questions:
 * 1. What is the minimum price-per-litre difference to justify the trip?
 * 2. How many litres must be purchased to break even?
 * 3. How far away can the station be and still be worth the trip?
 */

import type { VehicleData, TripData, FuelData, ExtraCosts, BreakEvenResult } from '../types/calculatorTypes'
import {
  calcTripDistanceTotal,
  calcExtraCostTotal,
  calcVehicleCostTotal,
  calcTripFuelUsed,
  calcTripFuelCost,
} from './fuelCalculations'

// ─── Individual break-even helpers ────────────────────────────────────────────

/**
 * Minimum price difference per litre (home − foreign) needed to cover all trip
 * costs for a given refuel quantity.
 *
 * break_even_diff = trip_total_cost / total_refuel_liters
 */
export function calcBreakEvenPriceDiff(
  tripTotalCost: number,
  totalRefuelLiters: number
): number {
  if (totalRefuelLiters === 0) return Infinity
  return tripTotalCost / totalRefuelLiters
}

/**
 * Minimum litres to purchase so that the price advantage covers the trip cost.
 *
 * break_even_liters = trip_total_cost / (home_price - foreign_price)
 *
 * Returns Infinity when foreign price >= home price (no advantage exists).
 */
export function calcBreakEvenLiters(
  tripTotalCost: number,
  homeFuelPricePerL: number,
  foreignFuelPricePerL: number
): number {
  const diff = homeFuelPricePerL - foreignFuelPricePerL
  if (diff <= 0) return Infinity
  return tripTotalCost / diff
}

/**
 * Maximum one-way distance (km) at which the trip still breaks even for a
 * given refuel quantity and price difference.
 *
 * Derivation:
 *   savings = price_diff × liters − trip_cost
 *   trip_cost = (d/100 × consumption × home_price) + extras + (d × cost_per_km)
 *   Setting savings = 0 and solving for d (one-way distance = total_distance/2):
 *
 *   price_diff × liters = (2d/100 × consumption × home_price) + extras + (2d × cost_per_km)
 *   price_diff × liters − extras = d × (2/100 × consumption × home_price + 2 × cost_per_km)
 *
 * Returns Infinity when price difference <= 0.
 */
export function calcBreakEvenDistanceKm(
  vehicle: VehicleData,
  fuel: FuelData,
  extras: ExtraCosts,
  totalRefuelLiters: number
): number {
  const priceDiff = fuel.homeFuelPricePerL - fuel.foreignFuelPricePerL
  if (priceDiff <= 0) return Infinity

  const extraCostTotal = calcExtraCostTotal(extras)

  // Coefficient of one-way distance in total trip cost (for round-trip × 2)
  const fuelCostPerKm = (vehicle.averageConsumptionL100km / 100) * fuel.homeFuelPricePerL
  const wearCostPerKm = vehicle.includeVehicleWear ? vehicle.vehicleCostPerKm : 0
  const variableCostPerOneWayKm = 2 * (fuelCostPerKm + wearCostPerKm)

  const numerator = priceDiff * totalRefuelLiters - extraCostTotal
  if (numerator <= 0) return 0

  return numerator / variableCostPerOneWayKm
}

// ─── Orchestrator ──────────────────────────────────────────────────────────────

/**
 * Compute all three break-even metrics in one call.
 */
export function calculateBreakEven(
  vehicle: VehicleData,
  trip: TripData,
  fuel: FuelData,
  extras: ExtraCosts
): BreakEvenResult {
  const tripDistanceTotalKm = calcTripDistanceTotal(trip)
  const tripFuelUsedL = calcTripFuelUsed(tripDistanceTotalKm, vehicle.averageConsumptionL100km)
  const tripFuelCost = calcTripFuelCost(tripFuelUsedL, fuel.homeFuelPricePerL)
  const vehicleCostTotal = calcVehicleCostTotal(
    tripDistanceTotalKm,
    vehicle.vehicleCostPerKm,
    vehicle.includeVehicleWear
  )
  const extraCostTotal = calcExtraCostTotal(extras)
  const tripTotalCost = tripFuelCost + extraCostTotal + vehicleCostTotal

  const totalRefuelLiters = fuel.litersToRefuelVehicle + fuel.extraCanisterLiters

  const breakEvenPriceDiff = calcBreakEvenPriceDiff(tripTotalCost, totalRefuelLiters)
  const breakEvenLiters = calcBreakEvenLiters(
    tripTotalCost,
    fuel.homeFuelPricePerL,
    fuel.foreignFuelPricePerL
  )
  const breakEvenDistanceKm = calcBreakEvenDistanceKm(vehicle, fuel, extras, totalRefuelLiters)

  return {
    breakEvenPriceDiff,
    breakEvenLiters,
    breakEvenDistanceKm,
  }
}
