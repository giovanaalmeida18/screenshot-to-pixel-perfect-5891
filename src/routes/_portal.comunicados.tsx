import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { useState } from "react";

import { ComunicadoCard } from "@/components/ComunicadoCard";
import { DemoNotice } from "@/components/DemoNotice";
import { PageHeader } from "@/components/PageHeader";
import { comunicadosQuery } from "@/lib/data/queries";
import type { Comunicado } from "@/lib/data/types";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_portal/comunicados")({
  head: () => pageHead("Comunicados", "Notícias e avisos publicados pela equipe do Projeto Inclus."),
  loader: ({ context }) => context.queryClient.ensureQueryData(comunicadosQuery),
  component: Comunicados,
});

const filtros: { id: Comunicado["categoria"] | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "aviso", label: "Avisos" },
  { id: "noticia", label: "Notícias" },
  { id: "evento", label: "Eventos" },
];

function Comunicados() {
  const { data } = useSuspenseQuery(comunicadosQuery);
  const [filtro, setFiltro] = useState<(typeof filtros)[number]["id"]>("todos");
  const lista = data.filter((c) => filtro === "todos" || c.categoria === filtro);

  return (
    <div>
      <PageHeader
        title="Comunicados"
        description="Notícias e avisos publicados pelo Projeto Inclus."
        icon={Megaphone}
        tone="orange"
      />
      <div role="group" aria-label="Filtrar comunicados" className="mb-6 flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={cn(
              "min-h-11 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
              filtro === f.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {lista.map((c) => (
          <ComunicadoCard key={c.id} item={c} />
        ))}
      </div>
      <DemoNotice className="mt-6" />
    </div>
  );
}
