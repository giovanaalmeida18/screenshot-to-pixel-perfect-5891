import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Pencil, Trash2 } from "lucide-react";
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
import { comunicadosQuery } from "@/lib/data/queries";
import type { Comunicado } from "@/lib/data/types";
import { formatarData } from "@/lib/format";

const categoriaOpcoes: { value: Comunicado["categoria"]; label: string }[] = [
  { value: "aviso", label: "Aviso" },
  { value: "noticia", label: "Notícia" },
  { value: "evento", label: "Evento" },
];

export function AdminComunicados() {
  const queryClient = useQueryClient();
  const { data: comunicados = [] } = useQuery(comunicadosQuery);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Comunicado | "novo" | null>(null);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState<Comunicado["categoria"]>("aviso");
  const [data, setData] = useState("");
  const [salvando, setSalvando] = useState(false);

  const lista = comunicados.filter((c) => c.titulo.toLowerCase().includes(busca.toLowerCase()));

  const abrir = (c: Comunicado | "novo") => {
    setEditando(c);
    setTitulo(c === "novo" ? "" : c.titulo);
    setResumo(c === "novo" ? "" : c.resumo);
    setConteudo(c === "novo" ? "" : (c.conteudo ?? ""));
    setCategoria(c === "novo" ? "aviso" : c.categoria);
    setData(c === "novo" ? new Date().toISOString().slice(0, 10) : c.publicadoEm.slice(0, 10));
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !resumo.trim()) {
      toast.error("Preencha o título e o resumo.");
      return;
    }
    setSalvando(true);
    const dados = {
      title: titulo.trim(),
      description: resumo.trim(),
      content: conteudo.trim() || null,
      category: categoria,
      publication_date: data || new Date().toISOString().slice(0, 10),
    };
    const { error } =
      editando === "novo"
        ? await supabase.from("announcements").insert(dados)
        : await supabase.from("announcements").update(dados).eq("id", (editando as Comunicado).id);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar o comunicado. Tente novamente.");
      return;
    }
    toast.success(editando === "novo" ? "Comunicado publicado!" : "Comunicado atualizado!");
    setEditando(null);
    await queryClient.invalidateQueries({ queryKey: ["comunicados"] });
  };

  const excluir = async (c: Comunicado) => {
    const { error } = await supabase.from("announcements").delete().eq("id", c.id);
    if (error) {
      toast.error("Não foi possível excluir o comunicado.");
      return;
    }
    toast.success("Comunicado excluído.");
    await queryClient.invalidateQueries({ queryKey: ["comunicados"] });
  };

  return (
    <div>
      <AdminToolbar
        placeholder="Buscar comunicado"
        acao="Publicar comunicado"
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
                <TableHead className="text-right">Publicado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.titulo}</TableCell>
                  <TableCell className="hidden capitalize sm:table-cell">{c.categoria}</TableCell>
                  <TableCell className="text-right">{formatarData(c.publicadoEm)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => abrir(c)}>
                        <Pencil aria-hidden="true" /> Editar
                      </Button>
                      <ConfirmarExclusao
                        titulo={`Excluir o comunicado "${c.titulo}"?`}
                        descricao="O comunicado deixará de aparecer para os ex-alunos."
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
          icon={Megaphone}
          titulo="Nenhum comunicado publicado"
          descricao="Publique avisos, notícias e eventos para manter os ex-alunos informados."
        />
      )}

      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando === "novo" ? "Publicar comunicado" : "Editar comunicado"}</DialogTitle>
            <DialogDescription>O resumo aparece no cartão; o conteúdo completo abre ao clicar em "Ler comunicado completo".</DialogDescription>
          </DialogHeader>
          <form onSubmit={salvar} noValidate className="space-y-4">
            <FormField id="com-titulo" label="Título">
              <Input id="com-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </FormField>
            <FormField id="com-resumo" label="Resumo">
              <Textarea id="com-resumo" value={resumo} onChange={(e) => setResumo(e.target.value)} rows={2} />
            </FormField>
            <FormField id="com-conteudo" label="Conteúdo completo (opcional)">
              <Textarea id="com-conteudo" value={conteudo} onChange={(e) => setConteudo(e.target.value)} rows={5} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="com-categoria" label="Categoria">
                <Select value={categoria} onValueChange={(v) => setCategoria(v as Comunicado["categoria"])}>
                  <SelectTrigger id="com-categoria" className="h-12 rounded-xl border-2 text-base">
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
              <FormField id="com-data" label="Data de publicação">
                <Input id="com-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
              </FormField>
            </div>
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
