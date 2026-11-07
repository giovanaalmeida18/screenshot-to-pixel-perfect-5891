// Tipos de domínio do Inclus Conecta, mapeados a partir das tabelas do banco de dados.

export type MaterialTipo = "apostila" | "video" | "tutorial";

export interface Material {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: MaterialTipo;
  categoria: string;
  filePath: string | null;
  externalUrl: string | null;
  publicadoEm: string; // ISO date
}

export interface Comunicado {
  id: string;
  titulo: string;
  resumo: string;
  conteudo: string | null;
  categoria: "aviso" | "noticia" | "evento";
  publicadoEm: string; // ISO date
}

export type OportunidadeTipo = "curso" | "capacitacao" | "evento" | "vaga" | "oficina";

export interface Oportunidade {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: OportunidadeTipo;
  linkExterno: string | null;
  prazo: string | null; // ISO date
}

export interface Certificado {
  id: string;
  cursoNome: string;
  filePath: string | null;
  emitidoEm: string; // ISO date
}

export interface CursoRealizado {
  id: string; // id do vínculo (student_courses)
  cursoId: string;
  nome: string;
  descricao: string | null;
  cargaHoraria: number | null;
  status: string;
  concluidoEm: string | null; // ISO date
  certificado: Certificado | null;
}

export interface PerfilExAluno {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  curso: string | null;
  membroDesde: string; // ISO date
}

export interface Curso {
  id: string;
  nome: string;
  descricao: string | null;
  cargaHoraria: number | null;
}

export interface VinculoCurso {
  id: string;
  alunoId: string;
  alunoNome: string;
  cursoId: string;
  cursoNome: string;
  status: string;
  concluidoEm: string | null;
}

export interface ResumoAdmin {
  usuarios: number;
  cursos: number;
  materiais: number;
  comunicados: number;
}
