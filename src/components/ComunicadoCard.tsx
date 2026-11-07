import { CalendarDays } from "lucide-react";

import type { Comunicado } from "@/lib/data/types";
import { formatarData } from "@/lib/format";
import { cn } from "@/lib/utils";

const etiquetas: Record<Comunicado["categoria"], { label: string; className: string }> = {
  aviso: { label: "Aviso", className: "bg-brand-orange text-ink" },
  noticia: { label: "Notícia", className: "bg-primary text-primary-foreground" },
  evento: { label: "Evento", className: "bg-brand-teal text-ink" },
};

export function ComunicadoCard({ item, className }: { item: Comunicado; className?: string }) {
  const tag = etiquetas[item.categoria];
  return (
    <article className={cn("flex h-full flex-col rounded-3xl border bg-card p-5 shadow-soft sm:p-6", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", tag.className)}>
          {tag.label}
        </span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-foreground">{item.titulo}</h3>
      <p className="mt-2 flex-1 text-base text-muted-foreground">{item.resumo}</p>
      <p className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        <time dateTime={item.publicadoEm}>{formatarData(item.publicadoEm)}</time>
      </p>
    </article>
  );
}
