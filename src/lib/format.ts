export function formatarData(iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" }) {
  const [y = 0, m = 1, d = 1] = iso.slice(0, 10).split("-").map(Number);
  if (!y) return "—";
  return new Intl.DateTimeFormat("pt-BR", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}
