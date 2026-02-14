import type { PricingTables } from "@/types/proposal";

export const scopeOptionsByDiscipline = {
  planning: ["diagnostic", "concept", "schematic", "ded", "full"],
  building: ["concept", "schematic", "ded", "full"],
  landscape: ["concept", "schematic", "ded", "full"],
  interior: ["concept", "schematic", "ded", "full"],
} as const;

export const defaultPricingTables: PricingTables = {
  pricingBase: [
    {
      discipline: "planning",
      base_rate: 15800000,
      unit_type: "ha",
      min_charge: 2,
      phase_weights: [
        { phase: "Diagnostic", percentage: 15, scope: "diagnostic" },
        { phase: "Conceptual", percentage: 25, scope: "concept" },
        { phase: "Schematic", percentage: 60, scope: "schematic" },
      ],
    },
    {
      discipline: "building",
      base_rate: 200000,
      unit_type: "sqm",
      min_charge: 100,
      phase_weights: [
        { phase: "Conceptual & Schematic", percentage: 35, scope: "concept" },
        { phase: "DED", percentage: 65, scope: "ded" },
      ],
    },
    {
      discipline: "landscape",
      base_rate: 50000,
      unit_type: "sqm",
      min_charge: 250,
      phase_weights: [
        { phase: "Conceptual & Schematic", percentage: 35, scope: "concept" },
        { phase: "DED", percentage: 65, scope: "ded" },
      ],
    },
    {
      discipline: "interior",
      base_rate: 150000,
      unit_type: "sqm",
      min_charge: 100,
      phase_weights: [
        { phase: "Conceptual & Schematic", percentage: 35, scope: "concept" },
        { phase: "DED", percentage: 65, scope: "ded" },
      ],
    },
  ],
  complexityMultiplier: {
    A: 1.0,
    B: 1.15,
    C: 1.3,
  },
  travelTier: {
    0: 0,
    1: 19000000,
    2: 28000000,
    3: 43000000,
  },
  visualizationRates: {
    manView: 2900000,
    birdView: 4800000,
    animationPerMin: 950000,
  },
};
