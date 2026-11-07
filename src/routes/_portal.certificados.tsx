import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Award, Download } from "lucide-react";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand/Logo";
import { DemoNotice } from "@/components/DemoNotice";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cursosRealizadosQuery } from "@/lib/data/queries";
import { formatarData } from "@/lib/format";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_portal/certificados")({
  head: () => pageHead("Certificados", "Veja e baixe os certificados dos cursos concluídos no Projeto Inclus."),
  loader: ({ context }) => context.queryClient.ensureQueryData(cursosRealizadosQuery),
  component: Certificados,
});

function Certificados() {
  const { data } = useSuspenseQuery(cursosRealizadosQuery);
  const disponiveis = data.filter((c) => c.certificadoDisponivel);

  return (
    <div>
      <PageHeader
        title="Certificados"
        description="Seus certificados ficam guardados aqui para quando precisar."
        icon={Award}
        tone="yellow"
      />
      <ul className="grid gap-4 md:grid-cols-2">
        {disponiveis.map((c) => (
          <li key={c.id} className="overflow-hidden rounded-3xl border bg-card shadow-soft">
            <div className="relative flex items-center gap-3 bg-gradient-sunrise p-5 text-ink">
              <LogoMark className="h-9 w-9" />
              <span className="text-sm font-bold uppercase tracking-wider">Certificado de conclusão</span>
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-foreground">{c.nome}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.cargaHoraria} horas · emitido em {formatarData(c.concluidoEm)}
              </p>
              <Button
                className="mt-4 w-full sm:w-auto"
                onClick={() => toast.info("O download ficará disponível quando a plataforma for conectada.")}
              >
                <Download aria-hidden="true" /> Baixar certificado
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <DemoNotice className="mt-6" />
    </div>
  );
}
