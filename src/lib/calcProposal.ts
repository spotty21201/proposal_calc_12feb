import type { PricingTables, ProposalInput, ProposalOutput } from "@/types/proposal";

const durationByScope: Record<ProposalInput["scope"], number> = {
  diagnostic: 2,
  concept: 4,
  schematic: 8,
  ded: 10,
  full: 8,
};

function pickMidForPlanning(areaHa: number): number {
  if (areaHa <= 50) return 1;
  if (areaHa <= 100) return 2;
  if (areaHa <= 200) return 2;
  return 3;
}

function pickJnrByHa(areaHa: number): number {
  if (areaHa >= 300) return 3;
  return 2;
}

export function calculateProposal(inputs: ProposalInput, pricingTables: PricingTables): ProposalOutput {
  const baseRow = pricingTables.pricingBase.find((row) => row.discipline === inputs.discipline);
  if (!baseRow) throw new Error(`Missing pricing base for discipline: ${inputs.discipline}`);

  const doctrine: "institutional" | "standard" =
    inputs.clientType === "institutional" && inputs.discipline === "planning" ? "institutional" : "standard";

  const area = baseRow.unit_type === "ha" ? inputs.areaHa : inputs.areaSqm;
  if (area <= 0) {
    return {
      doctrine,
      baseFee: 0,
      complexityAdjustment: 0,
      travelCost: 0,
      visualizationCost: 0,
      engagementCost: 0,
      subtotal: 0,
      totalFee: 0,
      billableArea: 0,
      phaseBreakdown: [],
      notes: ["Area must be greater than 0."],
      suggestedTeamAllocation: { snr: 1, mid: 1, jnr: 2 },
      durationMonths: durationByScope[inputs.scope],
    };
  }
  const billableArea = Math.max(area, baseRow.min_charge);
  const notes: string[] = [];

  if (area < baseRow.min_charge) {
    notes.push(`Minimum charge enforced: ${baseRow.min_charge} ${baseRow.unit_type}`);
  }

  const baseFee = billableArea * baseRow.base_rate;

  const complexityMultiplier = inputs.discipline === "planning" ? (pricingTables.complexityMultiplier[inputs.complexityClass] ?? 1) : 1;
  const complexityAdjustedBase = baseFee * complexityMultiplier;
  const complexityAdjustment = complexityAdjustedBase - baseFee;

  const travelCost = pricingTables.travelTier[inputs.travelTier] ?? 0;
  const animationMin = inputs.visualization.animationMin > 0 ? Math.max(Math.trunc(inputs.visualization.animationMin), 3) : 0;
  if (inputs.visualization.animationMin > 0 && inputs.visualization.animationMin < 3) {
    notes.push("Animation minimum of 3 minutes enforced");
  }

  const visualizationCost =
    Math.trunc(inputs.visualization.manView) * pricingTables.visualizationRates.manView +
    Math.trunc(inputs.visualization.birdView) * pricingTables.visualizationRates.birdView +
    animationMin * pricingTables.visualizationRates.animationPerMin;

  const engagementCost = inputs.engagementActivation ? 26800000 : 0;

  const planningScope = inputs.discipline === "planning" ? (inputs.scope === "ded" ? "schematic" : inputs.scope) : inputs.scope;
  if (inputs.discipline === "planning" && inputs.scope === "ded") {
    notes.push("DED excluded from Master Planning package");
  }
  let subtotal = complexityAdjustedBase;
  let phaseBreakdown = baseRow.phase_weights
    .filter((phase) => (planningScope === "full" ? true : phase.scope === planningScope))
    .map((phase) => ({
      phase: phase.phase,
      percentage: phase.percentage,
      amount: Math.round((complexityAdjustedBase * phase.percentage) / 100),
    }));

  if (inputs.discipline !== "planning") {
    if (inputs.scope === "concept" || inputs.scope === "schematic") {
      subtotal = Math.round(baseFee * 0.35);
      phaseBreakdown = [{ phase: "Conceptual & Schematic", percentage: 35, amount: subtotal }];
    } else {
      subtotal = baseFee;
      phaseBreakdown = [
        { phase: "Conceptual & Schematic", percentage: 35, amount: Math.round(baseFee * 0.35) },
        { phase: "DED", percentage: 65, amount: Math.round(baseFee * 0.65) },
      ];
    }
  }

  const totalFee = Math.round(subtotal + travelCost + visualizationCost + engagementCost);

  const areaHaEquivalent = inputs.discipline === "planning" ? inputs.areaHa : inputs.areaSqm / 10000;

  return {
    doctrine,
    baseFee: Math.round(baseFee),
    complexityAdjustment: Math.round(complexityAdjustment),
    travelCost: Math.round(travelCost),
    visualizationCost: Math.round(visualizationCost),
    engagementCost: Math.round(engagementCost),
    subtotal: Math.round(subtotal),
    totalFee,
    billableArea,
    phaseBreakdown,
    notes,
    suggestedTeamAllocation: {
      snr: 1,
      mid: inputs.discipline === "planning" ? pickMidForPlanning(areaHaEquivalent) : 1,
      jnr: pickJnrByHa(areaHaEquivalent),
    },
    durationMonths: durationByScope[inputs.scope],
  };
}
