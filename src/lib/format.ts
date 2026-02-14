export const formatRupiah = (value: number): string =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);

export function formatCurrency(amount: number, mode: "compact" | "full" | "juta" = "compact"): string {
  if (mode === "compact") {
    if (amount >= 1_000_000_000) {
      return `Rp ${(amount / 1_000_000_000).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M`;
    }
    if (amount >= 1_000_000) {
      return `Rp ${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} jt`;
    }
  }

  if (mode === "juta") {
    return `Rp ${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} jt`;
  }

  return `Rp ${amount.toLocaleString("id-ID")}`;
}
