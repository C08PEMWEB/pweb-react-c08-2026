/**
 * Memformat string input angka menjadi pemisah ribuan titik khas Indonesia.
 * Contoh: "5000000" -> "5.000.000", "Rp 5.500.000" -> "5.500.000"
 */
export function formatIdrInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (digits.length === 0) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Mengurai teks nominal berformat ribuan kembali menjadi number murni.
 * Contoh: "5.000.000" -> 5000000, "" -> undefined
 */
export function parseIdrInput(formatted: string): number | undefined {
  const digits = formatted.replace(/\D/g, "");
  if (digits.length === 0) return undefined;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : undefined;
}
