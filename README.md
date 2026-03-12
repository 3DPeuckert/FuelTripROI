# ⛽ FuelTripROI

**Is it really worth driving to another country for cheaper fuel?**

FuelTripROI is an open-source web calculator that gives you a true, honest answer — accounting for travel fuel consumption, vehicle wear, tolls, food, and every other hidden cost that erodes your apparent savings.

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Live Demo](#live-demo)
- [How It Works](#how-it-works)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [Core Formulas](#core-formulas)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Two Calculator Modes

| Mode | Description |
|------|-------------|
| **Trip Planning** | Enter estimated values *before* you drive to decide whether the trip is worth it |
| **Trip Analysis** | Enter real measured values *after* you return to calculate your actual savings |

### Core Calculations

- Trip fuel consumption (estimated or measured)
- True cost of refuelling abroad vs. at home
- Vehicle wear cost (maintenance, tires, oil, depreciation)
- All extra costs: toll, parking, food, restroom, currency exchange fees
- **Net savings or loss**
- **Effective fuel price per litre** (including all trip costs)
- **Trip ROI percentage**

### Break-Even Analysis

- Minimum price difference per litre needed to break even
- Minimum litres you must purchase to break even
- Maximum distance at which the trip is still worthwhile

### User Experience

- Live reactive recalculation — results update as you type
- Mobile-responsive layout
- Currency selector (€, £, $, CHF, zł, Kč, Ft, kr)
- Visual cost breakdown bar chart
- Clear verdict: "This trip saves you money!" or "You lose money on this trip."
- All calculations run locally — no data leaves your browser

---

## Screenshots

> _Screenshots will be added after deployment._

| Trip Planning Mode | Trip Analysis Mode |
|---|---|
| ![Planning mode screenshot](docs/screenshots/planning-mode.png) | ![Analysis mode screenshot](docs/screenshots/analysis-mode.png) |

---

## Live Demo

> _Link will be added after deployment._

---

## How It Works

### What the Calculator Considers

Most people only compare the pump price. FuelTripROI calculates the **full picture**:

```
Apparent saving = (home_price − foreign_price) × litres_purchased

Hidden costs:
  + fuel burned driving there and back
  + vehicle wear (maintenance, depreciation, tires, oil)
  + toll and parking fees
  + food and drink
  + currency exchange fees
  + any other extras

Real saving = Apparent saving − Hidden costs
```

### Example

| Input | Value |
|-------|-------|
| Distance to station | 30 km one-way |
| Fuel consumption | 7 L/100km |
| Home price | €1.65/L |
| Foreign price | €1.35/L |
| Litres to refuel | 40 L |
| Vehicle wear | €0.08/km |

| Result | Value |
|--------|-------|
| Apparent saving | €12.00 |
| Trip fuel cost | €6.93 |
| Vehicle wear cost | €4.80 |
| **Net saving** | **€0.27** |
| Effective price/L | €1.643 |
| Trip ROI | 0.5% |
| Break-even litres | 39.1 L |

In this scenario you technically save €0.27 — but only because you're buying exactly enough fuel. Fill 39 litres instead of 40 and you **lose money**.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm 9 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/3DPeuckert/FuelTripROI.git
cd FuelTripROI

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run all unit tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open the Vitest UI |
| `npm run lint` | Lint source files |
| `npm run type-check` | Run TypeScript compiler without emitting |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React 18](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| State management | [Zustand](https://zustand-demo.pmnd.rs/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Testing | [Vitest](https://vitest.dev/) |

---

## Project Structure

```
FuelTripROI/
├── index.html                        # HTML entry point
├── vite.config.ts                    # Vite + Vitest configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
│
└── src/
    ├── main.tsx                      # React entry point
    ├── App.tsx                       # Root component
    ├── index.css                     # Global styles (Tailwind directives)
    │
    ├── types/
    │   └── calculatorTypes.ts        # All TypeScript types and interfaces
    │
    ├── lib/
    │   ├── fuelCalculations.ts       # Core trip calculation engine
    │   ├── breakEvenCalculations.ts  # Break-even analysis engine
    │   └── __tests__/
    │       ├── fuelCalculations.test.ts
    │       └── breakEvenCalculations.test.ts
    │
    ├── utils/
    │   ├── formatters.ts             # Display value formatters
    │   └── __tests__/
    │       └── formatters.test.ts
    │
    ├── store/
    │   └── calculatorStore.ts        # Zustand global state store
    │
    └── components/
        ├── CalculatorPanel.tsx       # Main layout (header + forms + results)
        ├── ModeSelector.tsx          # Planning / Analysis mode toggle
        ├── VehicleForm.tsx           # Vehicle data inputs
        ├── TripForm.tsx              # Trip distance inputs
        ├── FuelForm.tsx              # Fuel price and quantity inputs
        ├── ExtraCostsForm.tsx        # Hidden costs inputs
        ├── ActualMeasurementsForm.tsx# Analysis-mode actual value overrides
        ├── ResultsPanel.tsx          # Financial results summary
        └── ui/
            ├── InputField.tsx        # Reusable labelled numeric input
            ├── SectionCard.tsx       # Section card wrapper
            ├── Toggle.tsx            # Toggle / switch component
            └── Tooltip.tsx           # Hover tooltip
```

### Architecture Principles

1. **Calculation logic is isolated** — `src/lib/` contains pure functions with no UI dependencies
2. **UI is display-only** — components never contain formulas; they read from the store
3. **Fully typed** — strict TypeScript throughout; no `any`
4. **Unit-testable** — every calculation function has corresponding unit tests
5. **Single source of truth** — all state lives in the Zustand store; recalculation is triggered automatically on every change

---

## Core Formulas

### Trip Distance

```
trip_distance_total = (distance_to_station × 2) + detour_distance
```

### Trip Fuel Usage

```
trip_fuel_used = (trip_distance_total / 100) × avg_consumption_l_per_100km
```

### Costs

```
trip_fuel_cost   = trip_fuel_used × home_fuel_price
home_refuel_cost = total_refuel_liters × home_fuel_price
foreign_refuel   = total_refuel_liters × foreign_fuel_price
vehicle_wear     = trip_distance_total × vehicle_cost_per_km
extra_cost_total = sum(toll + parking + food + restroom + exchange + misc)
trip_total_cost  = trip_fuel_cost + extra_cost_total + vehicle_wear
```

### Savings & ROI

```
savings           = (home_refuel_cost − foreign_refuel_cost) − trip_total_cost
effective_price/L = (foreign_refuel_cost + trip_total_cost) / total_refuel_liters
roi_percent       = (savings / foreign_refuel_cost) × 100
cost_per_km       = trip_total_cost / trip_distance_total
```

### Break-Even

```
break_even_price_diff = trip_total_cost / total_refuel_liters
break_even_liters     = trip_total_cost / (home_price − foreign_price)
break_even_distance   = (price_diff × liters − extras) /
                        (2 × (fuel_cost_per_km + wear_cost_per_km))
```

---

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file save)
npm run test:watch

# Visual UI for tests
npm run test:ui
```

### Test Coverage

| Test file | Tests |
|-----------|-------|
| `fuelCalculations.test.ts` | 39 |
| `breakEvenCalculations.test.ts` | 14 |
| `formatters.test.ts` | 28 |
| **Total** | **81** |

---

## Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** the repository on GitHub
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Write code** following the project conventions:
   - All formulas go in `src/lib/`, not in components
   - All new calculation functions need unit tests
   - Keep TypeScript strict — no `any`
4. **Test** your changes:
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```
5. **Commit** with a descriptive message
6. **Open a pull request** with a clear description of the change

### Ideas for Contributions

- [ ] Country fuel price API integration (e.g. GlobalPetrolPrices)
- [ ] Nearest cheaper country finder
- [ ] Map integration showing the route
- [ ] Saved vehicle profiles (localStorage)
- [ ] Export / share results as a URL
- [ ] Multiple stops / stations comparison
- [ ] Diesel vs petrol selector
- [ ] CO₂ emissions calculator

### Reporting Bugs

Please open an [issue on GitHub](https://github.com/3DPeuckert/FuelTripROI/issues) with:
- A clear description of the bug
- Steps to reproduce
- Expected vs actual behaviour
- Browser and OS version

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

_Made with care for every driver who has stood at a border wondering if it's really worth it._
