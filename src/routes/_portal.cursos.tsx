import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, CheckCircle2, Clock, GraduationCap } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { meusCursosQuery } from "@/lib/data/queries";
import { formatarData } from "@/lib/format";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_portal/cursos")({
  head: () => pageHead("Meus cursos", "Consulte os cursos que você realizou no Projeto Inclus."),
  loader: ({ context }) => context.queryClient.ensureQueryData(meusCursosQuery),
  component: MeusCursos,
});

const statusLabel: Record<string, string> = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

function MeusCursos() {
  const { data } = useSuspenseQuery(meusCursosQuery);

  return (
    <div>
      <PageHeader
        title="Meus cursos"
        description="Os cursos que você realizou no Projeto Inclus."
        icon={GraduationCap}
        tone="teal"
      />
      {data.length > 0 ? (
        <ul className="space-y-4">
          {data.map((c) => (
            <li key={c.id} className="flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-soft sm:flex-row sm:items-center sm:p-6">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-teal text-ink">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">{c.nome}</h2>
                {c.descricao && <p className="mt-1 text-sm text-muted-foreground">{c.descricao}</p>}
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{statusLabel[c.status] ?? c.status}</span>
                  {c.cargaHoraria != null && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" aria-hidden="true" /> {c.cargaHoraria} horas
                    </span>
                  )}
                  {c.concluidoEm && <span>Concluído em {formatarData(c.concluidoEm)}</span>}
                </p>
              </div>
              {c.certificado ? (
                <Button asChild variant="outline">
                  <Link to="/certificados">
                    <Award aria-hidden="true" /> Ver certificado
                  </Link>
                </Button>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                  Certificado em preparação
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed bg-card p-10 text-center">
          <GraduationCap className="h-10 w-10 text-primary" aria-hidden="true" />
          <p className="mt-3 text-lg font-bold text-foreground">Ainda não há cursos cadastrados</p>
          <p className="mt-1 max-w-md text-base text-muted-foreground">
            Quando a equipe do Projeto Inclus registrar seus cursos concluídos, eles aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
