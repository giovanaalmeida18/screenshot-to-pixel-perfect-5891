import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Briefcase, GraduationCap, Megaphone } from "lucide-react";

import heroImg from "@/assets/hero-comunidade.jpg";
import { PublicHeader } from "@/components/layout/PublicShell";
import { IconTile, type Tone } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inclus Conecta — Continue aprendendo com o Projeto Inclus" },
      {
        name: "description",
        content:
          "Plataforma dos ex-alunos do Projeto Inclus: biblioteca digital, comunicados, cursos realizados e novas oportunidades.",
      },
      { property: "og:title", content: "Inclus Conecta — Continue aprendendo com o Projeto Inclus" },
      {
        property: "og:description",
        content: "O espaço digital para ex-alunos manterem o vínculo com o Projeto Inclus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const recursos: { icon: typeof BookOpen; tone: Tone; title: string; text: string }[] = [
  { icon: BookOpen, tone: "blue", title: "Biblioteca digital", text: "Apostilas, vídeos e tutoriais para revisar quando quiser." },
  { icon: Megaphone, tone: "orange", title: "Comunicados", text: "Fique por dentro das novidades e avisos do projeto." },
  { icon: GraduationCap, tone: "teal", title: "Seus cursos", text: "Consulte os cursos que você fez e seus certificados." },
  { icon: Briefcase, tone: "yellow", title: "Oportunidades", text: "Cursos, capacitações, eventos e vagas para você." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main id="conteudo">
        <section className="relative overflow-hidden bg-gradient-ocean text-primary-foreground">
          <div aria-hidden="true" className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-brand-yellow opacity-90 sm:h-64 sm:w-64" />
          <div aria-hidden="true" className="absolute -bottom-12 left-[45%] h-28 w-28 rotate-12 rounded-3xl bg-brand-orange opacity-90" />
          <div aria-hidden="true" className="geo-dots absolute left-4 top-6 h-24 w-32 text-primary-foreground/30" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-brand-teal" aria-hidden="true" />
                Para ex-alunos do Projeto Inclus
              </p>
              <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl lg:text-6xl">
                Sua jornada de aprendizagem <span className="text-brand-yellow">continua aqui.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-primary-foreground/90">
                Boas-vindas ao Inclus Conecta! Um lugar para manter o vínculo com o projeto, rever o que você
                aprendeu e descobrir novos caminhos.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="cta" size="lg">
                  <Link to="/entrar">
                    Entrar <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline-light" size="lg">
                  <Link to="/cadastro">Cadastrar-se</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div aria-hidden="true" className="absolute -left-4 -top-4 h-full w-full rounded-[2rem] bg-brand-teal" />
              <img
                src={heroImg}
                width={1280}
                height={1024}
                alt="Grupo de pessoas sorrindo enquanto usam notebook e celular juntas"
                className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-lift"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-foreground">O que você encontra no Inclus Conecta</h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Uma extensão digital do Projeto Inclus, feita para ser simples de usar no celular ou no computador.
            </p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recursos.map((r) => (
              <li key={r.title} className="rounded-3xl border bg-card p-6 shadow-soft">
                <IconTile icon={r.icon} tone={r.tone} />
                <h3 className="mt-4 text-lg font-bold text-foreground">{r.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{r.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mb-16 max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-sunrise p-8 text-ink sm:p-12">
            <div aria-hidden="true" className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-teal" />
            <h2 className="relative max-w-xl text-2xl font-bold sm:text-3xl">Já fez um curso no Projeto Inclus?</h2>
            <p className="relative mt-2 max-w-xl text-lg">Crie sua conta em poucos passos e continue aprendendo com a gente.</p>
            <Button asChild size="lg" className="relative mt-6">
              <Link to="/cadastro">
                Criar minha conta <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>Inclus Conecta · uma iniciativa do Projeto de Inclusão Digital e Social Inclus</p>
          <Link to="/entrar" className="font-medium text-primary">
            Acessar minha conta
          </Link>
        </div>
      </footer>
    </div>
  );
}
