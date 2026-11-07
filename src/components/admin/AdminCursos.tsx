import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminToolbar, ConfirmarExclusao, EstadoVazio } from "@/components/admin/AdminShared";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { cursosQuery } from "@/lib/data/queries";
import type { Curso } from "@/lib/data/types";

export function AdminCursos() {
  const queryClient = useQueryClient();
  const { data: cursos = [] } = useQuery(cursosQuery);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Curso | "novo" | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [salvando, setSalvando] = useState(false);

  const lista = cursos.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()));

  const abrir = (c: Curso | "novo") => {
    setEditando(c);
    setNome(c === "novo" ? "" : c.nome);
    setDescricao(c === "novo" ? "" : (c.descricao ?? ""));
    setCargaHoraria(c === "novo" || c.cargaHoraria == null ? "" : String(c.cargaHoraria));
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Digite o nome do curso.");
      return;
    }
    setSalvando(true);
    const dados = {
      name: nome.trim(),
      description: descricao.trim() || null,
      workload: cargaHoraria ? Number(cargaHoraria) : null,
    };
    const { error } =
      editando === "novo"
        ? await supabase.from("courses").insert(dados)
        : await supabase.from("courses").update(dados).eq("id", (editando as Curso).id);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar o curso. Tente novamente.");
      return;
    }
    toast.success(editando === "novo" ? "Curso cadastrado!" : "Curso atualizado!");
    setEditando(null);
    await queryClient.invalidateQueries({ queryKey: ["cursos"] });
  };

  const excluir = async (c: Curso) => {
    const { error } = await supabase.from("courses").delete().eq("id", c.id);
    if (error) {
      toast.error("Não foi possível excluir. Verifique se há vínculos ou certificados usando este curso.");
      return;
    }
    toast.success("Curso excluído.");
    await queryClient.invalidateQueries({ queryKey: ["cursos"] });
  };

  return (
    <div>
      <AdminToolbar placeholder="Buscar curso" acao="Novo curso" onAcao={() => abrir("novo")} busca={busca} onBusca={setBusca} />
      {lista.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead className="hidden sm:table-cell">Descrição</TableHead>
                <TableHead className="text-right">Carga horária</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell className="hidden max-w-xs truncate sm:table-cell">{c.descricao ?? "—"}</TableCell>
                  <TableCell className="text-right">{c.cargaHoraria != null ? `${c.cargaHoraria}h` : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => abrir(c)}>
                        <Pencil aria-hidden="true" /> Editar
                      </Button>
                      <ConfirmarExclusao
                        titulo={`Excluir o curso "${c.nome}"?`}
                        descricao="Esta ação não pode ser desfeita. Vínculos e certificados ligados a este curso também serão removidos."
                        onConfirmar={() => excluir(c)}
                      >
                        <Button variant="outline" size="sm">
                          <Trash2 aria-hidden="true" /> Excluir
                        </Button>
                      </ConfirmarExclusao>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EstadoVazio
          icon={GraduationCap}
          titulo="Nenhum curso cadastrado"
          descricao="Cadastre os cursos do Projeto Inclus para vinculá-los aos ex-alunos e emitir certificados."
        />
      )}

      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando === "novo" ? "Novo curso" : "Editar curso"}</DialogTitle>
            <DialogDescription>Preencha as informações da formação.</DialogDescription>
          </DialogHeader>
          <form onSubmit={salvar} noValidate className="space-y-4">
            <FormField id="curso-nome" label="Nome do curso">
              <Input id="curso-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </FormField>
            <FormField id="curso-descricao" label="Descrição">
              <Textarea id="curso-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
            </FormField>
            <FormField id="curso-carga" label="Carga horária (horas)">
              <Input
                id="curso-carga"
                type="number"
                inputMode="numeric"
                min={1}
                value={cargaHoraria}
                onChange={(e) => setCargaHoraria(e.target.value)}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditando(null)}>
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
