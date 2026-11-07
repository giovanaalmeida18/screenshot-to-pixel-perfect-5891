import { useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, GraduationCap, Mail, Pencil, Phone, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/FormField";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { meusCursosQuery, perfilQuery } from "@/lib/data/queries";
import { formatarData } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { formatarTelefone } from "@/lib/validation";

export const Route = createFileRoute("/_portal/perfil")({
  head: () => pageHead("Meu perfil", "Seus dados e cursos realizados no Projeto Inclus."),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(perfilQuery),
      context.queryClient.ensureQueryData(meusCursosQuery),
    ]),
  component: Perfil,
});

const statusLabel: Record<string, string> = {
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

function Perfil() {
  const queryClient = useQueryClient();
  const [{ data: perfil }, { data: cursos }] = useSuspenseQueries({
    queries: [perfilQuery, meusCursosQuery],
  });
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(perfil.nome);
  const [telefone, setTelefone] = useState(perfil.telefone ?? "");
  const [erroNome, setErroNome] = useState<string>();
  const [salvando, setSalvando] = useState(false);

  const abrirEdicao = () => {
    setNome(perfil.nome);
    setTelefone(perfil.telefone ?? "");
    setErroNome(undefined);
    setEditando(true);
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (nome.trim().split(/\s+/).filter(Boolean).length < 2) {
      setErroNome("Digite seu nome completo (nome e sobrenome).");
      return;
    }
    setSalvando(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: nome.trim(), phone: telefone || null, updated_at: new Date().toISOString() })
      .eq("id", perfil.id);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar. Tente novamente.");
      return;
    }
    toast.success("Dados atualizados!");
    setEditando(false);
    await queryClient.invalidateQueries({ queryKey: ["perfil"] });
  };

  const dados = [
    { icon: Mail, label: "E-mail", value: perfil.email },
    { icon: Phone, label: "Telefone", value: perfil.telefone || "Não informado" },
    { icon: CalendarCheck, label: "No Inclus Conecta desde", value: formatarData(perfil.membroDesde) },
  ];

  return (
    <div>
      <PageHeader title="Meu perfil" icon={UserRound}>
        <Button variant="outline" onClick={abrirEdicao}>
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
            {perfil.curso && (
              <div className="flex items-start gap-3">
                <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="text-sm text-muted-foreground">Curso realizado no Projeto Inclus</dt>
                  <dd className="text-base font-medium text-foreground">{perfil.curso}</dd>
                </div>
              </div>
            )}
          </dl>
        </section>

        <section aria-labelledby="cursos" className="rounded-3xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <h2 id="cursos" className="text-lg font-bold text-foreground">
              Cursos realizados
            </h2>
            <Link to="/cursos" className="text-sm font-semibold text-primary">
              Ver todos
            </Link>
          </div>
          {cursos.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {cursos.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-surface-blue p-3">
                  <GraduationCap className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex-1 text-base font-medium text-foreground">{c.nome}</span>
                  <span className="text-sm text-muted-foreground">
                    {statusLabel[c.status] ?? c.status}
                    {c.cargaHoraria ? ` · ${c.cargaHoraria}h` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-2xl bg-muted p-4 text-base text-muted-foreground">
              Ainda não há cursos vinculados à sua conta. A equipe do projeto registra os vínculos conforme as
              turmas são concluídas.
            </p>
          )}
        </section>
      </div>

      <Dialog open={editando} onOpenChange={setEditando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar meus dados</DialogTitle>
            <DialogDescription>Atualize seu nome e telefone. O e-mail de acesso não pode ser alterado aqui.</DialogDescription>
          </DialogHeader>
          <form onSubmit={salvar} noValidate className="space-y-4">
            <FormField id="edit-nome" label="Nome completo" error={erroNome}>
              <Input
                id="edit-nome"
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                aria-invalid={!!erroNome}
                aria-describedby={erroNome ? "edit-nome-erro" : undefined}
              />
            </FormField>
            <FormField id="edit-telefone" label="Telefone (com DDD)">
              <Input
                id="edit-telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditando(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
