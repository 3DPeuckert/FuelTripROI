// ─── Calculator Mode ───────────────────────────────────────────────────────────

export type CalculatorMode = 'planning' | 'analysis'

// ─── Vehicle Data (planning mode) ─────────────────────────────────────────────

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

// ─── Trip Data (planning mode) ─────────────────────────────────────────────────

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

// ─── Fuel Data (planning mode) ─────────────────────────────────────────────────

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

// ─── Extra Costs (shared by both modes) ───────────────────────────────────────

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

// ─── After-Trip Data (analysis mode) ──────────────────────────────────────────

export interface AfterTripData {
  // ── Vehicle ─────────────────────────────────────────────────────────────────
  /** Actual measured fuel consumption for this trip (L/100km) */
  actualConsumptionL100km: number
  /** Vehicle operating cost per km (maintenance, tires, oil, depreciation) */
  vehicleCostPerKm: number
  /** Whether to include vehicle wear cost */
  includeVehicleWear: boolean

  // ── Trip distances ───────────────────────────────────────────────────────────
  /** One-way distance driven to the foreign station (km) */
  distanceToStationKm: number
  /**
   * Total actual distance driven (km).
   * Return leg = actualDistanceTotalKm − distanceToStationKm
   */
  actualDistanceTotalKm: number

  // ── Tank state (partial tank logic) ─────────────────────────────────────────
  /** Tank capacity in litres */
  tankCapacityL: number
  /** Tank fill level when leaving home (0–100 %) */
  tankLevelAtDeparturePercent: number
  /** Tank fill level on arriving home (0–100 %) */
  tankLevelAfterReturnPercent: number

  // ── Fuel purchased abroad ────────────────────────────────────────────────────
  /** Price per litre at the foreign pump */
  foreignPricePerL: number
  /** Litres pumped into the vehicle tank abroad */
  litersFilled: number
  /** Extra litres carried in canisters */
  extraCanisterLiters: number
  /**
   * Actual total amount shown on the receipt.
   * When useTotalPaidForeign is true, this overrides the calculated cost.
   */
  totalPaidForeign: number
  /**
   * If true, use totalPaidForeign as the foreign fuel cost.
   * If false, calculate from foreignPricePerL × total litres.
   */
  useTotalPaidForeign: boolean

  // ── Domestic comparison ──────────────────────────────────────────────────────
  /** Fuel price at home station (for the domestic equivalent comparison) */
  homePricePerL: number

  // ── Extra costs ──────────────────────────────────────────────────────────────
  tollCost: number
  parkingCost: number
  foodCost: number
  restroomCost: number
  currencyExchangeFee: number
  miscCost: number
}

// ─── Calculation Results ───────────────────────────────────────────────────────

export interface TripCalculationResult {
  // ── Derived trip data ────────────────────────────────────────────────────────
  /** Effective total trip distance */
  tripDistanceTotalKm: number
  /** Fuel used during the trip itself (not including purchased fuel) */
  tripFuelUsedL: number
  /**
   * Fuel cost attributed to the trip.
   * Planning: all trip fuel at home price.
   * Analysis: outbound leg fuel at home price only.
   */
  tripFuelCost: number

  // ── Refuelling costs ─────────────────────────────────────────────────────────
  /** Total litres purchased abroad (tank + canisters) */
  totalRefuelLiters: number
  /** What the same quantity would cost at the domestic price */
  homeRefuelCost: number
  /** Actual cost of the foreign fuel purchase */
  foreignRefuelCost: number

  // ── Costs ────────────────────────────────────────────────────────────────────
  /** Total vehicle wear cost */
  vehicleCostTotal: number
  /** Sum of all extra costs */
  extraCostTotal: number
  /** Total trip overhead (trip fuel + extras + vehicle wear) */
  tripTotalCost: number

  // ── Result metrics ────────────────────────────────────────────────────────────
  /** Net savings (positive) or loss (negative) */
  savings: number
  /** True cost per litre including all trip overhead */
  effectivePricePerL: number
  /** Trip ROI as a percentage */
  roiPercent: number
  /** Trip overhead cost per kilometre driven */
  costPerKm: number

  // ── After-trip detail (only populated in analysis mode) ───────────────────────
  afterTripDetail?: AfterTripDetail
}

/** Extra breakdown fields produced exclusively by calculateAfterTrip. */
export interface AfterTripDetail {
  outboundDistanceKm: number
  returnDistanceKm: number
  outboundFuelL: number
  returnFuelL: number
  outboundFuelCost: number
  /** Litres in tank when leaving home */
  fuelAtDepartureL: number
  /** Litres in tank on arriving home */
  fuelAfterReturnL: number
}

export interface BreakEvenResult {
  /** Minimum price difference per litre to break even */
  breakEvenPriceDiff: number
  /** Minimum litres needed to refuel to break even */
  breakEvenLiters: number
  /** Minimum distance at which the trip is worthwhile */
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
  afterTrip: AfterTripData
  currency: string
  result: FullCalculationResult | null
}
