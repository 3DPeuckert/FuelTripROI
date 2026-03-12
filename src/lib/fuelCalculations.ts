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
  AfterTripData,
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

// ─── Planning mode orchestrator ────────────────────────────────────────────────

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

// ─── After-Trip (analysis) mode orchestrator ───────────────────────────────────

/**
 * Run the complete trip calculation for after-trip analysis mode.
 *
 * Key differences from planning mode:
 *
 * 1. Trip fuel cost = outbound leg only, at domestic price.
 *    The outbound leg is driven on expensive home fuel.
 *    The return leg is driven on the cheaper foreign fuel already purchased
 *    (accounted for in foreignRefuelCost / totalPaidForeign), so it is NOT
 *    double-counted as a trip overhead cost.
 *
 * 2. Foreign fuel cost comes from the actual receipt total when
 *    useTotalPaidForeign is true, otherwise calculated from price × litres.
 *
 * 3. Partial tank state is tracked for information and validation but does
 *    not alter the core financial calculation.
 *
 * Formula summary:
 *   outbound_fuel_l    = (distanceToStation / 100) × consumption
 *   outbound_fuel_cost = outbound_fuel_l × homePricePerL
 *   vehicle_wear       = vehicleCostPerKm × actualDistanceTotal
 *   extra_cost_total   = sum of all extra costs
 *   trip_total_cost    = outbound_fuel_cost + vehicle_wear + extra_cost_total
 *   foreign_fuel_cost  = totalPaidForeign OR (totalForeignFuelL × foreignPricePerL)
 *   domestic_equiv     = totalForeignFuelL × homePricePerL
 *   savings            = domestic_equiv − (foreign_fuel_cost + trip_total_cost)
 *   effective_price/L  = (foreign_fuel_cost + trip_total_cost) / totalForeignFuelL
 */
export function calculateAfterTrip(data: AfterTripData): TripCalculationResult {
  // ── Distances ────────────────────────────────────────────────────────────────
  const outboundDistanceKm = data.distanceToStationKm
  const returnDistanceKm = Math.max(0, data.actualDistanceTotalKm - outboundDistanceKm)
  const tripDistanceTotalKm = data.actualDistanceTotalKm

  // ── Fuel consumed during the trip ────────────────────────────────────────────
  const tripFuelUsedL = calcTripFuelUsed(tripDistanceTotalKm, data.actualConsumptionL100km)
  const outboundFuelL = calcTripFuelUsed(outboundDistanceKm, data.actualConsumptionL100km)
  const returnFuelL = Math.max(0, tripFuelUsedL - outboundFuelL)

  // Only the outbound leg is costed at the home price (you left on expensive
  // domestic fuel). The return leg is already captured in foreignRefuelCost.
  const outboundFuelCost = outboundFuelL * data.homePricePerL
  const tripFuelCost = outboundFuelCost

  // ── Foreign fuel purchase ────────────────────────────────────────────────────
  const totalRefuelLiters = data.litersFilled + data.extraCanisterLiters
  const foreignRefuelCost = data.useTotalPaidForeign
    ? data.totalPaidForeign
    : totalRefuelLiters * data.foreignPricePerL

  // ── Domestic comparison ──────────────────────────────────────────────────────
  const homeRefuelCost = totalRefuelLiters * data.homePricePerL

  // ── Trip overhead costs ──────────────────────────────────────────────────────
  const vehicleCostTotal = calcVehicleCostTotal(
    tripDistanceTotalKm,
    data.vehicleCostPerKm,
    data.includeVehicleWear
  )

  const extraCostTotal =
    data.tollCost +
    data.parkingCost +
    data.foodCost +
    data.restroomCost +
    data.currencyExchangeFee +
    data.miscCost

  const tripTotalCost = calcTripTotalCost(tripFuelCost, extraCostTotal, vehicleCostTotal)

  // ── Savings & metrics ────────────────────────────────────────────────────────
  const savings = calcSavings(homeRefuelCost, foreignRefuelCost, tripTotalCost)
  const effectivePricePerL = calcEffectivePricePerL(foreignRefuelCost, tripTotalCost, totalRefuelLiters)
  const roiPercent = calcRoiPercent(savings, foreignRefuelCost)
  const costPerKm = calcCostPerKm(tripTotalCost, tripDistanceTotalKm)

  // ── Tank state (informational) ───────────────────────────────────────────────
  const fuelAtDepartureL = (data.tankLevelAtDeparturePercent / 100) * data.tankCapacityL
  const fuelAfterReturnL = (data.tankLevelAfterReturnPercent / 100) * data.tankCapacityL

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
    afterTripDetail: {
      outboundDistanceKm,
      returnDistanceKm,
      outboundFuelL,
      returnFuelL,
      outboundFuelCost,
      fuelAtDepartureL,
      fuelAfterReturnL,
    },
  }
}

// ─── Mode dispatcher ───────────────────────────────────────────────────────────

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
  afterTrip: AfterTripData
): TripCalculationResult {
  if (mode === 'analysis') {
    return calculateAfterTrip(afterTrip)
  }
  return calculateTrip(vehicle, trip, fuel, extras)
}
