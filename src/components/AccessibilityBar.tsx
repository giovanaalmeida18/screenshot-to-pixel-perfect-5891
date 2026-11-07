import { Contrast, Minus, Plus, Type } from "lucide-react";

import { useAccessibility, type FontScale } from "@/lib/accessibility";
import { cn } from "@/lib/utils";

const nomesTamanho: Record<FontScale, string> = {
  md: "padrão",
  lg: "grande",
  xl: "maior",
};

export function AccessibilityBar({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { fontScale, highContrast, increaseFont, decreaseFont, resetFont, toggleContrast } =
    useAccessibility();

  const btn =
    "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg border-2 border-border bg-background px-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:text-foreground";

  return (
    <div
      role="group"
      aria-label="Acessibilidade"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {!compact && (
        <span className="mr-1 hidden items-center gap-1 text-sm font-medium text-muted-foreground sm:inline-flex">
          <Type className="h-4 w-4" aria-hidden="true" /> Texto
        </span>
      )}
      <button
        type="button"
        className={btn}
        onClick={decreaseFont}
        disabled={fontScale === "md"}
        aria-label="Diminuir tamanho do texto"
        title="Diminuir fonte"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />A
      </button>
      <button
        type="button"
        className={cn(btn, fontScale === "md" && "border-primary text-primary")}
        onClick={resetFont}
        aria-label="Tamanho de texto padrão"
        aria-pressed={fontScale === "md"}
        title="Tamanho padrão"
      >
        A
      </button>
      <button
        type="button"
        className={btn}
        onClick={increaseFont}
        disabled={fontScale === "xl"}
        aria-label="Aumentar tamanho do texto"
        title="Aumentar fonte"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />A
      </button>
      <button
        type="button"
        className={cn(
          btn,
          highContrast && "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
        )}
        onClick={toggleContrast}
        aria-label="Alto contraste"
        aria-pressed={highContrast}
        title={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
      >
        <Contrast className="h-4 w-4" aria-hidden="true" />
        <span aria-hidden="true" className={compact ? "hidden sm:inline" : undefined}>
          {compact ? "Contraste" : "Alto contraste"}
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {`Texto ${nomesTamanho[fontScale]}. Alto contraste ${highContrast ? "ativado" : "desativado"}.`}
      </span>
    </div>
  );
}
