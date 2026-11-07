import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** "dark" para fundos claros, "light" para fundos azuis */
  tone?: "dark" | "light";
  showTagline?: boolean;
}

/**
 * Marca provisória do Inclus Conecta construída com as formas e cores do Projeto Inclus.
 * Substituir pelo arquivo oficial do logotipo assim que disponível.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn("h-10 w-10 shrink-0", className)}>
      <rect x="2" y="2" width="21" height="21" rx="5" className="fill-brand-orange" />
      <circle cx="35.5" cy="12.5" r="10.5" className="fill-brand-yellow" />
      <path d="M2 30a5 5 0 0 1 5-5h16v21H7a5 5 0 0 1-5-5z" className="fill-brand-teal" />
      <path d="M25 25h16a5 5 0 0 1 5 5v11a5 5 0 0 1-5 5H25z" className="fill-brand-blue" />
    </svg>
  );
}

export function Logo({ className, tone = "dark", showTagline = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-xl font-extrabold tracking-tight",
            tone === "dark" ? "text-primary" : "text-primary-foreground",
          )}
        >
          Inclus<span className={tone === "dark" ? "text-ink" : "text-brand-yellow"}> Conecta</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 text-[0.7rem] font-medium uppercase tracking-[0.14em]",
              tone === "dark" ? "text-muted-foreground" : "text-primary-foreground/80",
            )}
          >
            Projeto Inclus
          </span>
        )}
      </span>
    </span>
  );
}
