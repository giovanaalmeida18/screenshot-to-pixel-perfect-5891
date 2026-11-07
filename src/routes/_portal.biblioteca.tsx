import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, FileText, MousePointerClick, PlayCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { baixarArquivo } from "@/lib/auth";
import { categoriasMateriais } from "@/lib/data/constants";
import { materiaisQuery } from "@/lib/data/queries";
import type { Material, MaterialTipo } from "@/lib/data/types";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_portal/biblioteca")({
  head: () => pageHead("Biblioteca digital", "Apostilas, vídeos e tutoriais organizados por categoria para ex-alunos do Projeto Inclus."),
  loader: ({ context }) => context.queryClient.ensureQueryData(materiaisQuery),
  component: Biblioteca,
});

const tipos: Record<MaterialTipo, { label: string; icon: typeof FileText; tile: string; acao: string }> = {
  apostila: { label: "Apostila", icon: FileText, tile: "bg-brand-orange text-ink", acao: "Abrir apostila" },
  video: { label: "Vídeo", icon: PlayCircle, tile: "bg-primary text-primary-foreground", acao: "Assistir" },
  tutorial: { label: "Tutorial", icon: MousePointerClick, tile: "bg-brand-teal text-ink", acao: "Ver passo a passo" },
};

function Biblioteca() {
  const { data: materiais } = useSuspenseQuery(materiaisQuery);
  const [categoria, setCategoria] = useState<string>("todas");
  const [tipo, setTipo] = useState<MaterialTipo | "todos">("todos");
  const [busca, setBusca] = useState("");

  const categorias = useMemo(() => {
    const usadas = new Set(materiais.map((m) => m.categoria));
    return categoriasMateriais.filter((c) => usadas.has(c));
  }, [materiais]);

  const filtrados = useMemo(
    () =>
      materiais.filter(
        (m) =>
          (categoria === "todas" || m.categoria === categoria) &&
          (tipo === "todos" || m.tipo === tipo) &&
          (m.titulo.toLowerCase().includes(busca.toLowerCase()) ||
            (m.descricao ?? "").toLowerCase().includes(busca.toLowerCase())),
      ),
    [materiais, categoria, tipo, busca],
  );

  const abrir = async (m: Material) => {
    if (m.externalUrl) {
      window.open(m.externalUrl, "_blank", "noopener");
      return;
    }
    if (m.filePath) {
      try {
        await baixarArquivo("materiais", m.filePath);
      } catch {
        toast.error("Não foi possível abrir o material. Tente novamente.");
      }
      return;
    }
    toast.info("Este material ainda não tem arquivo disponível.");
  };

  const chip = (ativo: boolean) =>
    cn(
      "min-h-11 shrink-0 rounded-full border-2 px-4 text-sm font-semibold transition-colors",
      ativo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary",
    );

  return (
    <div>
      <PageHeader
        title="Biblioteca digital"
        description="Revise o que aprendeu com materiais separados por tema."
        icon={BookOpen}
      />

      <div className="space-y-4 rounded-3xl border bg-card p-4 shadow-soft sm:p-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Buscar material"
            placeholder="Buscar material"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-12"
          />
        </div>
        {categorias.length > 0 && (
          <div role="group" aria-label="Categorias" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button type="button" className={chip(categoria === "todas")} aria-pressed={categoria === "todas"} onClick={() => setCategoria("todas")}>
              Todas
            </button>
            {categorias.map((c) => (
              <button
                key={c}
                type="button"
                className={chip(categoria === c)}
                aria-pressed={categoria === c}
                onClick={() => setCategoria(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div role="group" aria-label="Tipo de material" className="flex flex-wrap gap-2">
          {(["todos", "apostila", "video", "tutorial"] as const).map((t) => (
            <button key={t} type="button" className={chip(tipo === t)} aria-pressed={tipo === t} onClick={() => setTipo(t)}>
              {t === "todos" ? "Todos os tipos" : `${tipos[t].label}s`}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-muted-foreground" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? "material encontrado" : "materiais encontrados"}
      </p>
      {filtrados.length > 0 ? (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((m) => {
            const t = tipos[m.tipo] ?? tipos.apostila;
            const Icon = t.icon;
            return (
              <li key={m.id} className="flex flex-col rounded-3xl border bg-card p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl", t.tile)}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="text-sm">
                    <p className="font-bold text-foreground">{t.label}</p>
                    <p className="text-muted-foreground">{m.categoria}</p>
                  </div>
                </div>
                <h3 className="mt-4 flex-1 text-base font-bold text-foreground">{m.titulo}</h3>
                {m.descricao && <p className="mt-2 text-sm text-muted-foreground">{m.descricao}</p>}
                <Button variant="outline" className="mt-4 w-full" onClick={() => abrir(m)}>
                  {t.acao}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 rounded-2xl bg-card p-6 text-center text-base text-muted-foreground">
          {materiais.length === 0
            ? "Ainda não há materiais cadastrados. Quando a equipe publicar apostilas, vídeos e tutoriais, eles aparecerão aqui."
            : "Nenhum material encontrado. Tente outra categoria ou palavra."}
        </p>
      )}
    </div>
  );
}
