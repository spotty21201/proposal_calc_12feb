import { jsPDF } from "jspdf";
import type { ProposalInput, ProposalOutput } from "@/types/proposal";

function formatIDR(v: number): string {
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function getScopeSection(input: ProposalInput): { included: string[]; excluded: string[] } {
  if (input.discipline === "planning") {
    return {
      included: [
        "Illustrative Master Plan",
        "Development Summary",
        "Land Use Plan",
        "Circulation & Access Logic",
        "Phasing Framework",
        "Open Space & Landscape Framework",
        "Schematic Master Plan (CAD)",
        "Lot configuration",
        "Conceptual street sections",
      ],
      excluded: [
        "Architecture",
        "Interior Design",
        "DED Engineering",
        "BOQ",
        "Construction documentation",
      ],
    };
  }

  return {
    included: [
      `${input.discipline.toUpperCase()} scope based on selected endpoint (${input.scope.toUpperCase()})`,
      "Conceptual and schematic package per doctrine",
      "Technical documentation according to selected stage",
    ],
    excluded: ["Out-of-scope specialist studies unless separately commissioned"],
  };
}

function sectionTitle(doc: jsPDF, y: number, title: string): number {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, y);
  doc.setDrawColor(180, 180, 180);
  doc.line(14, y + 2, 196, y + 2);
  return y + 8;
}

function addWrappedLines(doc: jsPDF, y: number, text: string, indent = 0): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lines = doc.splitTextToSize(text, 180 - indent);
  doc.text(lines, 14 + indent, y);
  return y + lines.length * 5;
}

async function imageToDataUrl(path: string): Promise<string | null> {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function validateBeforeExport(input: ProposalInput): string[] {
  const errors: string[] = [];
  if (!input.projectName.trim()) errors.push("Project name is required.");
  if (input.areaHa <= 0 && input.areaSqm <= 0) errors.push("Enter either Area (ha) or Area (sqm).");
  return errors;
}

export function createProposalMarkdown(input: ProposalInput, output: ProposalOutput): string {
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const scope = getScopeSection(input);

  const lines = [
    `# Proposal`,
    "",
    `## Cover Page`,
    `- Project Name: ${input.projectName || "SMK 1 Medan Renovation and Master Plan"}`,
    `- Client Name: ${input.clientName || "N/A"}`,
    `- Date: ${now}`,
    "",
    "## Introduction",
    "Berdasarkan hasil pertemuan, dibahas perlunya model kerja strategis berskala nasional yang memungkinkan HDA mendukung YPT dalam proses perencanaan dan desain di berbagai lokasi sekolah dan kampus di seluruh Indonesia.",
    "Program Perencanaan dan Desain Nasional YPT disusun untuk menyatukan proses asesmen, perencanaan, dan desain dalam satu sistem koordinasi nasional.",
    "",
    "## Scope of Works",
    "Dukungan HDA mencakup aset pendidikan YPT dari sekolah hingga perguruan tinggi di berbagai provinsi dan kota di Indonesia.",
    "### Included",
    ...scope.included.map((v) => `- ${v}`),
    "### Excluded",
    ...scope.excluded.map((v) => `- ${v}`),
    "",
    "## Fee Structure",
    `- Base Fee: ${formatIDR(output.baseFee)}`,
    `- Complexity Adjustment: ${formatIDR(output.complexityAdjustment)}`,
    `- Engagement Activation: ${formatIDR(output.engagementCost)}`,
    `- Travel Cost: ${formatIDR(output.travelCost)}`,
    `- Visualization Fees: ${formatIDR(output.visualizationCost)}`,
    `- Total Fee: ${formatIDR(output.totalFee)}`,
    "",
    "## Phase Breakdown",
    ...output.phaseBreakdown.map((p) => `- ${p.phase} (${p.percentage}%): ${formatIDR(p.amount)}`),
    "",
    "## Duration Estimate",
    `- ${output.durationMonths} months`,
    "",
    "## Payment Structure",
    "- Termin 1: 30% (Down Payment)",
    "- Termin 2: 40% (Interim Submission)",
    "- Termin 3: 30% (Final Submission)",
    "",
    "## Exclusions",
    "- Architecture, Interior Design, DED Engineering, BOQ, and construction documentation are excluded from master planning package.",
    "- Additional specialist studies are excluded unless separately commissioned.",
    "",
    "## Terms & Conditions",
    "- Proposal validity: 30 days from issuance.",
    "- Major scope changes may require addendum.",
    "",
    "## Signature Block",
    "PT Harmoni Desain Ananta (HDA + AIM)",
    "Principal",
  ];

  return lines.join("\n");
}

export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadProposalPdf(filename: string, input: ProposalInput, output: ProposalOutput): Promise<void> {
  const doc = new jsPDF();
  const now = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const scope = getScopeSection(input);

  const logoData = await imageToDataUrl("/images/hda-aim-logo-black.png");
  if (logoData) doc.addImage(logoData, "PNG", 14, 12, 62, 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Proposal", 14, 34);
  doc.setFontSize(14);
  doc.text(input.projectName || "Untitled Project", 14, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Client: ${input.clientName || "N/A"}`, 14, 52);
  doc.text(`Date: ${now}`, 14, 58);

  doc.addPage();
  let y = 16;

  y = sectionTitle(doc, y, "1. Introduction");
  y = addWrappedLines(
    doc,
    y,
    "Berdasarkan hasil pertemuan, dibahas perlunya model kerja strategis berskala nasional yang memungkinkan HDA mendukung YPT dalam proses perencanaan dan desain di berbagai lokasi sekolah dan kampus di seluruh Indonesia."
  ) + 4;
  y = addWrappedLines(
    doc,
    y,
    "Program Perencanaan dan Desain Nasional YPT disusun untuk menyatukan proses asesmen, perencanaan, dan desain dalam satu sistem koordinasi nasional."
  ) + 4;

  y = sectionTitle(doc, y, "2. Scope of Works");
  y = addWrappedLines(doc, y, "Included:", 0);
  for (const item of scope.included) y = addWrappedLines(doc, y, `- ${item}`, 2);
  y += 2;
  y = addWrappedLines(doc, y, "Excluded:", 0);
  for (const item of scope.excluded) y = addWrappedLines(doc, y, `- ${item}`, 2);

  if (y > 250) {
    doc.addPage();
    y = 16;
  }

  y += 4;
  y = sectionTitle(doc, y, "3. Fee Structure");
  [
    `Base Fee: ${formatIDR(output.baseFee)}`,
    `Complexity Adjustment: ${formatIDR(output.complexityAdjustment)}`,
    `Engagement Activation: ${formatIDR(output.engagementCost)}`,
    `Travel Cost: ${formatIDR(output.travelCost)}`,
    `Visualization Fees: ${formatIDR(output.visualizationCost)}`,
    `Total Professional Fee: ${formatIDR(output.totalFee)}`,
  ].forEach((line) => {
    y = addWrappedLines(doc, y, `- ${line}`);
  });

  y += 4;
  y = sectionTitle(doc, y, "4. Phase Breakdown");
  output.phaseBreakdown.forEach((p) => {
    y = addWrappedLines(doc, y, `- ${p.phase} (${p.percentage}%): ${formatIDR(p.amount)}`);
  });

  if (y > 240) {
    doc.addPage();
    y = 16;
  }

  y += 4;
  y = sectionTitle(doc, y, "5. Duration Estimate");
  y = addWrappedLines(doc, y, `- Estimated duration: ${output.durationMonths} months`);

  y += 4;
  y = sectionTitle(doc, y, "6. Payment Structure");
  y = addWrappedLines(doc, y, "- Termin 1: 30% (Down Payment)");
  y = addWrappedLines(doc, y, "- Termin 2: 40% (Interim Submission)");
  y = addWrappedLines(doc, y, "- Termin 3: 30% (Final Submission)");

  y += 4;
  y = sectionTitle(doc, y, "7. Exclusions");
  y = addWrappedLines(doc, y, "- Architecture, Interior Design, DED Engineering, BOQ, and construction documentation are excluded from master planning package.");
  y = addWrappedLines(doc, y, "- Additional specialist studies are excluded unless separately commissioned.");

  y += 4;
  y = sectionTitle(doc, y, "8. Terms & Conditions");
  y = addWrappedLines(doc, y, "- Proposal validity: 30 days from issuance date.");
  y = addWrappedLines(doc, y, "- Fundamental scope changes may require addendum.");

  y += 4;
  y = sectionTitle(doc, y, "9. Signature Block");
  y = addWrappedLines(doc, y, "PT Harmoni Desain Ananta (HDA + AIM)");
  y = addWrappedLines(doc, y, "Principal");

  doc.save(filename);
}
