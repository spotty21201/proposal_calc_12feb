import { describe, expect, it } from "vitest";
import { calculateProposal } from "@/lib/calcProposal";
import { defaultPricingTables } from "@/lib/pricingDefaults";
import type { ProposalInput } from "@/types/proposal";

const baseInput: ProposalInput = {
  projectName: "Test",
  clientType: "institutional",
  discipline: "planning",
  areaHa: 1,
  areaSqm: 0,
  scope: "ded",
  complexityClass: "A",
  visualization: { manView: 0, birdView: 0, animationMin: 0 },
  travelTier: 0,
  engagementActivation: false,
};

describe("calculateProposal", () => {
  it("prevents calculation when area is zero", () => {
    const out = calculateProposal({ ...baseInput, areaHa: 0 }, defaultPricingTables);
    expect(out.totalFee).toBe(0);
    expect(out.notes[0]).toContain("Area must be greater than 0");
  });

  it("enforces minimum charge", () => {
    const out = calculateProposal(baseInput, defaultPricingTables);
    expect(out.billableArea).toBe(2);
    expect(out.notes.some((n) => n.includes("Minimum charge"))).toBe(true);
  });

  it("applies complexity multiplier", () => {
    const outA = calculateProposal({ ...baseInput, complexityClass: "A", areaHa: 2 }, defaultPricingTables);
    const outC = calculateProposal({ ...baseInput, complexityClass: "C", areaHa: 2 }, defaultPricingTables);
    expect(outC.subtotal).toBeGreaterThan(outA.subtotal);
    expect(outC.complexityAdjustment).toBeGreaterThan(0);
  });

  it("adds travel and visualization", () => {
    const out = calculateProposal(
      {
        ...baseInput,
        areaHa: 2,
        travelTier: 2,
        visualization: { manView: 1, birdView: 1, animationMin: 2 },
      },
      defaultPricingTables
    );
    expect(out.travelCost).toBe(28000000);
    expect(out.visualizationCost).toBeGreaterThan(0);
  });

  it("uses master planning scope-only phase breakdown", () => {
    const outConcept = calculateProposal({ ...baseInput, areaHa: 2, scope: "concept" }, defaultPricingTables);
    expect(outConcept.phaseBreakdown).toHaveLength(1);
    expect(outConcept.phaseBreakdown[0].phase).toContain("Concept");
    expect(outConcept.phaseBreakdown[0].percentage).toBe(25);
  });

  it("warns when DED is selected for planning", () => {
    const out = calculateProposal({ ...baseInput, areaHa: 2, scope: "ded" }, defaultPricingTables);
    expect(out.notes.some((n) => n.includes("DED excluded"))).toBe(true);
  });

  it("charges architecture concept/schematic at 35% of base", () => {
    const out = calculateProposal(
      {
        ...baseInput,
        discipline: "building",
        areaHa: 0,
        areaSqm: 200,
        scope: "schematic",
        engagementActivation: false,
      },
      defaultPricingTables
    );
    expect(out.baseFee).toBe(200 * 200000);
    expect(out.subtotal).toBe(Math.round(out.baseFee * 0.35));
    expect(out.phaseBreakdown).toHaveLength(1);
    expect(out.phaseBreakdown[0].percentage).toBe(35);
  });

  it("charges architecture ded at full base", () => {
    const out = calculateProposal(
      {
        ...baseInput,
        discipline: "building",
        areaHa: 0,
        areaSqm: 200,
        scope: "ded",
        engagementActivation: false,
      },
      defaultPricingTables
    );
    expect(out.subtotal).toBe(out.baseFee);
    expect(out.phaseBreakdown).toHaveLength(2);
    expect(out.phaseBreakdown[1].percentage).toBe(65);
  });
});
