import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, CalendarClock, ExternalLink } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { oportunidadesQuery } from "@/lib/data/queries";
import type { OportunidadeTipo } from "@/lib/data/types";
import { formatarData } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_portal/oportunidades")({
  head: () => pageHead("Oportunidades", "Cursos, capacitações, eventos e oportunidades profissionais para ex-alunos do Projeto Inclus."),
  loader: ({ context }) => context.queryClient.ensureQueryData(oportunidadesQuery),
  component: Oportunidades,
});

const tipos: Record<OportunidadeTipo, { label: string; className: string }> = {
  curso: { label: "Curso", className: "bg-primary text-primary-foreground" },
  capacitacao: { label: "Capacitação", className: "bg-brand-teal text-ink" },
  evento: { label: "Evento", className: "bg-brand-yellow text-ink" },
  oficina: { label: "Oficina", className: "bg-surface-teal text-ink" },
  vaga: { label: "Vaga", className: "bg-brand-orange text-ink" },
};

function Oportunidades() {
  const { data } = useSuspenseQuery(oportunidadesQuery);
  const [filtro, setFiltro] = useState<OportunidadeTipo | "todos">("todos");
  const lista = data.filter((o) => filtro === "todos" || o.tipo === filtro);

  return (
    <div>
      <PageHeader
        title="Oportunidades"
        description="Cursos, capacitações, eventos e vagas para continuar crescendo."
        icon={Briefcase}
        tone="teal"
      />
      <div role="group" aria-label="Filtrar oportunidades" className="mb-6 flex flex-wrap gap-2">
        {(["todos", "curso", "capacitacao", "evento", "oficina", "vaga"] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={filtro === t}
            onClick={() => setFiltro(t)}
            className={cn(
              "min-h-11 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
              filtro === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary",
            )}
          >
            {t === "todos" ? "Todas" : tipos[t].label}
          </button>
        ))}
      </div>
      {lista.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {lista.map((o) => (
            <li key={o.id} className="flex flex-col rounded-3xl border bg-card p-5 shadow-soft sm:p-6">
              <span className={cn("self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", (tipos[o.tipo] ?? tipos.curso).className)}>
                {(tipos[o.tipo] ?? tipos.curso).label}
              </span>
              <h3 className="mt-4 text-lg font-bold text-foreground">{o.titulo}</h3>
              {o.descricao && <p className="mt-2 flex-1 text-base text-muted-foreground">{o.descricao}</p>}
              {o.prazo && (
                <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
                  <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
                  Inscrições até <span className="font-semibold">{formatarData(o.prazo)}</span>
                </p>
              )}
              {o.linkExterno && (
                <Button asChild variant="cta" className="mt-5 w-full sm:w-auto sm:self-start">
                  <a href={o.linkExterno} target="_blank" rel="noopener noreferrer">
                    Quero participar <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed bg-card p-10 text-center">
          <Briefcase className="h-10 w-10 text-primary" aria-hidden="true" />
          <p className="mt-3 text-lg font-bold text-foreground">Nenhuma oportunidade no momento</p>
          <p className="mt-1 max-w-md text-base text-muted-foreground">
            Quando a equipe divulgar cursos, eventos e vagas, eles aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
