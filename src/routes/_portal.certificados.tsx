import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Award, Download } from "lucide-react";
import { toast } from "sonner";

import { LogoMark } from "@/components/brand/Logo";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { baixarArquivo } from "@/lib/auth";
import { certificadosQuery } from "@/lib/data/queries";
import { formatarData } from "@/lib/format";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_portal/certificados")({
  head: () => pageHead("Certificados", "Veja e baixe os certificados dos cursos concluídos no Projeto Inclus."),
  loader: ({ context }) => context.queryClient.ensureQueryData(certificadosQuery),
  component: Certificados,
});

function Certificados() {
  const { data } = useSuspenseQuery(certificadosQuery);

  const baixar = async (filePath: string, cursoNome: string) => {
    try {
      await baixarArquivo("certificados", filePath, `certificado-${cursoNome}.pdf`);
    } catch {
      toast.error("Não foi possível abrir o certificado. Tente novamente.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Certificados"
        description="Seus certificados ficam guardados aqui para quando precisar."
        icon={Award}
        tone="yellow"
      />
      {data.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.map((c) => (
            <li key={c.id} className="overflow-hidden rounded-3xl border bg-card shadow-soft">
              <div className="relative flex items-center gap-3 bg-gradient-sunrise p-5 text-ink">
                <LogoMark className="h-9 w-9" />
                <span className="text-sm font-bold uppercase tracking-wider">Certificado de conclusão</span>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold text-foreground">{c.cursoNome}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Emitido em {formatarData(c.emitidoEm)}</p>
                {c.filePath ? (
                  <Button className="mt-4 w-full sm:w-auto" onClick={() => baixar(c.filePath!, c.cursoNome)}>
                    <Download aria-hidden="true" /> Baixar certificado
                  </Button>
                ) : (
                  <span className="mt-4 inline-block rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground">
                    Arquivo em preparação
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-3xl border-2 border-dashed bg-card p-10 text-center">
          <Award className="h-10 w-10 text-primary" aria-hidden="true" />
          <p className="mt-3 text-lg font-bold text-foreground">Ainda não há certificados cadastrados</p>
          <p className="mt-1 max-w-md text-base text-muted-foreground">
            Quando a equipe do Projeto Inclus emitir seus certificados, eles aparecerão aqui para download.
          </p>
        </div>
      )}
    </div>
  );
}
