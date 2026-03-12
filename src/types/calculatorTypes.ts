// ─── Calculator Mode ───────────────────────────────────────────────────────────

export type CalculatorMode = 'planning' | 'analysis'

// ─── Vehicle Data ──────────────────────────────────────────────────────────────

export interface VehicleData {
  /** Average fuel consumption in litres per 100 km */
  averageConsumptionL100km: number
  /** Total tank capacity in litres */
  tankCapacityL: number
  /** Current tank level as a percentage (0–100) */
  currentTankLevelPercent: number
  /**
   * Optional vehicle operating cost per km.
   * Covers maintenance, tires, oil, and depreciation.
   * Default: 0.08 €/km
   */
  vehicleCostPerKm: number
  /** Whether to include vehicle wear cost in calculations */
  includeVehicleWear: boolean
}

// ─── Trip Data ─────────────────────────────────────────────────────────────────

export interface TripData {
  /** One-way distance to the foreign fuel station in km */
  distanceToForeignStationKm: number
  /**
   * Total round-trip distance in km.
   * Defaults to distanceToForeignStationKm × 2.
   */
  totalDistanceKm: number
  /** Whether the user has manually overridden totalDistanceKm */
  totalDistanceOverridden: boolean
  /** Optional extra detour distance in km */
  detourDistanceKm: number
  /** Estimated border wait time in minutes (informational) */
  borderWaitTimeMinutes: number
}

// ─── Fuel Data ─────────────────────────────────────────────────────────────────

export interface FuelData {
  /** Fuel price at home country per litre */
  homeFuelPricePerL: number
  /** Fuel price at foreign country per litre */
  foreignFuelPricePerL: number
  /** Litres to refuel into the vehicle */
  litersToRefuelVehicle: number
  /** Extra litres carried in canisters */
  extraCanisterLiters: number
}

// ─── Extra Costs ───────────────────────────────────────────────────────────────

export interface ExtraCosts {
  /** Road toll costs */
  tollCost: number
  /** Parking costs */
  parkingCost: number
  /** Food and drink costs */
  foodCost: number
  /** Restroom / hygiene costs */
  restroomCost: number
  /** Currency exchange fees */
  currencyExchangeFee: number
  /** Miscellaneous other costs */
  miscCost: number
}

// ─── Analysis-mode actual measurements ────────────────────────────────────────

export interface ActualMeasurements {
  /** Actual fuel used during the trip (measured, not calculated) */
  actualFuelUsedL: number
  /** Actual fuel price paid abroad */
  actualForeignPricePerL: number
  /** Actual litres refuelled */
  actualLitersRefuelled: number
  /** Whether to override calculated fuel usage with actual */
  overrideFuelUsed: boolean
  /** Whether to override foreign price with actual paid price */
  overrideForeignPrice: boolean
  /** Whether to override litres refuelled with actual amount */
  overrideLitersRefuelled: boolean
}

// ─── Calculation Results ───────────────────────────────────────────────────────

export interface TripCalculationResult {
  // ── Derived trip data ────────────────────────────────────────────────────────
  /** Effective trip distance including detour */
  tripDistanceTotalKm: number
  /** Fuel used during the trip itself */
  tripFuelUsedL: number
  /** Cost of fuel used for the trip (at home price) */
  tripFuelCost: number

  // ── Refuelling costs ─────────────────────────────────────────────────────────
  /** Total litres being refuelled (vehicle + canisters) */
  totalRefuelLiters: number
  /** Cost of the same fuel quantity at home */
  homeRefuelCost: number
  /** Cost of refuelling abroad */
  foreignRefuelCost: number

  // ── Costs ────────────────────────────────────────────────────────────────────
  /** Total vehicle wear cost for the trip */
  vehicleCostTotal: number
  /** Sum of all extra costs */
  extraCostTotal: number
  /** Total trip cost (fuel + extras + vehicle wear) */
  tripTotalCost: number

  // ── Result metrics ───────────────────────────────────────────────────────────
  /** Net savings (positive) or loss (negative) */
  savings: number
  /** True cost per litre including all trip costs */
  effectivePricePerL: number
  /** Trip ROI as a percentage */
  roiPercent: number
  /** Cost per km of the trip */
  costPerKm: number
}

export interface BreakEvenResult {
  /** Minimum price difference per litre to break even */
  breakEvenPriceDiff: number
  /** Minimum litres needed to refuel to break even */
  breakEvenLiters: number
  /** Minimum distance that makes the trip worthwhile */
  breakEvenDistanceKm: number
}

export interface FullCalculationResult {
  trip: TripCalculationResult
  breakEven: BreakEvenResult
  mode: CalculatorMode
  isWorthIt: boolean
  priceDifferencePerL: number
}

// ─── Full calculator state ─────────────────────────────────────────────────────

export interface CalculatorState {
  mode: CalculatorMode
  vehicle: VehicleData
  trip: TripData
  fuel: FuelData
  extraCosts: ExtraCosts
  actualMeasurements: ActualMeasurements
  currency: string
  result: FullCalculationResult | null
}
