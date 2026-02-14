export type ComplexityClass = "A" | "B" | "C";

export type ProposalInput = {
  projectName: string;
  clientName: string;
  clientType: string;
  discipline: "planning" | "building" | "landscape" | "interior";
  areaHa: number;
  areaSqm: number;
  scope: "diagnostic" | "concept" | "schematic" | "ded" | "full";
  complexityClass: ComplexityClass;
  visualization: {
    manView: number;
    birdView: number;
    animationMin: number;
  };
  travelTier: 0 | 1 | 2 | 3;
  engagementActivation: boolean;
};

export type PricingBaseRow = {
  discipline: ProposalInput["discipline"];
  base_rate: number;
  unit_type: "ha" | "sqm";
  min_charge: number;
  phase_weights: Array<{ phase: string; percentage: number; scope: ProposalInput["scope"] }>;
};

export type PricingTables = {
  pricingBase: PricingBaseRow[];
  complexityMultiplier: Record<ComplexityClass, number>;
  travelTier: Record<number, number>;
  visualizationRates: {
    manView: number;
    birdView: number;
    animationPerMin: number;
  };
};

export type ProposalOutput = {
  doctrine: "institutional" | "standard";
  baseFee: number;
  complexityAdjustment: number;
  travelCost: number;
  visualizationCost: number;
  engagementCost: number;
  subtotal: number;
  totalFee: number;
  billableArea: number;
  phaseBreakdown: Array<{ phase: string; percentage: number; amount: number }>;
  notes: string[];
  suggestedTeamAllocation: { snr: number; mid: number; jnr: number };
  durationMonths: number;
};
