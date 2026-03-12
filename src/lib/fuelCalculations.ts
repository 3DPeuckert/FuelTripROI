/**
 * Core fuel trip calculation engine.
 *
 * All business logic is isolated here so that:
 * - UI components remain display-only
 * - Functions are unit-testable without DOM dependencies
 * - Formulas can be audited and verified independently
 */

import type {
  VehicleData,
  TripData,
  FuelData,
  ExtraCosts,
  ActualMeasurements,
  TripCalculationResult,
  CalculatorMode,
} from '../types/calculatorTypes'

// ─── Derived trip values ───────────────────────────────────────────────────────

/**
 * Calculate the effective total trip distance.
 * If the user has overridden the total, use that; otherwise compute round-trip.
 */
export function calcTripDistanceTotal(trip: TripData): number {
  if (trip.totalDistanceOverridden) {
    return trip.totalDistanceKm + trip.detourDistanceKm
  }
  return trip.distanceToForeignStationKm * 2 + trip.detourDistanceKm
}

/**
 * Calculate fuel consumed by the vehicle during the trip itself.
 * Does NOT include the fuel being purchased abroad.
 */
export function calcTripFuelUsed(
  tripDistanceTotalKm: number,
  averageConsumptionL100km: number
): number {
  return (tripDistanceTotalKm / 100) * averageConsumptionL100km
}

// ─── Refuelling quantities ─────────────────────────────────────────────────────

/**
 * Total litres that will be purchased abroad (vehicle tank + canisters).
 */
export function calcTotalRefuelLiters(fuel: FuelData): number {
  return fuel.litersToRefuelVehicle + fuel.extraCanisterLiters
}

// ─── Cost calculations ─────────────────────────────────────────────────────────

/**
 * Cost of the trip fuel using home-country price.
 * This is the fuel burned driving to the station and back.
 */
export function calcTripFuelCost(tripFuelUsedL: number, homeFuelPricePerL: number): number {
  return tripFuelUsedL * homeFuelPricePerL
}

/**
 * Cost if the refuel quantity were purchased at the home price.
 */
export function calcHomeRefuelCost(totalRefuelLiters: number, homeFuelPricePerL: number): number {
  return totalRefuelLiters * homeFuelPricePerL
}

/**
 * Actual cost of refuelling abroad.
 */
export function calcForeignRefuelCost(
  totalRefuelLiters: number,
  foreignFuelPricePerL: number
): number {
  return totalRefuelLiters * foreignFuelPricePerL
}

/**
 * Total vehicle operating cost for the trip distance.
 * Returns 0 if vehicle wear is not enabled.
 */
export function calcVehicleCostTotal(
  tripDistanceTotalKm: number,
  vehicleCostPerKm: number,
  includeVehicleWear: boolean
): number {
  if (!includeVehicleWear) return 0
  return vehicleCostPerKm * tripDistanceTotalKm
}

/**
 * Sum of all optional extra costs.
 */
export function calcExtraCostTotal(extras: ExtraCosts): number {
  return (
    extras.tollCost +
    extras.parkingCost +
    extras.foodCost +
    extras.restroomCost +
    extras.currencyExchangeFee +
    extras.miscCost
  )
}

/**
 * Total cost of making the trip (travel fuel + extras + vehicle wear).
 * Does NOT include the foreign fuel purchase itself.
 */
export function calcTripTotalCost(
  tripFuelCost: number,
  extraCostTotal: number,
  vehicleCostTotal: number
): number {
  return tripFuelCost + extraCostTotal + vehicleCostTotal
}

// ─── Savings & ROI ─────────────────────────────────────────────────────────────

/**
 * Net financial savings.
 * Positive = money saved. Negative = money lost.
 *
 * savings = (home_refuel_cost - foreign_refuel_cost) - trip_total_cost
 */
export function calcSavings(
  homeRefuelCost: number,
  foreignRefuelCost: number,
  tripTotalCost: number
): number {
  return homeRefuelCost - foreignRefuelCost - tripTotalCost
}

/**
 * True cost per litre of the purchased fuel including all trip costs.
 *
 * effective_price = (foreign_refuel_cost + trip_total_cost) / total_refuel_liters
 */
export function calcEffectivePricePerL(
  foreignRefuelCost: number,
  tripTotalCost: number,
  totalRefuelLiters: number
): number {
  if (totalRefuelLiters === 0) return 0
  return (foreignRefuelCost + tripTotalCost) / totalRefuelLiters
}

/**
 * Return on investment as a percentage.
 * Measures how much you save relative to the cost of the foreign fuel purchase.
 *
 * roi = (savings / foreign_refuel_cost) × 100
 */
export function calcRoiPercent(savings: number, foreignRefuelCost: number): number {
  if (foreignRefuelCost === 0) return 0
  return (savings / foreignRefuelCost) * 100
}

/**
 * Total trip cost divided by kilometres driven.
 */
export function calcCostPerKm(tripTotalCost: number, tripDistanceTotalKm: number): number {
  if (tripDistanceTotalKm === 0) return 0
  return tripTotalCost / tripDistanceTotalKm
}

// ─── Orchestrator ──────────────────────────────────────────────────────────────

/**
 * Run the complete trip calculation for planning mode (estimated values).
 */
export function calculateTrip(
  vehicle: VehicleData,
  trip: TripData,
  fuel: FuelData,
  extras: ExtraCosts
): TripCalculationResult {
  const tripDistanceTotalKm = calcTripDistanceTotal(trip)
  const tripFuelUsedL = calcTripFuelUsed(tripDistanceTotalKm, vehicle.averageConsumptionL100km)
  const tripFuelCost = calcTripFuelCost(tripFuelUsedL, fuel.homeFuelPricePerL)

  const totalRefuelLiters = calcTotalRefuelLiters(fuel)
  const homeRefuelCost = calcHomeRefuelCost(totalRefuelLiters, fuel.homeFuelPricePerL)
  const foreignRefuelCost = calcForeignRefuelCost(totalRefuelLiters, fuel.foreignFuelPricePerL)

  const vehicleCostTotal = calcVehicleCostTotal(
    tripDistanceTotalKm,
    vehicle.vehicleCostPerKm,
    vehicle.includeVehicleWear
  )
  const extraCostTotal = calcExtraCostTotal(extras)
  const tripTotalCost = calcTripTotalCost(tripFuelCost, extraCostTotal, vehicleCostTotal)

  const savings = calcSavings(homeRefuelCost, foreignRefuelCost, tripTotalCost)
  const effectivePricePerL = calcEffectivePricePerL(
    foreignRefuelCost,
    tripTotalCost,
    totalRefuelLiters
  )
  const roiPercent = calcRoiPercent(savings, foreignRefuelCost)
  const costPerKm = calcCostPerKm(tripTotalCost, tripDistanceTotalKm)

  return {
    tripDistanceTotalKm,
    tripFuelUsedL,
    tripFuelCost,
    totalRefuelLiters,
    homeRefuelCost,
    foreignRefuelCost,
    vehicleCostTotal,
    extraCostTotal,
    tripTotalCost,
    savings,
    effectivePricePerL,
    roiPercent,
    costPerKm,
  }
}

/**
 * Run the complete trip calculation for analysis mode (actual measured values).
 * Overrides estimated values with actuals where the user has provided them.
 */
export function calculateTripAnalysis(
  vehicle: VehicleData,
  trip: TripData,
  fuel: FuelData,
  extras: ExtraCosts,
  actual: ActualMeasurements
): TripCalculationResult {
  const tripDistanceTotalKm = calcTripDistanceTotal(trip)

  const tripFuelUsedL = actual.overrideFuelUsed
    ? actual.actualFuelUsedL
    : calcTripFuelUsed(tripDistanceTotalKm, vehicle.averageConsumptionL100km)

  const tripFuelCost = calcTripFuelCost(tripFuelUsedL, fuel.homeFuelPricePerL)

  const effectiveForeignPrice = actual.overrideForeignPrice
    ? actual.actualForeignPricePerL
    : fuel.foreignFuelPricePerL

  const effectiveRefuelLiters = actual.overrideLitersRefuelled
    ? actual.actualLitersRefuelled
    : fuel.litersToRefuelVehicle + fuel.extraCanisterLiters

  const totalRefuelLiters = effectiveRefuelLiters
  const homeRefuelCost = calcHomeRefuelCost(totalRefuelLiters, fuel.homeFuelPricePerL)
  const foreignRefuelCost = calcForeignRefuelCost(totalRefuelLiters, effectiveForeignPrice)

  const vehicleCostTotal = calcVehicleCostTotal(
    tripDistanceTotalKm,
    vehicle.vehicleCostPerKm,
    vehicle.includeVehicleWear
  )
  const extraCostTotal = calcExtraCostTotal(extras)
  const tripTotalCost = calcTripTotalCost(tripFuelCost, extraCostTotal, vehicleCostTotal)

  const savings = calcSavings(homeRefuelCost, foreignRefuelCost, tripTotalCost)
  const effectivePricePerL = calcEffectivePricePerL(
    foreignRefuelCost,
    tripTotalCost,
    totalRefuelLiters
  )
  const roiPercent = calcRoiPercent(savings, foreignRefuelCost)
  const costPerKm = calcCostPerKm(tripTotalCost, tripDistanceTotalKm)

  return {
    tripDistanceTotalKm,
    tripFuelUsedL,
    tripFuelCost,
    totalRefuelLiters,
    homeRefuelCost,
    foreignRefuelCost,
    vehicleCostTotal,
    extraCostTotal,
    tripTotalCost,
    savings,
    effectivePricePerL,
    roiPercent,
    costPerKm,
  }
}

/**
 * Convenience dispatcher that selects the correct calculation function
 * based on the active mode.
 */
export function runCalculation(
  mode: CalculatorMode,
  vehicle: VehicleData,
  trip: TripData,
  fuel: FuelData,
  extras: ExtraCosts,
  actual: ActualMeasurements
): TripCalculationResult {
  if (mode === 'analysis') {
    return calculateTripAnalysis(vehicle, trip, fuel, extras, actual)
  }
  return calculateTrip(vehicle, trip, fuel, extras)
}
