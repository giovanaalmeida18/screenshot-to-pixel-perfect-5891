// Camada de acesso a dados. Hoje retorna dados demonstrativos;
// na integração futura, troque o corpo de cada função por consultas ao banco
// mantendo as mesmas chaves e formatos de retorno.
import { queryOptions } from "@tanstack/react-query";

import * as demo from "./demo";

const resolve = <T,>(value: T) => Promise.resolve(value);

export const categoriasQuery = queryOptions({
  queryKey: ["categorias"],
  queryFn: () => resolve(demo.categorias),
});

export const materiaisQuery = queryOptions({
  queryKey: ["materiais"],
  queryFn: () => resolve(demo.materiais),
});

export const comunicadosQuery = queryOptions({
  queryKey: ["comunicados"],
  queryFn: () => resolve(demo.comunicados),
});

export const oportunidadesQuery = queryOptions({
  queryKey: ["oportunidades"],
  queryFn: () => resolve(demo.oportunidades),
});

export const cursosRealizadosQuery = queryOptions({
  queryKey: ["cursos-realizados"],
  queryFn: () => resolve(demo.cursosRealizados),
});

export const participacoesQuery = queryOptions({
  queryKey: ["participacoes"],
  queryFn: () => resolve(demo.participacoes),
});

export const perfilQuery = queryOptions({
  queryKey: ["perfil"],
  queryFn: () => resolve(demo.perfilDemo),
});

export const resumoAdminQuery = queryOptions({
  queryKey: ["admin", "resumo"],
  queryFn: () => resolve(demo.resumoAdmin),
});
