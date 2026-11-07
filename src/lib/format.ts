export function formatarData(iso: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" }) {
  const [y = 1970, m = 1, d = 1] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}
