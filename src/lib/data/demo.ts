// DADOS DEMONSTRATIVOS — não representam ex-alunos, cursos ou eventos reais.
// Servem apenas para visualizar a estrutura das telas nesta primeira etapa.
import type {
  Categoria,
  Comunicado,
  CursoRealizado,
  Material,
  Oportunidade,
  Participacao,
  PerfilExAluno,
  ResumoAdmin,
} from "./types";

export const categorias: Categoria[] = [
  { id: "informatica", nome: "Informática básica", descricao: "Computador, internet e e-mail" },
  { id: "celular", nome: "Celular no dia a dia", descricao: "Aplicativos, segurança e serviços" },
  { id: "trabalho", nome: "Mundo do trabalho", descricao: "Currículo, entrevista e carreira" },
  { id: "cidadania", nome: "Cidadania digital", descricao: "Serviços públicos e direitos online" },
];

export const materiais: Material[] = [
  { id: "m1", titulo: "Apostila exemplo: primeiros passos no computador", tipo: "apostila", categoriaId: "informatica", paginas: 24 },
  { id: "m2", titulo: "Vídeo exemplo: como criar um e-mail", tipo: "video", categoriaId: "informatica", duracao: "8 min" },
  { id: "m3", titulo: "Tutorial exemplo: organizar arquivos e pastas", tipo: "tutorial", categoriaId: "informatica" },
  { id: "m4", titulo: "Vídeo exemplo: chamadas de vídeo pelo celular", tipo: "video", categoriaId: "celular", duracao: "6 min" },
  { id: "m5", titulo: "Tutorial exemplo: senhas seguras", tipo: "tutorial", categoriaId: "celular" },
  { id: "m6", titulo: "Apostila exemplo: montando seu currículo", tipo: "apostila", categoriaId: "trabalho", paginas: 16 },
  { id: "m7", titulo: "Vídeo exemplo: preparação para entrevistas", tipo: "video", categoriaId: "trabalho", duracao: "12 min" },
  { id: "m8", titulo: "Tutorial exemplo: acessar serviços públicos online", tipo: "tutorial", categoriaId: "cidadania" },
];

export const comunicados: Comunicado[] = [
  { id: "c1", titulo: "Comunicado de exemplo: novas turmas", resumo: "Este é um texto demonstrativo para mostrar como os avisos do Projeto Inclus aparecerão aqui.", categoria: "aviso", publicadoEm: "2026-11-03", destaque: true },
  { id: "c2", titulo: "Notícia de exemplo: encontro de ex-alunos", resumo: "Espaço reservado para notícias publicadas pela equipe do projeto.", categoria: "noticia", publicadoEm: "2026-10-28" },
  { id: "c3", titulo: "Evento de exemplo: oficina aberta", resumo: "Exemplo de card de evento com data, local e informações de inscrição.", categoria: "evento", publicadoEm: "2026-10-20" },
  { id: "c4", titulo: "Aviso de exemplo: atualização da biblioteca", resumo: "Exemplo de aviso sobre novos materiais disponíveis na biblioteca digital.", categoria: "aviso", publicadoEm: "2026-10-12" },
];

export const oportunidades: Oportunidade[] = [
  { id: "o1", titulo: "Curso de exemplo: Excel essencial", tipo: "curso", instituicao: "Instituição parceira (exemplo)", modalidade: "online", prazo: "2026-12-05", descricao: "Card demonstrativo de curso divulgado para ex-alunos." },
  { id: "o2", titulo: "Capacitação de exemplo: atendimento ao público", tipo: "capacitacao", instituicao: "Parceiro (exemplo)", modalidade: "presencial", prazo: "2026-11-30", descricao: "Exemplo de capacitação com carga horária e local." },
  { id: "o3", titulo: "Evento de exemplo: feira de empregabilidade", tipo: "evento", instituicao: "Projeto Inclus (exemplo)", modalidade: "presencial", prazo: "2026-11-22", descricao: "Exemplo de evento aberto à comunidade de ex-alunos." },
  { id: "o4", titulo: "Vaga de exemplo: auxiliar administrativo", tipo: "vaga", instituicao: "Empresa parceira (exemplo)", modalidade: "híbrido", prazo: "2026-12-12", descricao: "Exemplo de oportunidade profissional divulgada pelo projeto." },
];

export const cursosRealizados: CursoRealizado[] = [
  { id: "cr1", nome: "Curso exemplo: Informática básica", turma: "Turma exemplo A", cargaHoraria: 40, concluidoEm: "2025-06-20", certificadoDisponivel: true },
  { id: "cr2", nome: "Curso exemplo: Internet e cidadania", turma: "Turma exemplo B", cargaHoraria: 24, concluidoEm: "2025-11-14", certificadoDisponivel: true },
  { id: "cr3", nome: "Curso exemplo: Celular sem medo", turma: "Turma exemplo C", cargaHoraria: 16, concluidoEm: "2026-04-02", certificadoDisponivel: false },
];

export const participacoes: Participacao[] = [
  { id: "p1", titulo: "Participação exemplo: oficina de currículo", data: "2026-08-15", tipo: "oficina" },
  { id: "p2", titulo: "Participação exemplo: encontro de ex-alunos", data: "2026-05-10", tipo: "evento" },
  { id: "p3", titulo: "Participação exemplo: conclusão de curso", data: "2026-04-02", tipo: "curso" },
];

export const perfilDemo: PerfilExAluno = {
  id: "demo",
  nome: "Ex-aluno(a) de exemplo",
  email: "exemplo@email.com",
  telefone: "(00) 00000-0000",
  cidade: "Cidade exemplo",
  membroDesde: "2025-02-01",
};

export const resumoAdmin: ResumoAdmin = { usuarios: 0, cursos: 0, materiais: 0, comunicados: 0 };

export const cursosDoProjeto = [
  "Informática básica",
  "Internet e cidadania",
  "Celular sem medo",
  "Preparação para o trabalho",
  "Outro",
];
