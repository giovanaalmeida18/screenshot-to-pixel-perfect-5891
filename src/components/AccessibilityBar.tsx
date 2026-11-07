import { Contrast, Minus, Plus, Type } from "lucide-react";

import { useAccessibility } from "@/lib/accessibility";
import { cn } from "@/lib/utils";

export function AccessibilityBar({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { fontScale, highContrast, increaseFont, decreaseFont, resetFont, toggleContrast } =
    useAccessibility();

  const btn =
    "inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg border-2 border-border bg-background px-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-40";

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
      >
        <Minus className="h-4 w-4" aria-hidden="true" />A
      </button>
      <button type="button" className={btn} onClick={resetFont} aria-label="Tamanho de texto padrão">
        A
      </button>
      <button
        type="button"
        className={btn}
        onClick={increaseFont}
        disabled={fontScale === "xl"}
        aria-label="Aumentar tamanho do texto"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />A
      </button>
      <button
        type="button"
        className={cn(btn, highContrast && "border-primary bg-primary text-primary-foreground hover:text-primary-foreground")}
        onClick={toggleContrast}
        aria-pressed={highContrast}
      >
        <Contrast className="h-4 w-4" aria-hidden="true" />
        {!compact && <span>Alto contraste</span>}
        {compact && <span className="sr-only">Alto contraste</span>}
      </button>
    </div>
  );
}
