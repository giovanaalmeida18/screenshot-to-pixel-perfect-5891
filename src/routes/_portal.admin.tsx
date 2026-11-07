import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Megaphone, Settings, ShieldCheck, Users, type LucideIcon } from "lucide-react";

import { AdminCertificados } from "@/components/admin/AdminCertificados";
import { AdminComunicados } from "@/components/admin/AdminComunicados";
import { AdminCursos } from "@/components/admin/AdminCursos";
import { AdminMateriais } from "@/components/admin/AdminMateriais";
import { AdminOportunidades } from "@/components/admin/AdminOportunidades";
import { AdminUsuarios } from "@/components/admin/AdminUsuarios";
import { AdminVinculos } from "@/components/admin/AdminVinculos";
import { IconTile, PageHeader, type Tone } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsuarioAtual, usuarioEhAdmin } from "@/lib/auth";
import { resumoAdminQuery } from "@/lib/data/queries";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_portal/admin")({
  head: () => pageHead("Administração", "Painel da equipe do Projeto Inclus para gerenciar usuários, cursos, materiais e comunicados."),
  beforeLoad: async () => {
    const user = await getUsuarioAtual();
    if (!user) throw redirect({ to: "/entrar" });
    if (!(await usuarioEhAdmin(user.id))) throw redirect({ to: "/painel" });
  },
  component: Admin,
});

const abas = [
  ["usuarios", "Usuários"] as const,
  ["cursos", "Cursos"] as const,
  ["vinculos", "Vínculos"] as const,
  ["materiais", "Materiais"] as const,
  ["comunicados", "Comunicados"] as const,
  ["certificados", "Certificados"] as const,
  ["oportunidades", "Oportunidades"] as const,
];

function Admin() {
  const { data: resumo } = useQuery(resumoAdminQuery);

  const cards: { label: string; value: number; icon: LucideIcon; tone: Tone }[] = [
    { label: "Usuários", value: resumo?.usuarios ?? 0, icon: Users, tone: "blue" },
    { label: "Cursos", value: resumo?.cursos ?? 0, icon: GraduationCap, tone: "teal" },
    { label: "Materiais", value: resumo?.materiais ?? 0, icon: BookOpen, tone: "orange" },
    { label: "Comunicados", value: resumo?.comunicados ?? 0, icon: Megaphone, tone: "yellow" },
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
          {abas.map(([v, l]) => (
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
            <AdminUsuarios />
          </TabsContent>
          <TabsContent value="cursos" className="mt-0">
            <AdminCursos />
          </TabsContent>
          <TabsContent value="vinculos" className="mt-0">
            <AdminVinculos />
          </TabsContent>
          <TabsContent value="materiais" className="mt-0">
            <AdminMateriais />
          </TabsContent>
          <TabsContent value="comunicados" className="mt-0">
            <AdminComunicados />
          </TabsContent>
          <TabsContent value="certificados" className="mt-0">
            <AdminCertificados />
          </TabsContent>
          <TabsContent value="oportunidades" className="mt-0">
            <AdminOportunidades />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
