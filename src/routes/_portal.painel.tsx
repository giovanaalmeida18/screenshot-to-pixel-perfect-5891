import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { ComunicadoCard } from "@/components/ComunicadoCard";
import { DemoNotice } from "@/components/DemoNotice";
import { mainNav } from "@/components/layout/nav";
import { IconTile } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { comunicadosQuery } from "@/lib/data/queries";
import { lerSessaoDemo } from "@/lib/demo-session";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_portal/painel")({
  head: () => pageHead("Meu painel", "Seu painel de ex-aluno: atalhos, novidades e oportunidades do Projeto Inclus."),
  loader: ({ context }) => context.queryClient.ensureQueryData(comunicadosQuery),
  component: Painel,
});

const descricoes: Record<string, string> = {
  "/biblioteca": "Apostilas, vídeos e tutoriais",
  "/cursos": "Cursos que você concluiu",
  "/certificados": "Veja e baixe seus certificados",
  "/comunicados": "Avisos e notícias do projeto",
  "/oportunidades": "Cursos, eventos e vagas",
};

function saudacaoDoDia() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function Painel() {
  const { data: comunicados } = useSuspenseQuery(comunicadosQuery);
  const [nome, setNome] = useState<string | null>(null);
  const [saudacao, setSaudacao] = useState("Olá");

  useEffect(() => {
    setNome(lerSessaoDemo()?.primeiroNome || null);
    setSaudacao(saudacaoDoDia());
  }, []);

  const atalhos = mainNav.filter((i) => i.to in descricoes);

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-ocean p-6 text-primary-foreground sm:p-10">
        <div aria-hidden="true" className="absolute -right-6 -top-10 h-36 w-36 rounded-full bg-brand-yellow sm:h-48 sm:w-48" />
        <div aria-hidden="true" className="absolute bottom-4 right-24 hidden h-14 w-14 rotate-12 rounded-2xl bg-brand-orange sm:block" />
        <p className="relative text-base font-medium text-primary-foreground/85">{saudacao},</p>
        <h1 className="relative mt-1 text-3xl font-extrabold sm:text-4xl">
          {nome ? `${nome}!` : "ex-aluno(a)!"}
        </h1>
        <p className="relative mt-3 max-w-lg text-lg text-primary-foreground/90">
          Que bom ter você por aqui. O que você quer fazer hoje?
        </p>
        <Button asChild variant="sun" className="relative mt-6">
          <Link to="/biblioteca">
            Continuar aprendendo <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </section>

      <section aria-labelledby="atalhos">
        <h2 id="atalhos" className="text-xl font-bold text-foreground sm:text-2xl">
          Atalhos
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {atalhos.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                data-slot="card"
                className="group flex h-full flex-col gap-3 rounded-3xl border-2 border-transparent bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary sm:p-5"
              >
                <IconTile icon={item.icon} tone={item.tone} />
                <span className="text-base font-bold text-foreground sm:text-lg">{item.label}</span>
                <span className="text-sm text-muted-foreground">{descricoes[item.to]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="novidades">
        <div className="flex items-end justify-between gap-4">
          <h2 id="novidades" className="text-xl font-bold text-foreground sm:text-2xl">
            Novidades do Projeto Inclus
          </h2>
          <Link to="/comunicados" className="inline-flex items-center gap-1 text-base font-semibold text-primary">
            Ver todas <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {comunicados.slice(0, 3).map((c) => (
            <ComunicadoCard key={c.id} item={c} />
          ))}
        </div>
        <DemoNotice className="mt-4" />
      </section>
    </div>
  );
}
