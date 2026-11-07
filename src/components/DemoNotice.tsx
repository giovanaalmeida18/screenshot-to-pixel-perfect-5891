import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

export function DemoNotice({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <p
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-xl border-2 border-dashed border-brand-orange bg-surface-orange px-4 py-3 text-sm text-ink",
        className,
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        {children ?? "Conteúdo demonstrativo. As informações reais serão exibidas quando a plataforma for conectada."}
      </span>
    </p>
  );
}
