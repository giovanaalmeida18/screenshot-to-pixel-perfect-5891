// Camada de acesso a dados: todas as leituras passam por estes queryOptions.
// As políticas de segurança (RLS) do banco garantem que cada usuário só vê
// os próprios dados pessoais; conteúdos institucionais são visíveis a todos
// os usuários autenticados.
import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import type {
  Certificado,
  Comunicado,
  Curso,
  CursoRealizado,
  Material,
  Oportunidade,
  PerfilExAluno,
  ResumoAdmin,
  VinculoCurso,
} from "./types";

async function must<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data as T;
}

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },
  staleTime: 60_000,
});

export const perfilQuery = queryOptions({
  queryKey: ["perfil"],
  queryFn: async (): Promise<PerfilExAluno> => {
    const row = await must(supabase.from("profiles").select("*").single());
    if (!row) throw new Error("Perfil não encontrado.");
    return {
      id: row.id,
      nome: row.full_name,
      email: row.email,
      telefone: row.phone,
      curso: row.course_taken,
      membroDesde: row.created_at,
    };
  },
});

export const isAdminQuery = queryOptions({
  queryKey: ["eh-admin"],
  queryFn: async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return false;
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    return !!data;
  },
  staleTime: 60_000,
});

export const materiaisQuery = queryOptions({
  queryKey: ["materiais"],
  queryFn: async (): Promise<Material[]> => {
    const rows = await must(supabase.from("materials").select("*").order("published_at", { ascending: false }));
    return rows.map((m) => ({
      id: m.id,
      titulo: m.title,
      descricao: m.description,
      tipo: (m.content_type as Material["tipo"]) ?? "apostila",
      categoria: m.category,
      filePath: m.file_path,
      externalUrl: m.external_url,
      publicadoEm: m.published_at,
    }));
  },
});

export const comunicadosQuery = queryOptions({
  queryKey: ["comunicados"],
  queryFn: async (): Promise<Comunicado[]> => {
    const rows = await must(supabase.from("announcements").select("*").order("publication_date", { ascending: false }));
    return rows.map((c) => ({
      id: c.id,
      titulo: c.title,
      resumo: c.description,
      conteudo: c.content,
      categoria: (c.category as Comunicado["categoria"]) ?? "aviso",
      publicadoEm: c.publication_date,
    }));
  },
});

export const oportunidadesQuery = queryOptions({
  queryKey: ["oportunidades"],
  queryFn: async (): Promise<Oportunidade[]> => {
    const rows = await must(supabase.from("opportunities").select("*").order("created_at", { ascending: false }));
    return rows.map((o) => ({
      id: o.id,
      titulo: o.title,
      descricao: o.description,
      tipo: (o.category as Oportunidade["tipo"]) ?? "curso",
      linkExterno: o.external_link,
      prazo: o.deadline,
    }));
  },
});

export const cursosQuery = queryOptions({
  queryKey: ["cursos"],
  queryFn: async (): Promise<Curso[]> => {
    const rows = await must(supabase.from("courses").select("*").order("name"));
    return rows.map((c) => ({ id: c.id, nome: c.name, descricao: c.description, cargaHoraria: c.workload }));
  },
});

export const certificadosQuery = queryOptions({
  queryKey: ["certificados"],
  queryFn: async (): Promise<Certificado[]> => {
    const rows = await must(
      supabase.from("certificates").select("id, file_path, issue_date, courses(name)").order("issue_date", { ascending: false }),
    );
    return rows.map((c) => ({
      id: c.id,
      cursoNome: (c.courses as { name: string } | null)?.name ?? "Curso",
      filePath: c.file_path,
      emitidoEm: c.issue_date,
    }));
  },
});

export const meusCursosQuery = queryOptions({
  queryKey: ["meus-cursos"],
  queryFn: async (): Promise<CursoRealizado[]> => {
    const [vinculos, certificados] = await Promise.all([
      must(
        supabase
          .from("student_courses")
          .select("id, course_id, participation_status, completion_date, courses(name, description, workload)")
          .order("created_at", { ascending: false }),
      ),
      must(supabase.from("certificates").select("id, course_id, file_path, issue_date")),
    ]);
    return vinculos.map((v) => {
      const curso = v.courses as { name: string; description: string | null; workload: number | null } | null;
      const cert = certificados.find((c) => c.course_id === v.course_id);
      return {
        id: v.id,
        cursoId: v.course_id,
        nome: curso?.name ?? "Curso",
        descricao: curso?.description ?? null,
        cargaHoraria: curso?.workload ?? null,
        status: v.participation_status,
        concluidoEm: v.completion_date,
        certificado: cert
          ? { id: cert.id, cursoNome: curso?.name ?? "Curso", filePath: cert.file_path, emitidoEm: cert.issue_date }
          : null,
      };
    });
  },
});

// ------- Consultas da administração (RLS libera somente para administradores) -------

export const resumoAdminQuery = queryOptions({
  queryKey: ["admin", "resumo"],
  queryFn: async (): Promise<ResumoAdmin> => {
    const contar = async (tabela: "profiles" | "courses" | "materials" | "announcements") => {
      const { count } = await supabase.from(tabela).select("id", { count: "exact", head: true });
      return count ?? 0;
    };
    const [usuarios, cursos, materiais, comunicados] = await Promise.all([
      contar("profiles"),
      contar("courses"),
      contar("materials"),
      contar("announcements"),
    ]);
    return { usuarios, cursos, materiais, comunicados };
  },
});

export const adminUsuariosQuery = queryOptions({
  queryKey: ["admin", "usuarios"],
  queryFn: async (): Promise<PerfilExAluno[]> => {
    const rows = await must(supabase.from("profiles").select("*").order("created_at", { ascending: false }));
    return rows.map((p) => ({
      id: p.id,
      nome: p.full_name,
      email: p.email,
      telefone: p.phone,
      curso: p.course_taken,
      membroDesde: p.created_at,
    }));
  },
});

export const adminVinculosQuery = queryOptions({
  queryKey: ["admin", "vinculos"],
  queryFn: async (): Promise<VinculoCurso[]> => {
    const rows = await must(
      supabase
        .from("student_courses")
        .select("id, student_id, course_id, participation_status, completion_date, profiles(full_name), courses(name)")
        .order("created_at", { ascending: false }),
    );
    return rows.map((v) => ({
      id: v.id,
      alunoId: v.student_id,
      alunoNome: (v.profiles as { full_name: string } | null)?.full_name ?? "—",
      cursoId: v.course_id,
      cursoNome: (v.courses as { name: string } | null)?.name ?? "—",
      status: v.participation_status,
      concluidoEm: v.completion_date,
    }));
  },
});

export const adminCertificadosQuery = queryOptions({
  queryKey: ["admin", "certificados"],
  queryFn: async () => {
    const rows = await must(
      supabase
        .from("certificates")
        .select("id, student_id, course_id, file_path, issue_date, profiles(full_name), courses(name)")
        .order("issue_date", { ascending: false }),
    );
    return rows.map((c) => ({
      id: c.id,
      alunoId: c.student_id,
      alunoNome: (c.profiles as { full_name: string } | null)?.full_name ?? "—",
      cursoId: c.course_id,
      cursoNome: (c.courses as { name: string } | null)?.name ?? "—",
      filePath: c.file_path,
      emitidoEm: c.issue_date,
    }));
  },
});
