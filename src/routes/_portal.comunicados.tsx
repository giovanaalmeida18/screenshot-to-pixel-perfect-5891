import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Megaphone } from "lucide-react";
import { useState } from "react";

import { ComunicadoCard } from "@/components/ComunicadoCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { comunicadosQuery } from "@/lib/data/queries";
import type { Comunicado } from "@/lib/data/types";
import { formatarData } from "@/lib/format";
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
  const [aberto, setAberto] = useState<Comunicado | null>(null);
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
      {lista.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {lista.map((c) => (
            <div key={c.id} className="flex flex-col">
              <ComunicadoCard item={c} />
              {c.conteudo && (
                <Button variant="outline" className="mt-2 w-full" onClick={() => setAberto(c)}>
                  Ler comunicado completo
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed bg-card p-10 text-center">
          <Megaphone className="h-10 w-10 text-primary" aria-hidden="true" />
          <p className="mt-3 text-lg font-bold text-foreground">Nenhum comunicado publicado ainda</p>
          <p className="mt-1 max-w-md text-base text-muted-foreground">
            Quando a equipe do Projeto Inclus publicar avisos e notícias, eles aparecerão aqui.
          </p>
        </div>
      )}

      <Dialog open={!!aberto} onOpenChange={(v) => !v && setAberto(null)}>
        <DialogContent>
          {aberto && (
            <>
              <DialogHeader>
                <DialogTitle>{aberto.titulo}</DialogTitle>
                <DialogDescription>Publicado em {formatarData(aberto.publicadoEm)}</DialogDescription>
              </DialogHeader>
              <p className="text-base font-medium text-foreground">{aberto.resumo}</p>
              <div className="whitespace-pre-line text-base text-muted-foreground">{aberto.conteudo}</div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
