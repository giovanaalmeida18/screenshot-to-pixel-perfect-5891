import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Pencil, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminToolbar, ConfirmarExclusao, EstadoVazio } from "@/components/admin/AdminShared";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { oportunidadesQuery } from "@/lib/data/queries";
import type { Oportunidade, OportunidadeTipo } from "@/lib/data/types";
import { formatarData } from "@/lib/format";

const categoriaOpcoes: { value: OportunidadeTipo; label: string }[] = [
  { value: "curso", label: "Curso" },
  { value: "capacitacao", label: "Capacitação" },
  { value: "evento", label: "Evento" },
  { value: "oficina", label: "Oficina" },
  { value: "vaga", label: "Vaga" },
];

export function AdminOportunidades() {
  const queryClient = useQueryClient();
  const { data: oportunidades = [] } = useQuery(oportunidadesQuery);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Oportunidade | "novo" | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<OportunidadeTipo>("curso");
  const [link, setLink] = useState("");
  const [prazo, setPrazo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const lista = oportunidades.filter((o) => o.titulo.toLowerCase().includes(busca.toLowerCase()));

  const abrir = (o: Oportunidade | "novo") => {
    setEditando(o);
    setTitulo(o === "novo" ? "" : o.titulo);
    setDescricao(o === "novo" ? "" : (o.descricao ?? ""));
    setCategoria(o === "novo" ? "curso" : o.tipo);
    setLink(o === "novo" ? "" : (o.linkExterno ?? ""));
    setPrazo(o === "novo" || !o.prazo ? "" : o.prazo.slice(0, 10));
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("Digite o título da oportunidade.");
      return;
    }
    setSalvando(true);
    const dados = {
      title: titulo.trim(),
      description: descricao.trim() || null,
      category: categoria,
      external_link: link.trim() || null,
      deadline: prazo || null,
    };
    const { error } =
      editando === "novo"
        ? await supabase.from("opportunities").insert(dados)
        : await supabase.from("opportunities").update(dados).eq("id", (editando as Oportunidade).id);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar a oportunidade. Tente novamente.");
      return;
    }
    toast.success(editando === "novo" ? "Oportunidade publicada!" : "Oportunidade atualizada!");
    setEditando(null);
    await queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
  };

  const excluir = async (o: Oportunidade) => {
    const { error } = await supabase.from("opportunities").delete().eq("id", o.id);
    if (error) {
      toast.error("Não foi possível excluir a oportunidade.");
      return;
    }
    toast.success("Oportunidade excluída.");
    await queryClient.invalidateQueries({ queryKey: ["oportunidades"] });
  };

  return (
    <div>
      <AdminToolbar
        placeholder="Buscar oportunidade"
        acao="Nova oportunidade"
        onAcao={() => abrir("novo")}
        busca={busca}
        onBusca={setBusca}
      />
      {lista.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                <TableHead className="text-right">Inscrições até</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.titulo}</TableCell>
                  <TableCell className="hidden capitalize sm:table-cell">
                    {categoriaOpcoes.find((c) => c.value === o.tipo)?.label ?? o.tipo}
                  </TableCell>
                  <TableCell className="text-right">{o.prazo ? formatarData(o.prazo) : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => abrir(o)}>
                        <Pencil aria-hidden="true" /> Editar
                      </Button>
                      <ConfirmarExclusao
                        titulo={`Excluir a oportunidade "${o.titulo}"?`}
                        descricao="Ela deixará de aparecer para os ex-alunos."
                        onConfirmar={() => excluir(o)}
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
          icon={Briefcase}
          titulo="Nenhuma oportunidade cadastrada"
          descricao="Divulgue cursos, capacitações, eventos, oficinas e vagas para os ex-alunos."
        />
      )}

      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando === "novo" ? "Nova oportunidade" : "Editar oportunidade"}</DialogTitle>
            <DialogDescription>Informe os dados e, se houver, o link de inscrição e o prazo.</DialogDescription>
          </DialogHeader>
          <form onSubmit={salvar} noValidate className="space-y-4">
            <FormField id="opo-titulo" label="Título">
              <Input id="opo-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </FormField>
            <FormField id="opo-descricao" label="Descrição">
              <Textarea id="opo-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
            </FormField>
            <FormField id="opo-categoria" label="Categoria">
              <Select value={categoria} onValueChange={(v) => setCategoria(v as OportunidadeTipo)}>
                <SelectTrigger id="opo-categoria" className="h-12 rounded-xl border-2 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoriaOpcoes.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="py-3 text-base">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="opo-link" label="Link de inscrição (opcional)">
              <Input
                id="opo-link"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </FormField>
            <FormField id="opo-prazo" label="Prazo de inscrição (opcional)">
              <Input id="opo-prazo" type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
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
