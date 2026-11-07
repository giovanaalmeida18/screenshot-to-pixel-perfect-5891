import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminToolbar, ConfirmarExclusao, EstadoVazio } from "@/components/admin/AdminShared";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { adminUsuariosQuery, adminVinculosQuery, cursosQuery } from "@/lib/data/queries";
import type { VinculoCurso } from "@/lib/data/types";
import { formatarData } from "@/lib/format";

const statusOpcoes = [
  { value: "em_andamento", label: "Em andamento" },
  { value: "concluido", label: "Concluído" },
];

export function AdminVinculos() {
  const queryClient = useQueryClient();
  const { data: vinculos = [] } = useQuery(adminVinculosQuery);
  const { data: usuarios = [] } = useQuery(adminUsuariosQuery);
  const { data: cursos = [] } = useQuery(cursosQuery);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<VinculoCurso | "novo" | null>(null);
  const [alunoId, setAlunoId] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [status, setStatus] = useState("em_andamento");
  const [conclusao, setConclusao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const lista = vinculos.filter(
    (v) =>
      v.alunoNome.toLowerCase().includes(busca.toLowerCase()) || v.cursoNome.toLowerCase().includes(busca.toLowerCase()),
  );

  const abrir = (v: VinculoCurso | "novo") => {
    setEditando(v);
    setAlunoId(v === "novo" ? "" : v.alunoId);
    setCursoId(v === "novo" ? "" : v.cursoId);
    setStatus(v === "novo" ? "em_andamento" : v.status);
    setConclusao(v === "novo" || !v.concluidoEm ? "" : v.concluidoEm);
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!alunoId || !cursoId) {
      toast.error("Escolha o ex-aluno e o curso.");
      return;
    }
    setSalvando(true);
    const dados = {
      student_id: alunoId,
      course_id: cursoId,
      participation_status: status,
      completion_date: conclusao || null,
    };
    const { error } =
      editando === "novo"
        ? await supabase.from("student_courses").insert(dados)
        : await supabase
            .from("student_courses")
            .update({ participation_status: status, completion_date: conclusao || null })
            .eq("id", (editando as VinculoCurso).id);
    setSalvando(false);
    if (error) {
      toast.error(
        error.message.includes("duplicate")
          ? "Este ex-aluno já está vinculado a este curso."
          : "Não foi possível salvar o vínculo. Tente novamente.",
      );
      return;
    }
    toast.success(editando === "novo" ? "Vínculo criado!" : "Vínculo atualizado!");
    setEditando(null);
    await queryClient.invalidateQueries({ queryKey: ["admin", "vinculos"] });
  };

  const excluir = async (v: VinculoCurso) => {
    const { error } = await supabase.from("student_courses").delete().eq("id", v.id);
    if (error) {
      toast.error("Não foi possível excluir o vínculo.");
      return;
    }
    toast.success("Vínculo excluído.");
    await queryClient.invalidateQueries({ queryKey: ["admin", "vinculos"] });
  };

  return (
    <div>
      <AdminToolbar
        placeholder="Buscar por aluno ou curso"
        acao="Vincular ex-aluno a curso"
        onAcao={() => abrir("novo")}
        busca={busca}
        onBusca={setBusca}
      />
      {lista.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ex-aluno</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead className="hidden sm:table-cell">Situação</TableHead>
                <TableHead className="hidden md:table-cell">Conclusão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.alunoNome}</TableCell>
                  <TableCell>{v.cursoNome}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {statusOpcoes.find((s) => s.value === v.status)?.label ?? v.status}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{v.concluidoEm ? formatarData(v.concluidoEm) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => abrir(v)}>
                        <Pencil aria-hidden="true" /> Editar
                      </Button>
                      <ConfirmarExclusao
                        titulo={`Remover o vínculo de ${v.alunoNome} com ${v.cursoNome}?`}
                        descricao="O curso deixará de aparecer no painel deste ex-aluno."
                        onConfirmar={() => excluir(v)}
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
          icon={Link2}
          titulo="Nenhum vínculo cadastrado"
          descricao="Vincule ex-alunos aos cursos que eles realizaram para liberar o histórico e os certificados."
        />
      )}

      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando === "novo" ? "Vincular ex-aluno a curso" : "Editar vínculo"}</DialogTitle>
            <DialogDescription>Relacione o ex-aluno ao curso realizado e informe a situação.</DialogDescription>
          </DialogHeader>
          <form onSubmit={salvar} noValidate className="space-y-4">
            <FormField id="vinc-aluno" label="Ex-aluno">
              <Select value={alunoId} onValueChange={setAlunoId} disabled={editando !== "novo"}>
                <SelectTrigger id="vinc-aluno" className="h-12 rounded-xl border-2 text-base">
                  <SelectValue placeholder="Escolha o ex-aluno" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="py-3 text-base">
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="vinc-curso" label="Curso">
              <Select value={cursoId} onValueChange={setCursoId} disabled={editando !== "novo"}>
                <SelectTrigger id="vinc-curso" className="h-12 rounded-xl border-2 text-base">
                  <SelectValue placeholder="Escolha o curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="py-3 text-base">
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="vinc-status" label="Situação">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="vinc-status" className="h-12 rounded-xl border-2 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOpcoes.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="py-3 text-base">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="vinc-conclusao" label="Data de conclusão (opcional)">
              <Input id="vinc-conclusao" type="date" value={conclusao} onChange={(e) => setConclusao(e.target.value)} />
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
