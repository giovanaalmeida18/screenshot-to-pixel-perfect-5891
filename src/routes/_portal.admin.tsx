import { useSuspenseQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Megaphone, Plus, Search, Settings, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { DemoNotice } from "@/components/DemoNotice";
import { IconTile, PageHeader, type Tone } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { comunicadosQuery, cursosRealizadosQuery, materiaisQuery, resumoAdminQuery } from "@/lib/data/queries";
import { formatarData } from "@/lib/format";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_portal/admin")({
  head: () => pageHead("Administração", "Painel da equipe do Projeto Inclus para gerenciar usuários, cursos, materiais e comunicados."),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(resumoAdminQuery),
      context.queryClient.ensureQueryData(cursosRealizadosQuery),
      context.queryClient.ensureQueryData(materiaisQuery),
      context.queryClient.ensureQueryData(comunicadosQuery),
    ]),
  component: Admin,
});

const emBreve = () => toast.info("Esta ação ficará disponível quando a plataforma for conectada.");

function Toolbar({ placeholder, acao }: { placeholder: string; acao: string }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input type="search" placeholder={placeholder} aria-label={placeholder} className="pl-12" />
      </div>
      <Button onClick={emBreve}>
        <Plus aria-hidden="true" /> {acao}
      </Button>
    </div>
  );
}

function Admin() {
  const [{ data: resumo }, { data: cursos }, { data: materiais }, { data: comunicados }] = useSuspenseQueries({
    queries: [resumoAdminQuery, cursosRealizadosQuery, materiaisQuery, comunicadosQuery],
  });

  const cards: { label: string; value: number; icon: LucideIcon; tone: Tone }[] = [
    { label: "Usuários", value: resumo.usuarios, icon: Users, tone: "blue" },
    { label: "Cursos", value: resumo.cursos, icon: GraduationCap, tone: "teal" },
    { label: "Materiais", value: resumo.materiais, icon: BookOpen, tone: "orange" },
    { label: "Comunicados", value: resumo.comunicados, icon: Megaphone, tone: "yellow" },
  ];

  return (
    <div>
      <PageHeader
        title="Administração"
        description="Área da equipe do Projeto Inclus para gerenciar a plataforma."
        icon={Settings}
      >
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-surface-teal px-3 py-1.5 text-sm font-semibold text-ink">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Acesso restrito à equipe
        </span>
      </PageHeader>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label} className="rounded-3xl border bg-card p-5 shadow-soft">
            <IconTile icon={c.icon} tone={c.tone} className="h-10 w-10 rounded-xl" />
            <p className="mt-3 text-3xl font-extrabold text-foreground">{c.value}</p>
            <p className="text-sm font-medium text-muted-foreground">{c.label} cadastrados</p>
          </li>
        ))}
      </ul>

      <Tabs defaultValue="usuarios" className="mt-8">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-card p-1.5 shadow-soft">
          {[
            ["usuarios", "Usuários"] as const,
            ["cursos", "Cursos"] as const,
            ["materiais", "Materiais"] as const,
            ["comunicados", "Comunicados"] as const,
          ].map(([v, l]) => (
            <TabsTrigger
              key={v}
              value={v}
              className="min-h-11 rounded-xl px-4 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 rounded-3xl border bg-card p-4 shadow-soft sm:p-6">
          <TabsContent value="usuarios" className="mt-0">
            <Toolbar placeholder="Buscar ex-aluno por nome ou e-mail" acao="Convidar ex-aluno" />
            <div className="flex flex-col items-center rounded-2xl border-2 border-dashed p-10 text-center">
              <Users className="h-10 w-10 text-primary" aria-hidden="true" />
              <p className="mt-3 text-lg font-bold text-foreground">Nenhum ex-aluno cadastrado ainda</p>
              <p className="mt-1 max-w-md text-base text-muted-foreground">
                Quando a plataforma for conectada, a lista de ex-alunos aparecerá aqui, com opções de busca e
                gerenciamento.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="cursos" className="mt-0">
            <Toolbar placeholder="Buscar curso" acao="Novo curso" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead className="hidden sm:table-cell">Turma</TableHead>
                  <TableHead className="text-right">Carga horária</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell className="hidden sm:table-cell">{c.turma}</TableCell>
                    <TableCell className="text-right">{c.cargaHoraria}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="materiais" className="mt-0">
            <Toolbar placeholder="Buscar material" acao="Enviar material" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materiais.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.titulo}</TableCell>
                    <TableCell className="text-right capitalize">{m.tipo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="comunicados" className="mt-0">
            <Toolbar placeholder="Buscar comunicado" acao="Publicar comunicado" />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-right">Publicado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comunicados.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.titulo}</TableCell>
                    <TableCell className="text-right">{formatarData(c.publicadoEm, { day: "2-digit", month: "2-digit", year: "numeric" })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </div>
      </Tabs>
      <DemoNotice className="mt-6">
        Estrutura visual da área administrativa. O acesso será restrito à equipe quando a plataforma for conectada.
      </DemoNotice>
    </div>
  );
}
