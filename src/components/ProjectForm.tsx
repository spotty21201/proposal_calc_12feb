"use client";

import { scopeOptionsByDiscipline } from "@/lib/pricingDefaults";
import { useProposalStore } from "@/store/proposalStore";

type ProjectFormProps = {
  errors?: Partial<Record<"projectName" | "area", string>>;
};

const travelOptions = [
  { value: 0, label: "Tier 0 - Greater Bandung & Greater Jakarta" },
  { value: 1, label: "Tier 1 - Jawa Tengah, Jawa Timur, Sumatera, Kalimantan, Bali" },
  { value: 2, label: "Tier 2 - Sulawesi, Lombok, NTB, NTT" },
  { value: 3, label: "Tier 3 - Ambon, Papua" },
] as const;

export function ProjectForm({ errors }: ProjectFormProps) {
  const input = useProposalStore((s) => s.input);
  const setInput = useProposalStore((s) => s.setInput);
  const setVisualization = useProposalStore((s) => s.setVisualization);

  const scopeOptions = scopeOptionsByDiscipline[input.discipline];
  const haDisabled = input.areaSqm > 0;
  const sqmDisabled = input.areaHa > 0;
  const animationWarn = input.visualization.animationMin > 0 && input.visualization.animationMin < 3;
  const engagementLocked = input.discipline === "planning" && input.clientType === "institutional";

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="font-serif text-2xl font-medium">General Information</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">Project Name
            <input
              className={`mt-1 w-full border bg-white p-3 placeholder:text-[#8A8A8A] ${errors?.projectName ? "border-[#E10600]" : "border-[#E2E2E2]"}`}
              value={input.projectName}
              placeholder="[Sample Project]"
              onChange={(e) => setInput("projectName", e.target.value)}
            />
            {errors?.projectName ? <span className="mt-1 block text-xs text-[#E10600]">{errors.projectName}</span> : null}
          </label>
          <label className="text-sm">Client Type
            <select className="mt-1 w-full border border-[#E2E2E2] bg-white p-3" value={input.clientType} onChange={(e) => setInput("clientType", e.target.value)}>
              <option value="private">Private</option>
              <option value="institutional">Institutional</option>
              <option value="government">Government</option>
              <option value="foundation">Foundation</option>
            </select>
          </label>
          <label className="text-sm">Client Name
            <input className="mt-1 w-full border border-[#E2E2E2] bg-white p-3 placeholder:text-[#8A8A8A]" placeholder="[Sample Project] Yayasan Pendidikan Telkom" value={input.clientName ?? ""} onChange={(e) => setInput("clientName", e.target.value)} />
          </label>
          <label className="text-sm">Discipline
            <select className="mt-1 w-full border border-[#E2E2E2] bg-white p-3" value={input.discipline} onChange={(e) => setInput("discipline", e.target.value as typeof input.discipline)}>
              <option value="planning">Planning</option>
              <option value="building">Building</option>
              <option value="landscape">Landscape</option>
              <option value="interior">Interior</option>
            </select>
          </label>
          <label className="text-sm">Scope
            <select className="mt-1 w-full border border-[#E2E2E2] bg-white p-3" value={input.scope} onChange={(e) => setInput("scope", e.target.value as typeof input.scope)}>
              {scopeOptions.map((scope) => (
                <option key={scope} value={scope}>{scope.toUpperCase()}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-2xl font-medium">Scale & Complexity</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">Area (ha)
            <input
              type="number"
              min={0}
              step="0.01"
              disabled={haDisabled}
              className={`mt-1 w-full border p-3 ${haDisabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : "bg-white"} ${errors?.area ? "border-[#E10600]" : "border-[#E2E2E2]"}`}
              value={input.areaHa}
              onChange={(e) => setInput("areaHa", Number((e.target.value || "0").replace(/^0+(?=\d)/, "")))}
            />
          </label>
          <label className="text-sm">Area (sqm)
            <input
              type="number"
              min={0}
              step="1"
              disabled={sqmDisabled}
              className={`mt-1 w-full border p-3 ${sqmDisabled ? "cursor-not-allowed bg-gray-100 text-gray-500" : "bg-white"} ${errors?.area ? "border-[#E10600]" : "border-[#E2E2E2]"}`}
              value={input.areaSqm}
              onChange={(e) => setInput("areaSqm", Number((e.target.value || "0").replace(/^0+(?=\d)/, "")))}
            />
            {errors?.area ? <span className="mt-1 block text-xs text-[#E10600]">{errors.area}</span> : null}
          </label>
          <label className="text-sm">Complexity Class
            <select className="mt-1 w-full border border-[#E2E2E2] bg-white p-3" value={input.complexityClass} onChange={(e) => setInput("complexityClass", e.target.value as "A" | "B" | "C") }>
              <option value="A">Class A</option>
              <option value="B">Class B</option>
              <option value="C">Class C</option>
            </select>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-2xl font-medium">Project Add-ons</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">Man&apos;s Eye View Perspective
            <input type="number" min={0} step={1} className="mt-1 w-full border border-[#E2E2E2] bg-white p-3" value={input.visualization.manView} onChange={(e) => setVisualization("manView", Number(e.target.value))} />
          </label>
          <label className="text-sm">Bird&apos;s Eye View Perspective
            <input type="number" min={0} step={1} className="mt-1 w-full border border-[#E2E2E2] bg-white p-3" value={input.visualization.birdView} onChange={(e) => setVisualization("birdView", Number(e.target.value))} />
          </label>
          <label className="text-sm">Animation Length (minutes)
            <input type="number" min={0} step={1} className={`mt-1 w-full border bg-white p-3 ${animationWarn ? "border-[#E10600]" : "border-[#E2E2E2]"}`} value={input.visualization.animationMin} onChange={(e) => setVisualization("animationMin", Number(e.target.value))} />
            {animationWarn ? <span className="mt-1.5 block text-xs text-[#E10600]">Minimum billed duration is 3 minutes.</span> : null}
          </label>
          <label className="text-sm">Travel Tier
            <select className="mt-1 w-full border border-[#E2E2E2] bg-white p-3" value={input.travelTier} onChange={(e) => setInput("travelTier", Number(e.target.value) as 0 | 1 | 2 | 3)}>
              {travelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={input.engagementActivation} disabled={engagementLocked} onChange={(e) => setInput("engagementActivation", e.target.checked)} />
            Engagement Activation {engagementLocked ? "(Required for Institutional Master Planning)" : ""}
          </label>
        </div>
      </div>
    </section>
  );
}
