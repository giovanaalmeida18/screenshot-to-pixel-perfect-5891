import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminToolbar, EstadoVazio } from "@/components/admin/AdminShared";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { cursosDoProjeto } from "@/lib/data/constants";
import { adminUsuariosQuery } from "@/lib/data/queries";
import type { PerfilExAluno } from "@/lib/data/types";
import { formatarData } from "@/lib/format";
import { formatarTelefone } from "@/lib/validation";

export function AdminUsuarios() {
  const queryClient = useQueryClient();
  const { data: usuarios = [] } = useQuery(adminUsuariosQuery);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<PerfilExAluno | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [curso, setCurso] = useState("");
  const [salvando, setSalvando] = useState(false);

  const lista = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase()),
  );

  const abrirEdicao = (u: PerfilExAluno) => {
    setEditando(u);
    setNome(u.nome);
    setTelefone(u.telefone ?? "");
    setCurso(u.curso ?? "");
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!editando) return;
    setSalvando(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: nome.trim(), phone: telefone || null, course_taken: curso || null, updated_at: new Date().toISOString() })
      .eq("id", editando.id);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar. Tente novamente.");
      return;
    }
    toast.success("Cadastro atualizado!");
    setEditando(null);
    await queryClient.invalidateQueries({ queryKey: ["admin", "usuarios"] });
  };

  return (
    <div>
      <AdminToolbar
        placeholder="Buscar ex-aluno por nome ou e-mail"
        acao="Atualizar lista"
        onAcao={() => void queryClient.invalidateQueries({ queryKey: ["admin", "usuarios"] })}
        busca={busca}
        onBusca={setBusca}
      />
      {lista.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead className="hidden sm:table-cell">Curso</TableHead>
                <TableHead className="hidden lg:table-cell">Desde</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell className="hidden md:table-cell">{u.email}</TableCell>
                  <TableCell className="hidden lg:table-cell">{u.telefone ?? "—"}</TableCell>
                  <TableCell className="hidden sm:table-cell">{u.curso ?? "—"}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatarData(u.membroDesde)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => abrirEdicao(u)}>
                      <Pencil aria-hidden="true" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EstadoVazio
          icon={Users}
          titulo="Nenhum ex-aluno encontrado"
          descricao="Os ex-alunos aparecem aqui depois de criarem a conta na tela de cadastro."
        />
      )}

      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar ex-aluno</DialogTitle>
            <DialogDescription>Atualize os dados cadastrais. O e-mail de acesso não pode ser alterado aqui.</DialogDescription>
          </DialogHeader>
          <form onSubmit={salvar} noValidate className="space-y-4">
            <FormField id="adm-nome" label="Nome completo">
              <Input id="adm-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </FormField>
            <FormField id="adm-telefone" label="Telefone">
              <Input
                id="adm-telefone"
                type="tel"
                inputMode="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              />
            </FormField>
            <FormField id="adm-curso" label="Curso realizado">
              <Select value={curso} onValueChange={setCurso}>
                <SelectTrigger id="adm-curso" className="h-12 rounded-xl border-2 text-base">
                  <SelectValue placeholder="Escolha o curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursosDoProjeto.map((c) => (
                    <SelectItem key={c} value={c} className="py-3 text-base">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
