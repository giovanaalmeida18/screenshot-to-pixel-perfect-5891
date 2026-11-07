import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, GraduationCap, Mail, MapPin, Pencil, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";

import { DemoNotice } from "@/components/DemoNotice";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { cursosRealizadosQuery, participacoesQuery, perfilQuery } from "@/lib/data/queries";
import { formatarData } from "@/lib/format";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_portal/perfil")({
  head: () => pageHead("Meu perfil", "Seus dados, cursos realizados e histórico de participação no Projeto Inclus."),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(perfilQuery),
      context.queryClient.ensureQueryData(cursosRealizadosQuery),
      context.queryClient.ensureQueryData(participacoesQuery),
    ]),
  component: Perfil,
});

function Perfil() {
  const [{ data: perfil }, { data: cursos }, { data: historico }] = useSuspenseQueries({
    queries: [perfilQuery, cursosRealizadosQuery, participacoesQuery],
  });

  const dados = [
    { icon: Mail, label: "E-mail", value: perfil.email },
    { icon: Phone, label: "Telefone", value: perfil.telefone },
    { icon: MapPin, label: "Cidade", value: perfil.cidade },
    { icon: CalendarCheck, label: "No Inclus Conecta desde", value: formatarData(perfil.membroDesde) },
  ];

  return (
    <div>
      <PageHeader title="Meu perfil" icon={UserRound}>
        <Button variant="outline" onClick={() => toast.info("A edição ficará disponível quando a plataforma for conectada.")}>
          <Pencil aria-hidden="true" /> Editar dados
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="dados" className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-ocean text-2xl font-extrabold text-primary-foreground"
            >
              {perfil.nome.charAt(0)}
            </span>
            <div>
              <h2 id="dados" className="text-xl font-bold text-foreground">
                {perfil.nome}
              </h2>
              <p className="text-sm text-muted-foreground">Ex-aluno(a) do Projeto Inclus</p>
            </div>
          </div>
          <dl className="mt-6 space-y-4">
            {dados.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <d.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-sm text-muted-foreground">{d.label}</dt>
                  <dd className="text-base font-medium text-foreground">{d.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="cursos" className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 id="cursos" className="text-lg font-bold text-foreground">
                Cursos realizados
              </h2>
              <Link to="/cursos" className="text-sm font-semibold text-primary">
                Ver todos
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {cursos.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-surface-blue p-3">
                  <GraduationCap className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex-1 text-base font-medium text-foreground">{c.nome}</span>
                  <span className="text-sm text-muted-foreground">{c.cargaHoraria}h</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="historico" className="rounded-3xl border bg-card p-6 shadow-soft">
            <h2 id="historico" className="text-lg font-bold text-foreground">
              Histórico de participação
            </h2>
            <ol className="relative mt-5 space-y-5 border-l-2 border-brand-teal pl-6">
              {historico.map((p) => (
                <li key={p.id} className="relative">
                  <span aria-hidden="true" className="absolute -left-[1.95rem] top-1 h-4 w-4 rounded-full border-4 border-card bg-brand-orange" />
                  <p className="text-base font-semibold text-foreground">{p.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    <time dateTime={p.data}>{formatarData(p.data)}</time>
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
      <DemoNotice className="mt-6" />
    </div>
  );
}
