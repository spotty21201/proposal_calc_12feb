import { formatRupiah } from "@/lib/format";

type Row = { label: string; value: number };

export function CalculationCard({ rows }: { rows: Row[] }) {
  return (
    <div className="border border-[#E2E2E2] bg-white p-6">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#6B6B6B]">Fee Breakdown</h3>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-[#6B6B6B]">{row.label}</span>
            <span className="tabular-nums font-semibold">{formatRupiah(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
