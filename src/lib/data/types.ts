// Tipos de domínio do Inclus Conecta.
// Mantidos próximos do formato de tabelas para facilitar a futura integração com o banco de dados.

export type MaterialTipo = "apostila" | "video" | "tutorial";

export interface Categoria {
  id: string;
  nome: string;
  descricao: string;
}

export interface Material {
  id: string;
  titulo: string;
  tipo: MaterialTipo;
  categoriaId: string;
  duracao?: string;
  paginas?: number;
}

export interface Comunicado {
  id: string;
  titulo: string;
  resumo: string;
  categoria: "aviso" | "noticia" | "evento";
  publicadoEm: string; // ISO date
  destaque?: boolean;
}

export type OportunidadeTipo = "curso" | "capacitacao" | "evento" | "vaga";

export interface Oportunidade {
  id: string;
  titulo: string;
  tipo: OportunidadeTipo;
  instituicao: string;
  modalidade: "presencial" | "online" | "híbrido";
  prazo: string; // ISO date
  descricao: string;
}

export interface CursoRealizado {
  id: string;
  nome: string;
  turma: string;
  cargaHoraria: number;
  concluidoEm: string; // ISO date
  certificadoDisponivel: boolean;
}

export interface Participacao {
  id: string;
  titulo: string;
  data: string; // ISO date
  tipo: "curso" | "evento" | "oficina";
}

export interface PerfilExAluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  membroDesde: string; // ISO date
}

export interface ResumoAdmin {
  usuarios: number;
  cursos: number;
  materiais: number;
  comunicados: number;
}
